import { chapterForTopic, conceptLessonTopic, syllabusSections } from './sections'
import { getAnimation, getQuestion, registerSavedQuestions } from './data'
import { getDueQuestionIds } from './store'
import type { Animation, OptionId, Question } from './types'

export type Mode = 'study' | 'practice' | 'exam'
export type TestMode = Exclude<Mode, 'study'>
export type PracticeSettings = {
  chapters: readonly string[]
  count: number | 'all'
  countMode?: 'custom'
  customCount?: string
  minutes: number
  minutesMode?: 'custom'
  customMinutes?: string
}

export const MAX_CUSTOM_MINUTES = 180

export function parseCustomWholeNumber(
  raw: string,
  min: number,
  max: number,
  unit: 'questions' | 'minutes',
): { value: number; error: null } | { value: null; error: string } {
  const trimmed = raw.trim()
  if (!trimmed) {
    return {
      value: null,
      error: unit === 'questions'
        ? (max < min ? 'No questions available in selected chapters.' : `Enter a whole number from ${min} to ${max}.`)
        : `Enter minutes from ${min} to ${max}.`,
    }
  }
  if (!/^\d+$/.test(trimmed)) {
    return {
      value: null,
      error: `Use a whole number from ${min} to ${max}.`,
    }
  }
  const parsed = Number(trimmed)
  if (!Number.isSafeInteger(parsed) || parsed < min || parsed > max) {
    return {
      value: null,
      error: unit === 'questions'
        ? (max < min ? 'No questions available in selected chapters.' : `Choose between ${min} and ${max}.`)
        : `Choose between ${min} and ${max} minutes.`,
    }
  }
  return { value: parsed, error: null }
}

export function getQuestionChapter(question: Question): string {
  return question.chapter?.trim() || chapterForTopic(question.subject, question.topic) || question.topic
}

export function getSections(subject: string) {
  return syllabusSections(subject)
}

export function getChapters(subject: string, questions: readonly Question[]) {
  const sections = getSections(subject)
  if (sections.length > 0) {
    return sections.flatMap((section) => section.chapters)
      .filter((chapter) => questions.some((question) => getQuestionChapter(question) === chapter.id))
      .map((chapter) => ({ id: chapter.id, title: chapter.title }))
  }
  const seen = new Set<string>()
  const list: { id: string; title: string }[] = []
  for (const question of questions) {
    const ch = getQuestionChapter(question)
    if (ch && !seen.has(ch)) {
      seen.add(ch)
      list.push({ id: ch, title: ch })
    }
  }
  return list
}

export function chapterName(subject: string, chapter: string) {
  return getSections(subject).flatMap((section) => section.chapters)
    .find((entry) => entry.id === chapter)?.title ?? (chapter.trim() || 'Other questions')
}

export function studyLink(subject: string, chapter: string, concept?: string) {
  const params = new URLSearchParams({ subject, chapter })
  if (concept) params.set('concept', concept)
  return '#/study?' + params
}

export function practicePool(questions: readonly Question[], settings: PracticeSettings) {
  return questions.filter((question) =>
    settings.chapters.length === 0 || settings.chapters.includes(getQuestionChapter(question)))
}

export function practiceQueue(subject: string, questions: readonly Question[], settings: PracticeSettings) {
  const eligible = new Set(practicePool(questions, settings).map((question) => question.id))
  const limit = settings.count === 'all' ? undefined : Math.max(0, Math.floor(settings.count))
  return getDueQuestionIds(questions.length, subject)
    .filter(({ id }) => eligible.has(id))
    .slice(0, limit)
}

export const EXAM_MINUTES = { full: 120, pilot: 15 }

export type Attempt = {
  id: string
  mode: TestMode
  subjects: string[]
  ids: string[]
  reviewIds: string[]
  index: number
  startedAt: number
  deadline: number | null
  answers: Partial<Record<string, OptionId>>
  flagged: Partial<Record<string, boolean>>
  time: Record<string, number>
  snapshotId?: string
}

export type TestResult = Attempt & { finishedAt: number }
type Snapshot = { questions: Question[]; animations: Animation[] }

const defaults: PracticeSettings = { chapters: [], count: 10, minutes: 0 }
const key = 'jp.modes.v1'

function read() {
  try {
    return JSON.parse(localStorage.getItem(key) ?? 'null') as Partial<ModeState> | null
  } catch {
    return null
  }
}

interface ModeState {
  recent: { href: string; label: string } | null
  studied: Record<string, boolean>
  completedConceptLessons: Record<string, boolean>
  startedConceptTopics: Record<string, boolean>
  studiedConceptTopics: Record<string, boolean>
  completedInteractives: Record<string, boolean>
  studyAnswers: Partial<Record<string, OptionId>>
  practice: Record<string, PracticeSettings>
  examSubjects: string[]
  attempts: Partial<Record<TestMode, Attempt>>
  practiceResult: TestResult | null
  exams: TestResult[]
  snapshots: Record<string, Snapshot>
}

const saved = read()
const state: ModeState = {
  recent: saved?.recent ?? null,
  studied: saved?.studied ?? {},
  completedConceptLessons: saved?.completedConceptLessons ?? {},
  startedConceptTopics: saved?.startedConceptTopics ?? {},
  studiedConceptTopics: saved?.studiedConceptTopics ?? {},
  completedInteractives: saved?.completedInteractives ?? {},
  studyAnswers: saved?.studyAnswers ?? {},
  practice: saved?.practice ?? {},
  examSubjects: saved?.examSubjects ?? ['english', 'chemistry'],
  attempts: saved?.attempts ?? {},
  practiceResult: saved?.practiceResult ?? null,
  exams: saved?.exams ?? [],
  snapshots: saved?.snapshots ?? {},
}

function save() {
  try {
    localStorage.setItem(key, JSON.stringify(state))
  } catch {
    // In-memory progress is still available.
  }
}

export function getRecent() { return state.recent }
export function remember(href: string, label: string) { state.recent = { href, label }; save() }
function interactiveKey(subject: string, chapter: string, lesson?: string) {
  const key = subject + '/' + chapter
  // Previously saved cards use the chapter key. Additional cards use a separate key.
  return lesson ? key + '/' + lesson : key
}
export function hasCompletedInteractive(subject: string, chapter: string, lesson?: string) {
  return Boolean(state.completedInteractives[interactiveKey(subject, chapter, lesson)])
}
export function markInteractiveCompleted(subject: string, chapter: string, lesson?: string) {
  state.completedInteractives[interactiveKey(subject, chapter, lesson)] = true
  state.studied[subject + '/' + chapter] = true
  save()
}
export function hasCompletedConceptLesson(id: string) {
  return Boolean(state.completedConceptLessons[id])
}
export function completeConceptLesson(subject: string, chapter: string, id: string, all: string[]) {
  state.completedConceptLessons[id] = true
  state.startedConceptTopics[subject + '/' + chapter] = true
  if (all.every(hasCompletedConceptLesson)) state.studiedConceptTopics[subject + '/' + chapter] = true
  save()
}
export function hasStartedConceptTopic(subject: string, chapter: string) {
  return Boolean(state.startedConceptTopics[subject + '/' + chapter])
}
export function hasStudied(subject: string, chapter: string) {
  if (conceptLessonTopic(subject, chapter)) return Boolean(state.studiedConceptTopics[subject + '/' + chapter])
  return Boolean(state.studied[subject + '/' + chapter]) || hasCompletedInteractive(subject, chapter)
}
export function getStudyAnswer(id: string) { return state.studyAnswers[id] }
export function markStudied(subject: string, chapter: string, id: string, answer: OptionId) {
  state.studied[subject + '/' + chapter] = true
  state.studyAnswers[id] = answer
  save()
}
export function getPracticeSettings(subject: string) { return state.practice[subject] ?? defaults }
export function savePracticeSettings(subject: string, settings: PracticeSettings) { state.practice[subject] = settings; save() }
export function getExamSubjects() { return state.examSubjects }
export function saveExamSubjects(subjects: string[]) { state.examSubjects = subjects; save() }
export function getAttempt(mode: TestMode) { return state.attempts[mode] }
export function getPracticeResult() { return state.practiceResult }
export function getExamHistory() {
  return [...state.exams].sort((a, b) => b.finishedAt - a.finishedAt).slice(0, 10)
}

function getSnapshot({ snapshotId }: Attempt) {
  return snapshotId ? state.snapshots[snapshotId] : undefined
}

export function getAttemptQuestions(attempt: Attempt) {
  return getSnapshot(attempt)?.questions ?? attempt.ids.flatMap((id) => getQuestion(id) ?? [])
}

export function restoreAttemptQuestions(attempt?: Attempt | null) {
  const snapshot = attempt && getSnapshot(attempt)
  if (!snapshot) return false
  registerSavedQuestions(snapshot.questions, snapshot.animations)
  return true
}

export function remainingTime(attempt: Attempt, now = Date.now()) {
  return attempt.deadline === null ? null : Math.max(0, attempt.deadline - now)
}

export function submitExpiredExam(now = Date.now()) {
  const attempt = getAttempt('exam')
  if (attempt && remainingTime(attempt, now) === 0) finishAttempt(attempt, now)
}

let enteringExam = false

export function continueExam() {
  enteringExam = true
  window.location.hash = '#/exam/run'
}

export function takeExamEntry() {
  const entering = enteringExam
  enteringExam = false
  return entering
}

function pruneSnapshots() {
  const used = new Set([...state.exams, state.practiceResult, ...Object.values(state.attempts)]
    .map((attempt) => attempt?.snapshotId))
  for (const id of Object.keys(state.snapshots)) if (!used.has(id)) delete state.snapshots[id]
}

export function saveAttempt(attempt: Attempt) {
  state.attempts[attempt.mode] = attempt
  state.recent = { href: '#/' + attempt.mode + '/run', label: attempt.mode === 'exam' ? 'Exam' : 'Practice' }
  save()
}

export function startAttempt(mode: TestMode, subjects: string[], queue: { id: string; review?: boolean }[], minutes: number) {
  const startedAt = Date.now()
  const attempt: Attempt = {
    id: mode + '-' + startedAt, mode, subjects, ids: queue.map(({ id }) => id),
    reviewIds: queue.filter(({ review }) => review).map(({ id }) => id),
    index: 0, startedAt, deadline: minutes ? startedAt + minutes * 60_000 : null,
    answers: {}, flagged: {}, time: {},
  }
  const questions = attempt.ids.flatMap((id) => getQuestion(id) ?? [])
  if (questions.length === attempt.ids.length) {
    const animations = questions.flatMap(({ animationId }) => animationId ? getAnimation(animationId) ?? [] : [])
    const snapshot = { questions, animations }
    const content = JSON.stringify(snapshot)
    attempt.snapshotId = Object.keys(state.snapshots).find((id) =>
      JSON.stringify(state.snapshots[id]) === content) ?? attempt.id
    state.snapshots[attempt.snapshotId] = snapshot
  }
  state.attempts[mode] = attempt
  pruneSnapshots()
  saveAttempt(attempt)
}

export function mistakeIds(questions: readonly Question[], answers: Attempt['answers']) {
  return questions.filter(({ id, answerId }) => answers[id] && answers[id] !== answerId).map(({ id }) => id)
}

export function retryMistakes(ids: readonly string[]) {
  const questions = ids.flatMap((id) => getQuestion(id) ?? [])
  if (questions.length !== ids.length || !questions.length) return
  startAttempt('practice', [...new Set(questions.map(({ subject }) => subject))], ids.map((id) => ({ id })), 0)
  window.location.hash = '#/practice/run'
}

export function finishAttempt(attempt: Attempt, now: number) {
  if (state.attempts[attempt.mode]?.id !== attempt.id) return
  const result: TestResult = { ...attempt, finishedAt: Math.min(now, attempt.deadline ?? now) }
  delete state.attempts[attempt.mode]
  if (attempt.mode === 'exam') {
    state.exams.push(result)
    state.exams = getExamHistory()
  }
  else state.practiceResult = result
  pruneSnapshots()
  const href = '#/' + attempt.mode + '/results?id=' + result.id
  remember(href, attempt.mode === 'exam' ? 'Exam results' : 'Practice summary')
  window.location.hash = href
}

export function scoreAttempt(questions: readonly Question[], answers: Attempt['answers']) {
  const chapters = new Map<string, { subject: string; chapter: string; total: number; correct: number; mistakes: number }>()
  let correct = 0
  let answered = 0
  for (const question of questions) {
    const answer = answers[question.id]
    const chapter = getQuestionChapter(question)
    const key = question.subject + '/' + chapter
    const row = chapters.get(key) ?? { subject: question.subject, chapter, total: 0, correct: 0, mistakes: 0 }
    row.total++
    if (answer) answered++
    if (answer === question.answerId) {
      correct++
      row.correct++
    } else if (answer) row.mistakes++
    chapters.set(key, row)
  }
  const total = questions.length
  return { total, correct, answered, percent: total ? Math.round(correct * 100 / total) : 0, chapters: [...chapters.values()] }
}

export function formatTime(ms: number) {
  const seconds = Math.max(0, Math.ceil(ms / 1000))
  return Math.floor(seconds / 60) + ':' + String(seconds % 60).padStart(2, '0')
}
