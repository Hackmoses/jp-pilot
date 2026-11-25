import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import questionsFile from '../../../../data/questions.json'
import animationsFile from '../../../../data/animations.json'
import { getQuestions, registerSubjectData } from '../../lib/data'
import { shuffleOptions } from '../../lib/shuffle'
import { SUBJECTS, getSubjectByQuestionId } from '../../lib/subjects'
import type { Animation, Question } from '../../lib/types'
import {
  OPTION_LETTERS,
  buildSessionQueue,
  getOptionViewState,
  getResultCopy,
  makeOptionSeed,
  parseQuestionIdFromHash,
  parseSubjectFromHash,
  summarizeSession,
} from './logic'

registerSubjectData(
  'chemistry',
  questionsFile.questions as unknown as Question[],
  animationsFile.animations as unknown as Animation[],
)

const questions = getQuestions()

describe('question screen logic (M1)', () => {
  it('produces deterministic seeds that vary across questions and sessions', () => {
    expect(makeOptionSeed('chem-001', 1000)).toBe(makeOptionSeed('chem-001', 1000))
    expect(makeOptionSeed('chem-001', 1000)).not.toBe(makeOptionSeed('chem-002', 1000))
    expect(makeOptionSeed('chem-001', 1000)).not.toBe(makeOptionSeed('chem-001', 1001))
  })

  it('computes option states and reasons for right and wrong picks', () => {
    const q = questions[0]
    const shuffled = shuffleOptions(q, makeOptionSeed(q.id, 12345))
    const wrongOption = shuffled.find((o) => o.id !== q.answerId)!
    const correctOption = shuffled.find((o) => o.id === q.answerId)!

    const before = shuffled.map((o, i) => getOptionViewState(o, i, q, null))
    expect(before.every((s) => s.status === 'idle' && !s.disabled && s.note === null)).toBe(true)
    expect(before.map((s) => s.letter)).toEqual([...OPTION_LETTERS])

    const afterRight = shuffled.map((o, i) => getOptionViewState(o, i, q, correctOption.id))
    for (const [i, state] of afterRight.entries()) {
      expect(state.disabled).toBe(true)
      if (shuffled[i].id === q.answerId) {
        expect(state.status).toBe('correct')
        expect(state.note).toContain('Your answer. Correct.')
      } else {
        expect(state.status).toBe('neutral')
        expect(state.note).toBe(shuffled[i].why)
      }
    }

    const afterWrong = shuffled.map((o, i) => getOptionViewState(o, i, q, wrongOption.id))
    for (const [i, state] of afterWrong.entries()) {
      expect(state.disabled).toBe(true)
      if (shuffled[i].id === wrongOption.id) {
        expect(state.status).toBe('wrong')
        expect(state.note).toContain('Your answer.')
      } else if (shuffled[i].id === q.answerId) {
        expect(state.status).toBe('correct')
        expect(state.note).toContain('Correct answer.')
      } else {
        expect(state.status).toBe('neutral')
        expect(state.note).toBe(shuffled[i].why)
      }
    }
  })

  it('provides non-empty content and 4 shuffled options for all 25 questions', () => {
    expect(questions).toHaveLength(25)
    for (const q of questions) {
      const shuffled = shuffleOptions(q, makeOptionSeed(q.id, 999))
      expect(shuffled).toHaveLength(4)
      expect(q.explanation.trim().length).toBeGreaterThan(0)
      expect(q.trap.trim().length).toBeGreaterThan(0)
      expect(q.mnemonic.trim().length).toBeGreaterThan(0)
      for (const opt of shuffled) {
        expect(opt.why.trim().length).toBeGreaterThan(0)
      }
    }
  })

  it('parses ?id= from hash routes cleanly', () => {
    expect(parseQuestionIdFromHash('#/q?id=chem-016')).toBe('chem-016')
    expect(parseQuestionIdFromHash('#/q')).toBeNull()
    expect(parseQuestionIdFromHash('#/q?id=')).toBeNull()
  })

  it('returns accurate result copy without fabricated percentages', () => {
    expect(getResultCopy(true).title).toBe('Correct')
    expect(getResultCopy(true).subtitle).not.toMatch(/%/)
    expect(getResultCopy(false).title).toBe('Not quite')
  })
})

describe('session flow and memory (M5)', () => {
  const storage = new Map<string, string>()

  beforeEach(async () => {
    storage.clear()
    vi.resetModules()
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
    })
    const data = await import('../../lib/data')
    data.registerSubjectData(
      'chemistry',
      questionsFile.questions as unknown as Question[],
      animationsFile.animations as unknown as Animation[],
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('builds 10-question queues and brings wrong answers back in the next session', async () => {
    const store = await import('../../lib/store')
    const logic = await import('./logic')

    const session1 = logic.buildSessionQueue(null, 10)
    expect(session1).toHaveLength(10)
    store.logEvent('session_start', { count: session1.length })

    const { question: wrongQ } = session1[0]
    const { question: cleanQ } = session1[1]

    store.recordAnswer({
      questionId: wrongQ.id,
      pickedId: wrongQ.options.find((o) => o.id !== wrongQ.answerId)!.id,
      correct: false,
      at: Date.now(),
    })
    store.recordAnswer({
      questionId: cleanQ.id,
      pickedId: cleanQ.answerId,
      correct: true,
      at: Date.now(),
    })

    // Skip remaining questions (no recordAnswer call) -> answered count stays 2
    expect(store.getProgress().answered).toBe(2)

    const session2 = logic.buildSessionQueue(null, 10)
    expect(session2).toHaveLength(10)
    expect(session2[0].question.id).toBe(wrongQ.id)
    expect(session2.some(({ question }) => question.id === cleanQ.id)).toBe(false)

    store.logEvent('session_start', { count: session2.length })
    const session3 = logic.buildSessionQueue(null, 10)
    expect(session3.some(({ question }) => question.id === cleanQ.id)).toBe(false)

    store.logEvent('session_start', { count: session3.length })
    const session4 = logic.buildSessionQueue(null, 10)
    expect(store.getDueQuestionIds(25).find(({ id }) => id === cleanQ.id)?.review).toBe(false)
    expect(session4).toHaveLength(10)
  })

  it('pins a requested question id at the front of the 10-question queue', async () => {
    const logic = await import('./logic')
    const queue = logic.buildSessionQueue('chem-016', 10)
    expect(queue).toHaveLength(10)
    expect(queue[0].question.id).toBe('chem-016')
    expect(new Set(queue.map(({ question }) => question.id)).size).toBe(10)
  })

  it('fills a third 10-question session after two clean sessions exhaust most unseen questions', async () => {
    const store = await import('../../lib/store')
    const { buildSessionQueue } = await import('./logic')

    for (let session = 0; session < 2; session++) {
      const queue = buildSessionQueue(null)
      store.logEvent('session_start', { questionIds: queue.map(({ question }) => question.id).join(',') })
      for (const { question } of queue) {
        store.recordAnswer({
          questionId: question.id,
          pickedId: question.answerId,
          correct: true,
          at: Date.now(),
        })
      }
    }

    const next = buildSessionQueue(null)
    expect(new Set(next.map(({ question }) => question.id)).size).toBe(10)
    expect(next.map(({ review }) => review)).toEqual([
      false, false, false, false, false, true, true, true, true, true,
    ])
  })

  it('summarizes session score, skips, and missed topics in descending frequency order', () => {
    const summary = summarizeSession([
      { questionId: 'chem-001', topic: 'Metals', correct: false, skipped: false },
      { questionId: 'chem-002', topic: 'Water', correct: true, skipped: false },
      { questionId: 'chem-003', topic: 'Non-metals', correct: false, skipped: false },
      { questionId: 'chem-004', topic: 'Metals', correct: false, skipped: false },
      { questionId: 'chem-005', topic: 'Acids', correct: false, skipped: true },
    ])

    expect(summary).toEqual({
      total: 5,
      answered: 4,
      correct: 1,
      skipped: 1,
      missedTopics: [
        { topic: 'Metals', count: 2 },
        { topic: 'Non-metals', count: 1 },
      ],
    })
  })
})

describe('subject picker and whyWrong requirements (M11 & M12)', () => {
  it('lists all 15 UTME subjects with only Chemistry available', () => {
    expect(SUBJECTS).toHaveLength(15)
    expect(SUBJECTS.filter((s) => s.available).map((s) => s.id)).toEqual(['chemistry'])
    expect(getSubjectByQuestionId('math-api-0001')?.id).toBe('mathematics')
    expect(getSubjectByQuestionId('chem-016')?.id).toBe('chemistry')
  })

  it('parses ?subject= from hash routes cleanly', () => {
    expect(parseSubjectFromHash('#/q?subject=chemistry')).toBe('chemistry')
    expect(parseSubjectFromHash('#/q?subject=Physics')).toBe('physics')
    expect(parseSubjectFromHash('#/q')).toBeNull()
  })

  it('builds a 10-question queue for chemistry and never starts an empty session for closed or unknown subjects', () => {
    expect(buildSessionQueue(null, 10, 'chemistry')).toHaveLength(10)
    expect(buildSessionQueue(null, 10, 'physics')).toEqual([])
    expect(buildSessionQueue(null, 10, 'mathematics')).toEqual([])
    expect(buildSessionQueue(null, 10, 'unknown')).toEqual([])
  })

  it('provides non-empty whyWrong for every wrong option and null for the answer across all 25 questions', () => {
    for (const q of questions) {
      for (const opt of q.options) {
        if (opt.id === q.answerId) {
          expect(opt.whyWrong).toBeNull()
        } else {
          expect(typeof opt.whyWrong).toBe('string')
          expect(opt.whyWrong!.trim().length).toBeGreaterThan(0)
        }
      }
    }
  })
})
