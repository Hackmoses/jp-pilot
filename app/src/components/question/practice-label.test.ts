import { describe, expect, it } from 'vitest'
import type { Question } from '../../lib/types'
import { getQuestionSourceLabel, isOriginalPractice } from './logic'

const q = (source: Question['source'], extra: Partial<Question> = {}) => ({ id: 'x', source, ...extra }) as Question

describe('original practice questions', () => {
  it('are labelled as practice, not as a JAMB year', () => {
    const item = q('Original practice · OpenStax Biology 2e §30.6')
    expect(isOriginalPractice(item)).toBe(true)
    expect(getQuestionSourceLabel(item)).toBe('Practice question')
  })
  it('include written JAMB-style concept practice, kept out of the exam', () => {
    const item = q('Original JAMB-style practice. Topic references: JAMB Physics syllabus', { label: 'JAMB-style practice' })
    expect(isOriginalPractice(item)).toBe(true)
    expect(getQuestionSourceLabel(item)).toBe('JAMB-style practice')
  })
  it('leave JAMB past questions alone', () => {
    const item = q({ provider: 'jamb-past-paper', id: 30, yearLabel: '2016' } as Question['source'], { yearVerified: true })
    expect(isOriginalPractice(item)).toBe(false)
    expect(getQuestionSourceLabel(item)).toBe('JAMB 2016')
  })
})
