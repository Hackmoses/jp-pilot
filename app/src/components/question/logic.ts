import { getQuestion, getQuestionsBySubject } from '../../lib/data'
import { getDueQuestionIds } from '../../lib/store'
import { getSubject, getSubjectByQuestionId, isSubjectAvailable } from '../../lib/subjects'
import type { Option, OptionId, Question } from '../../lib/types'
import type { SessionRecord, SessionSummary } from './sessionState'

export const OPTION_LETTERS = ['A', 'B', 'C', 'D'] as const

export function shortcutKey(event: KeyboardEvent) {
  if (event.defaultPrevented || event.isComposing || event.metaKey || event.ctrlKey || event.altKey ||
    document.querySelector('dialog[open]')) return ''
  const target = event.target
  if (target instanceof HTMLElement &&
    (target.isContentEditable || target.closest('input, textarea, select'))) return ''
  return event.key.toLowerCase()
}

// Questions written or adapted for JP (Teach me, JAMB-style concept practice, adaptations of past-paper
// concepts), not taken word for word from a JAMB paper. They are labelled as practice and kept out of the timed CBT exam.
export function isOriginalPractice(question: Question): boolean {
  return typeof question.source === 'string' && /^Original\b/.test(question.source)
}

export function getQuestionSourceLabel(question: Question): string | null {
  const { source } = question
  if (question.label === 'JAMB-style practice' || question.id.includes('-api-') ||
    /^SdashAPI/i.test(typeof source === 'string' ? source : source.provider)) {
    return 'JAMB-style practice'
  }

  if (isOriginalPractice(question)) return 'Practice question'

  const year = typeof source === 'string' ? null : source.yearLabel?.trim()
  return question.yearVerified === true && year ? `JAMB ${year}` : null
}

export type OptionStatus = 'idle' | 'correct' | 'wrong' | 'neutral'

export interface OptionViewState {
  letter: (typeof OPTION_LETTERS)[number]
  status: OptionStatus
  disabled: boolean
  note: string | null
}

export function makeOptionSeed(questionId: string, sessionStartedAt: number): number {
  let hash = (2166136261 ^ (sessionStartedAt >>> 0)) >>> 0
  for (let i = 0; i < questionId.length; i++) {
    hash ^= questionId.charCodeAt(i)
    hash = Math.imul(hash, 16777619) >>> 0
  }
  return hash
}

export function getOptionViewState(
  option: Option,
  index: number,
  question: Question,
  pickedId: OptionId | null,
  reveal = false,
): OptionViewState {
  const letter = OPTION_LETTERS[index] ?? 'A'
  const answered = pickedId !== null || reveal

  if (!answered) {
    return {
      letter,
      status: 'idle',
      disabled: false,
      note: null,
    }
  }

  const isCorrect = option.id === question.answerId
  const isPicked = option.id === pickedId

  if (isCorrect) {
    return {
      letter,
      status: 'correct',
      disabled: true,
      note: `${isPicked ? 'Your answer. Correct.' : 'Correct answer.'} ${option.why}`,
    }
  }

  if (isPicked) {
    return {
      letter,
      status: 'wrong',
      disabled: true,
      note: `Your answer. ${option.why}`,
    }
  }

  return {
    letter,
    status: 'neutral',
    disabled: true,
    note: option.why,
  }
}

export function getResultCopy(
  correct: boolean,
): { title: string; subtitle: string } {
  if (!correct) {
    return {
      title: 'Not quite',
      subtitle: 'Read why under your answer. This question comes back in your next session.',
    }
  }

  return {
    title: 'Correct',
    subtitle: 'Read why the other options are wrong.',
  }
}

export function parseQuestionIdFromHash(hash: string): string | null {
  const queryIndex = hash.indexOf('?')
  if (queryIndex === -1) return null
  const params = new URLSearchParams(hash.slice(queryIndex + 1))
  const id = params.get('id')
  return id && id.trim().length > 0 ? id.trim() : null
}

export function parseSubjectFromHash(hash: string): string | null {
  const queryIndex = hash.indexOf('?')
  if (queryIndex === -1) return null
  const params = new URLSearchParams(hash.slice(queryIndex + 1))
  const subject = params.get('subject')
  return subject && subject.trim().length > 0 ? subject.trim().toLowerCase() : null
}

export function buildSessionQueue(
  requestedId: string | null,
  limit = 10,
  subject?: string | null,
): { question: Question; review: boolean }[] {
  if (!(limit > 0)) return []
  const requestedQuestion = requestedId ? getQuestion(requestedId) : undefined
  const activeSubject =
    requestedQuestion?.subject ??
    (requestedId ? getSubjectByQuestionId(requestedId)?.id : undefined) ??
    subject ??
    'chemistry'
  const subjectInfo = getSubject(activeSubject)
  if (!subjectInfo || (!requestedQuestion && !isSubjectAvailable(subjectInfo.id))) return []

  const subjectQuestions = getQuestionsBySubject(subjectInfo.id)

  const entries = getDueQuestionIds(
    requestedId ? subjectQuestions.length : limit,
    subjectInfo.id,
  )
  const pinnedIndex = entries.findIndex(({ id }) => id === requestedId)
  if (pinnedIndex > 0) {
    const [pinned] = entries.splice(pinnedIndex, 1)
    entries.unshift(pinned)
  } else if (pinnedIndex === -1 && requestedQuestion) {
    entries.unshift({ id: requestedQuestion.id, review: false })
  }

  return entries.slice(0, limit).flatMap(({ id, review }) => {
    const question = getQuestion(id)
    return question ? [{ question, review }] : []
  })
}

export function summarizeSession(records: readonly SessionRecord[]): SessionSummary {
  const missedMap = new Map<string, number>()
  let answered = 0
  let correct = 0
  let skipped = 0

  for (const record of records) {
    if (record.skipped) {
      skipped++
      continue
    }
    answered++
    if (record.correct) {
      correct++
    } else {
      missedMap.set(record.topic, (missedMap.get(record.topic) ?? 0) + 1)
    }
  }

  const missedTopics = Array.from(missedMap.entries())
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count || a.topic.localeCompare(b.topic))

  return {
    total: records.length,
    answered,
    correct,
    skipped,
    missedTopics,
  }
}
