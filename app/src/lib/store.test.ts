import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getQuestion } from './data'

let store: typeof import('./store')
const storage = new Map<string, string>()

function answer(questionId: string, correct: boolean, removedCount = 0, day = 7) {
  store.recordAnswer({
    questionId,
    pickedId: 'a',
    correct,
    removedCount,
    at: new Date(2026, 2, day, 12).getTime(),
  })
}

function startSession(queue = store.getDueQuestionIds(10)) {
  store.logEvent('session_start', { questionIds: queue.map(({ id }) => id).join(',') })
  return queue
}

beforeEach(async () => {
  storage.clear()
  vi.resetModules()
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
  })
  store = await import('./store')
})

afterEach(() => vi.unstubAllGlobals())

describe('progress', () => {
  it('counts attempts and consecutive calendar days and persists them', async () => {
    expect(store.getProgress()).toEqual({
      answered: 0, correct: 0, streakDays: 0, lastActiveDay: null,
    })
    answer('chem-001', true)
    answer('chem-002', false, 0, 8)
    answer('chem-003', true, 1, 8)
    answer('chem-004', true, 0, 9)

    vi.resetModules()
    store = await import('./store')
    expect(store.getProgress()).toEqual({
      answered: 4, correct: 3, streakDays: 3, lastActiveDay: '2026-03-09',
    })

    answer('chem-001', true, 0, 11)
    expect(store.getProgress().streakDays).toBe(1)
  })

  it('keeps progress and events in memory when storage access throws', async () => {
    vi.stubGlobal('localStorage', {
      getItem() { throw new Error('Storage blocked') },
      setItem() { throw new Error('Storage blocked') },
    })
    vi.resetModules()
    store = await import('./store')

    store.logEvent('session_start')
    answer('chem-001', false)
    expect(store.getProgress().answered).toBe(1)
    expect(store.getDueQuestionIds(1)).toEqual([{ id: 'chem-001', review: false }])
    expect(JSON.parse(store.exportLog())).toHaveLength(1)
  })
})

describe('question memory', () => {
  it('alternates unseen question types and respects the limit', () => {
    const queue = store.getDueQuestionIds(10)
    expect(new Set(queue.map(({ id }) => id)).size).toBe(10)
    expect(queue.every(({ review }) => !review)).toBe(true)
    expect(queue.map(({ id }) => getQuestion(id)?.type)).toEqual(
      Array.from({ length: 10 }, (_, i) => i % 2 === 0 ? 'recall' : 'calculation'),
    )
    expect(store.getDueQuestionIds(0)).toEqual([])
  })

  it('prioritizes wrong and assisted answers in the next session over unseen questions', () => {
    store.logEvent('session_start')
    answer('chem-009', false)
    answer('chem-020', true, 1)
    answer('chem-017', true)

    expect(store.getDueQuestionIds(2)).toEqual([
      { id: 'chem-009', review: false },
      { id: 'chem-020', review: false },
    ])
    const cleanEntry = () => store.getDueQuestionIds(25).find(({ id }) => id === 'chem-017')
    expect(cleanEntry()?.review).toBe(true)
    store.logEvent('session_start')
    expect(cleanEntry()?.review).toBe(true)
    store.logEvent('session_start')
    expect(cleanEntry()?.review).toBe(false)
    expect(store.getDueQuestionIds(3)[2]).toEqual({ id: 'chem-001', review: false })
  })

  it('uses the most recent answer to schedule the next review', () => {
    store.logEvent('session_start')
    answer('chem-001', false)
    store.logEvent('session_start')
    answer('chem-001', true)

    const entry = () => store.getDueQuestionIds(25).find(({ id }) => id === 'chem-001')
    expect(entry()?.review).toBe(true)
    store.logEvent('session_start')
    expect(entry()?.review).toBe(true)
    store.logEvent('session_start')
    expect(entry()?.review).toBe(false)
  })

  it('fills a short session with the soonest-due reviews and flags only early reviews', () => {
    const first = startSession()
    for (const { id } of first) answer(id, true)
    const second = startSession()
    for (const { id } of second) answer(id, true)

    const third = store.getDueQuestionIds(10)
    expect(third).toHaveLength(10)
    expect(third.slice(0, 5).every(({ review }) => !review)).toBe(true)
    expect(third.slice(5).every(({ id, review }) =>
      review && first.some((item) => item.id === id),
    )).toBe(true)
    expect(new Set(third.map(({ id }) => id)).size).toBe(10)
  })

  it('keeps the original due date on a correct early review and reschedules a wrong one', () => {
    startSession()
    answer('chem-001', true)
    answer('chem-002', true)
    startSession(store.getDueQuestionIds(25))
    answer('chem-001', true, 1)
    answer('chem-002', false)

    const third = store.getDueQuestionIds(25)
    expect(third[0]).toEqual({ id: 'chem-002', review: false })
    expect(third.find(({ id }) => id === 'chem-001')?.review).toBe(true)

    startSession(third)
    const fourth = store.getDueQuestionIds(25)
    expect(fourth.find(({ id }) => id === 'chem-001')?.review).toBe(false)
  })

  it('defers previous-session questions, including skips, until alternatives run out', async () => {
    const first = startSession()
    const second = startSession()
    expect(second.every(({ id }) => !first.some((item) => item.id === id))).toBe(true)

    vi.resetModules()
    store = await import('./store')
    const third = store.getDueQuestionIds(25)
    expect(third.slice(0, 15).every(({ id }) => !second.some((item) => item.id === id))).toBe(true)
    expect(new Set(third.slice(15).map(({ id }) => id))).toEqual(new Set(second.map(({ id }) => id)))

    const short = store.getDueQuestionIds(30)
    expect(short).toHaveLength(25)
  })
})

describe('event log', () => {
  it('persists the newest 500 events in order', async () => {
    for (let i = 0; i < 502; i++) store.logEvent('hint_open', { i })

    vi.resetModules()
    store = await import('./store')
    const events = JSON.parse(store.exportLog())
    expect(events).toHaveLength(500)
    expect(events[0]).toMatchObject({ name: 'hint_open', data: { i: 2 } })
    expect(events[499]).toMatchObject({ name: 'hint_open', data: { i: 501 } })
  })
})
