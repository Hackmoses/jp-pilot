import { describe, expect, it } from 'vitest'
import { isCompleteQuestion } from './data'
import { chapterName, getChapters, practicePool, scoreAttempt } from './modes'
import type { Animation, Question } from './types'

const step = { n: 1, display: '', tag: '', narration: '' }
const animation: Animation = { id: 'anim', questionId: 'q1', stepSeconds: 1, steps: [step, step], teach: [step, step] }
const conceptAnim: Animation = { id: 'anim-c', questionId: 'qc', kind: 'concept', stepSeconds: 5, steps: [step, step] }
const q1 = { id: 'q1', subject: 'chemistry', topic: 'Acids', chapter: '2', animationId: 'anim', answerId: 'a' } as Question
const q2 = { ...q1, id: 'q2', chapter: '3' }
const q3 = { ...q1, id: 'q3' }
const q4 = { ...q1, id: 'q4', subject: 'physics' }
const qMath = { id: 'qm', subject: 'mathematics', topic: 'Indices', animationId: 'anim-m', answerId: 'a' } as Question

describe('complete questions', () => {
  it('requires a Teach me calculation animation or a concept lesson, without requiring chapter', () => {
    expect(isCompleteQuestion(q1, animation)).toBe(true)
    expect(isCompleteQuestion({ ...q1, chapter: undefined }, animation)).toBe(true)
    expect(isCompleteQuestion({ ...q1, chapter: ' ' }, animation)).toBe(true)
    expect(isCompleteQuestion({ id: 'qc', subject: 'biology', topic: 'Cells', animationId: 'anim-c', answerId: 'a' } as Question, conceptAnim)).toBe(true)
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
    expect(practicePool(questions, { ...settings, chapters: ['Indices'] })).toEqual([qMath])
    expect(practicePool(questions, { ...settings, chapters: [] })).toEqual(questions)
    expect(practicePool(questions, { ...settings, chapters: ['15'] })).toEqual([])
    expect(getChapters('mathematics', [qMath])).toEqual([{ id: 'Indices', title: 'Indices' }])
    expect(chapterName('mathematics', 'Indices')).toBe('Indices')
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
        { subject: 'mathematics', chapter: 'Indices', total: 1, correct: 1, mistakes: 0 },
      ],
    })
  })
})
