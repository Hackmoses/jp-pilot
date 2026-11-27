import { describe, expect, it } from 'vitest'
import { getQuestion, getQuestionsBySubject, registerSubjectData } from './data'
import type { Question } from './types'

describe('retired questions', () => {
  it('leave the practice pool but can still be looked up by id', () => {
    const base = { subject: 'zoology', topic: 't', type: 'recall', stem: 's', options: [], answerId: 'a' }
    const live = { ...base, id: 'zoo-live' } as unknown as Question
    const old = { ...base, id: 'zoo-old', retired: true } as unknown as Question
    registerSubjectData('zoology', [live, old])
    expect(getQuestionsBySubject('zoology').map((q) => q.id)).toEqual(['zoo-live'])
    expect(getQuestion('zoo-old')?.id).toBe('zoo-old')
  })
})
