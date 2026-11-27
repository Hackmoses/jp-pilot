import { afterEach, describe, expect, it, vi } from 'vitest'
import { isCompleteQuestion } from './data'
import { chapterName, examQueue, getChapters, MAX_CUSTOM_MINUTES, mistakeIds, parseCustomWholeNumber, practicePool, practiceQueue, scoreAttempt, type Attempt } from './modes'
import type { Animation, Question } from './types'

const step = { n: 1, display: '', tag: '', narration: '' }
const animation: Animation = { id: 'anim', questionId: 'q1', stepSeconds: 1, steps: [step, step], teach: [step, step] }
const conceptAnim: Animation = { id: 'anim-c', questionId: 'qc', kind: 'concept', stepSeconds: 5, steps: [step, step] }
const q1 = { id: 'q1', subject: 'chemistry', topic: 'Acids', chapter: '2', animationId: 'anim', answerId: 'a' } as Question
const q2 = { ...q1, id: 'q2', chapter: '3' }
const q3 = { ...q1, id: 'q3' }
const q4 = { ...q1, id: 'q4', subject: 'physics' }
const qMath = { id: 'qm', subject: 'mathematics', topic: 'Indices', animationId: 'anim-m', answerId: 'a' } as Question

const savedExam: Attempt = {
  id: 'exam-1000', mode: 'exam', subjects: ['chemistry'], ids: ['q1', 'q2'],
  reviewIds: [], index: 1, startedAt: 1000, deadline: 61_000,
  answers: { q1: 'b' }, flagged: { q2: true }, time: { q1: 2000 },
}

function stubStorage(initial = '{}') {
  let text = initial
  vi.stubGlobal('localStorage', {
    getItem: () => text,
    setItem: (_key: string, value: string) => { text = value },
  })
  vi.stubGlobal('window', { location: { hash: '' } })
  vi.resetModules()
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('complete questions', () => {
  it('needs a matching animation with Teach me and Quick steps, or a concept lesson', () => {
    expect(isCompleteQuestion(q1, animation)).toBe(true)
    // Chapter is optional (grouped by topic), and concept lessons count as complete.
    expect(isCompleteQuestion({ ...q1, chapter: undefined }, animation)).toBe(true)
    expect(isCompleteQuestion({ ...q1, chapter: ' ' }, animation)).toBe(true)
    expect(isCompleteQuestion(q1)).toBe(false)
    expect(isCompleteQuestion(q2, animation)).toBe(false)
    expect(isCompleteQuestion(q1, { ...animation, teach: undefined })).toBe(false)
    expect(isCompleteQuestion(q1, { ...animation, steps: [] } as unknown as Animation)).toBe(false)
  })
})

describe('practice setup', () => {
  it('filters by selected chapters or topic fallback and treats empty selection as all', () => {
    const questions = [q1, q2, q3, qMath]
    const settings = { chapters: ['2'], count: 5, minutes: 10 } as const
    expect(practicePool(questions, settings)).toEqual([q1, q3])
    // Untagged maths topics are placed in their syllabus chapter: Indices is chapter 3.
    expect(practicePool([qMath], { ...settings, chapters: ['3'] })).toEqual([qMath])
    expect(practicePool(questions, { ...settings, chapters: ['3'] })).toEqual([q2, qMath])
    expect(practicePool(questions, { ...settings, chapters: [] })).toEqual(questions)
    expect(practicePool(questions, { ...settings, chapters: ['15'] })).toEqual([])
    expect(getChapters('mathematics', [qMath])).toEqual([{ id: '3', title: 'Indices, Logarithms and Surds' }])
    expect(chapterName('mathematics', '3')).toBe('Indices, Logarithms and Surds')
    // Subjects without a syllabus still fall back to the topic.
    const qGeo = { ...qMath, id: 'qg', subject: 'geography', topic: 'Climate' } as Question
    expect(getChapters('geography', [qGeo])).toEqual([{ id: 'Climate', title: 'Climate' }])
  })

  it('validates custom question counts and timer limits cleanly', () => {
    expect(parseCustomWholeNumber('1', 1, 15, 'questions')).toEqual({ value: 1, error: null })
    expect(parseCustomWholeNumber('15', 1, 15, 'questions')).toEqual({ value: 15, error: null })
    expect(parseCustomWholeNumber('0', 1, 15, 'questions').value).toBeNull()
    expect(parseCustomWholeNumber('16', 1, 15, 'questions').value).toBeNull()
    expect(parseCustomWholeNumber('', 1, 15, 'questions').value).toBeNull()
    expect(parseCustomWholeNumber('2.5', 1, 15, 'questions').value).toBeNull()
    expect(parseCustomWholeNumber('-3', 1, 15, 'questions').value).toBeNull()
    expect(parseCustomWholeNumber('abc', 1, 15, 'questions').value).toBeNull()

    expect(parseCustomWholeNumber('1', 1, MAX_CUSTOM_MINUTES, 'minutes')).toEqual({ value: 1, error: null })
    expect(parseCustomWholeNumber('180', 1, MAX_CUSTOM_MINUTES, 'minutes')).toEqual({ value: 180, error: null })
    expect(parseCustomWholeNumber('0', 1, MAX_CUSTOM_MINUTES, 'minutes').value).toBeNull()
    expect(parseCustomWholeNumber('181', 1, MAX_CUSTOM_MINUTES, 'minutes').value).toBeNull()
    expect(parseCustomWholeNumber('', 1, MAX_CUSTOM_MINUTES, 'minutes').value).toBeNull()
  })

  it('remembers custom practice choices per subject across reloads', async () => {
    stubStorage()
    const modes = await import('./modes')
    const { registerSubjectData } = await import('./data')
    const pool = Array.from({ length: 12 }, (_, i) => ({
      ...qMath,
      id: `qm-${i + 1}`,
    })) as Question[]
    registerSubjectData('mathematics', pool, [animation])

    modes.savePracticeSettings('mathematics', {
      chapters: ['3'],
      count: 7,
      countMode: 'custom',
      customCount: '7',
      minutes: 45,
      minutesMode: 'custom',
      customMinutes: '45',
    })

    vi.resetModules()
    const reloaded = await import('./modes')
    const saved = reloaded.getPracticeSettings('mathematics')
    expect(saved).toEqual({
      chapters: ['3'],
      count: 7,
      countMode: 'custom',
      customCount: '7',
      minutes: 45,
      minutesMode: 'custom',
      customMinutes: '45',
    })
    const { registerSubjectData: reg2 } = await import('./data')
    reg2('mathematics', pool, [animation])
    expect(reloaded.practiceQueue('mathematics', pool, saved)).toHaveLength(7)
  })
})

describe('exam scoring', () => {
  it('counts unanswered questions in the score and groups chapters or topics by subject', () => {
    const result = scoreAttempt([q1, q2, q3, q4, qMath], { q1: 'a', q3: 'b', q4: 'a', qm: 'a' })
    expect(result).toEqual({
      total: 5, answered: 4, correct: 3, percent: 60,
      chapters: [
        { subject: 'chemistry', chapter: '2', total: 2, correct: 1, mistakes: 1 },
        { subject: 'chemistry', chapter: '3', total: 1, correct: 0, mistakes: 0 },
        { subject: 'physics', chapter: '2', total: 1, correct: 1, mistakes: 0 },
        { subject: 'mathematics', chapter: '3', total: 1, correct: 1, mistakes: 0 },
      ],
    })
  })

  it('selects only answered mistakes for a retry, in session order', () => {
    expect(mistakeIds([q1, q2, q3, q4], { q1: 'b', q2: 'a', q4: 'd' })).toEqual(['q1', 'q4'])
  })
})

describe('saved exams', () => {
  it('restores position, answers, flags and questions and keeps the original deadline', async () => {
    stubStorage()
    vi.useFakeTimers()
    vi.setSystemTime(1000)
    const modes = await import('./modes')
    const { registerSubjectData } = await import('./data')
    registerSubjectData('chemistry', [q1, q2], [animation])
    modes.startAttempt('exam', ['chemistry'], [{ id: 'q1' }, { id: 'q2' }], 1)
    const attempt = modes.getAttempt('exam')!
    Object.assign(attempt, savedExam)
    modes.saveAttempt(attempt)

    vi.resetModules()
    const resumed = await import('./modes')
    const restored = resumed.getAttempt('exam')!
    expect(restored).toMatchObject(savedExam)
    expect(resumed.getAttemptQuestions(restored)).toEqual([q1, q2])
    expect(resumed.restoreAttemptQuestions(restored)).toBe(true)
    expect(resumed.remainingTime(restored, 31_000)).toBe(30_000)
    resumed.submitExpiredExam(60_999)
    expect(resumed.getAttempt('exam')).toBeDefined()

    resumed.submitExpiredExam(80_000)
    resumed.submitExpiredExam(90_000)
    expect(resumed.getAttempt('exam')).toBeUndefined()
    expect(resumed.getExamHistory()).toEqual([expect.objectContaining({ finishedAt: 61_000, answers: { q1: 'b' } })])
    expect(window.location.hash).toBe('#/exam/results?id=exam-1000')
  })

  it('lists the ten most recent exams by finish time', async () => {
    const order = [1, 12, 3, 10, 6, 9, 2, 4, 5, 8, 7, 11]
    stubStorage(JSON.stringify({
      exams: order.map((finishedAt) => ({ ...savedExam, id: String(finishedAt), finishedAt })),
    }))
    const modes = await import('./modes')
    expect(modes.getExamHistory().map(({ finishedAt }) => finishedAt)).toEqual([12, 11, 10, 9, 8, 7, 6, 5, 4, 3])
  })
})

it('draws a capped random exam with English first', () => {
  const bank = (prefix: string, n: number) => Array.from({ length: n }, (_, i) => ({ id: prefix + i }))
  const pools: Record<string, { id: string }[]> = { physics: bank('p', 55), english: bank('e', 92) }
  let seed = 1
  const random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646
  const first = examQueue(['physics', 'english'], (s) => pools[s], true, random).map(({ id }) => id)
  const second = examQueue(['physics', 'english'], (s) => pools[s], true, random).map(({ id }) => id)
  expect(first).toHaveLength(100)
  expect(first.slice(0, 60).every((id) => id.startsWith('e'))).toBe(true)
  expect(first.slice(60).every((id) => id.startsWith('p'))).toBe(true)
  expect(new Set(first).size).toBe(100)
  expect(first).not.toEqual(second)
  expect(examQueue(['physics'], (s) => pools[s], false, random)).toHaveLength(55)
})
