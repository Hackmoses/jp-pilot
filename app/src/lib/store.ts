import { getQuestions, getQuestionsBySubject } from './data'

export type EventName =
  | 'session_start'
  | 'answer'
  | 'remove_option'
  | 'hint_open'
  | 'player_play'
  | 'player_replay_step'
  | 'ask_open'
  | 'ask_preset'
  | 'read_aloud'
  | 'share_tap'
  | 'report_tap'
  | 'session_end'

type EventData = Record<string, string | number | boolean>

interface Answer {
  questionId: string
  pickedId: string
  correct: boolean
  removedCount: number
  at: number
}

interface LoggedEvent {
  name: EventName
  at: number
  data?: EventData
}

interface SavedState {
  answered: number
  correct: number
  activeDays: string[]
  sessionsStarted: number
  dueByQuestion: Record<string, number>
  remediationByQuestion: Record<string, boolean>
  lastSessionQuestionIds: string[]
  events: LoggedEvent[]
}

type QueueItem = { id: string; review: boolean }

const storageKey = 'jp.progress.v1'
const eventLimit = 500

function loadState(): SavedState {
  try {
    const raw = localStorage.getItem(storageKey)
    const saved = raw ? JSON.parse(raw) as Partial<SavedState> : null
    if (saved &&
        typeof saved.answered === 'number' &&
        typeof saved.correct === 'number' &&
        typeof saved.sessionsStarted === 'number' &&
        Array.isArray(saved.activeDays) &&
        saved.dueByQuestion &&
        typeof saved.dueByQuestion === 'object' &&
        Array.isArray(saved.events)) {
      return {
        answered: saved.answered,
        correct: saved.correct,
        sessionsStarted: saved.sessionsStarted,
        activeDays: saved.activeDays,
        dueByQuestion: saved.dueByQuestion,
        remediationByQuestion: saved.remediationByQuestion ?? restoreRemediation(saved.events),
        lastSessionQuestionIds: saved.lastSessionQuestionIds ?? restoreSessionIds(saved.events),
        events: saved.events.slice(-eventLimit),
      }
    }
  } catch {
    // Storage may be unavailable or unreadable.
  }

  return {
    answered: 0,
    correct: 0,
    activeDays: [],
    sessionsStarted: 0,
    dueByQuestion: {},
    remediationByQuestion: {},
    lastSessionQuestionIds: [],
    events: [],
  }
}

function restoreRemediation(events: LoggedEvent[]): Record<string, boolean> {
  const remediation: Record<string, boolean> = {}
  for (const event of events) {
    if (event.name !== 'answer' || typeof event.data?.questionId !== 'string') continue
    remediation[event.data.questionId] = event.data.correct === false || Number(event.data.removedCount) > 0
  }
  return remediation
}

function restoreSessionIds(events: LoggedEvent[]): string[] {
  const ids = new Set<string>()
  for (const event of events) {
    if (event.name === 'session_start') ids.clear()
    if (typeof event.data?.questionId === 'string') ids.add(event.data.questionId)
  }
  return [...ids]
}

const state = loadState()

function saveState() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(state))
  } catch {
    // Keep the in-memory state when storage is blocked or full.
  }
}

function dayKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function recordAnswer(e: Answer): void {
  state.answered++
  if (e.correct) state.correct++

  const day = dayKey(new Date(e.at))
  if (!state.activeDays.includes(day)) state.activeDays.push(day)

  const scheduled = state.dueByQuestion[e.questionId]
  const earlyReview = scheduled !== undefined && scheduled > state.sessionsStarted &&
    !state.remediationByQuestion[e.questionId]
  if (!e.correct || !earlyReview) {
    const needsRemediation = !e.correct || e.removedCount > 0
    state.remediationByQuestion[e.questionId] = needsRemediation
    state.dueByQuestion[e.questionId] = state.sessionsStarted + (needsRemediation ? 1 : 3)
  }
  saveState()
}

export function getProgress(): {
  answered: number
  correct: number
  streakDays: number
  lastActiveDay: string | null
} {
  const days = state.activeDays.slice().sort()
  const lastActiveDay = days[days.length - 1] ?? null
  let streakDays = 0

  if (lastActiveDay) {
    const cursor = new Date(`${lastActiveDay}T12:00:00`)
    for (let i = days.length - 1; i >= 0 && days[i] === dayKey(cursor); i--) {
      streakDays++
      cursor.setDate(cursor.getDate() - 1)
    }
  }

  return { answered: state.answered, correct: state.correct, streakDays, lastActiveDay }
}

function shuffleInPlace<T>(items: T[]): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[items[i], items[j]] = [items[j], items[i]]
  }
  return items
}

export function getDueQuestionIds(limit: number, subject?: string): QueueItem[] {
  if (!(limit > 0)) return []

  // Select the next session's questions before logging its session_start.
  const nextSession = state.sessionsStarted + 1
  const due: { id: string; session: number }[] = []
  const reviews: { id: string; session: number }[] = []
  const recall: string[] = []
  const calculation: string[] = []
  const pool = subject ? getQuestionsBySubject(subject) : getQuestions()

  for (const question of pool) {
    const session = state.dueByQuestion[question.id]
    if (session === undefined) {
      const unseen = question.type === 'recall' ? recall : calculation
      unseen.push(question.id)
    } else if (state.remediationByQuestion[question.id] && session <= nextSession) {
      due.push({ id: question.id, session })
    } else {
      reviews.push({ id: question.id, session })
    }
  }

  shuffleInPlace(recall)
  shuffleInPlace(calculation)
  shuffleInPlace(due)
  shuffleInPlace(reviews)
  due.sort((a, b) => a.session - b.session)
  reviews.sort((a, b) => a.session - b.session)
  const candidates: QueueItem[] = []
  for (let i = 0; i < recall.length || i < calculation.length; i++) {
    if (i < recall.length) candidates.push({ id: recall[i], review: false })
    if (i < calculation.length) candidates.push({ id: calculation[i], review: false })
  }
  for (const { id, session } of reviews) {
    candidates.push({ id, review: session > nextSession })
  }

  // Due mistakes and assisted answers must return even if they appeared last session.
  const previous = new Set(state.lastSessionQuestionIds)
  return [
    ...due.map(({ id }) => ({ id, review: false })),
    ...candidates.filter(({ id }) => !previous.has(id)),
    ...candidates.filter(({ id }) => previous.has(id)),
  ].slice(0, limit)
}

export function logEvent(name: EventName, data?: EventData): void {
  if (name === 'session_start') {
    state.sessionsStarted++
    state.lastSessionQuestionIds = typeof data?.questionIds === 'string' && data.questionIds
      ? data.questionIds.split(',')
      : []
  }
  state.events.push({ name, at: Date.now(), data: data && { ...data } })
  if (state.events.length > eventLimit) state.events.shift()
  saveState()
}

export function exportLog(): string {
  return JSON.stringify(state.events)
}
