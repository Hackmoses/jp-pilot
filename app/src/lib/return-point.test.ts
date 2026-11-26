import { beforeEach, describe, expect, it } from 'vitest'
import { arriveAtReturnPoint, clearReturnPoint, getReturnPoint, setReturnPoint, type Attempt } from './modes'

const practice = (deadline: number | null) => ({
  id: 'practice-1', mode: 'practice', subjects: ['english'], ids: ['a', 'b'], reviewIds: [], answers: {},
  index: 1, startedAt: 0, deadline,
}) as unknown as Attempt

describe('return to practice', () => {
  beforeEach(() => { clearReturnPoint() })

  it('clears the return point when the student is back at the question', () => {
    setReturnPoint({ href: '#/practice/run', label: 'Back to practice · Question 2 of 2', pausedAt: null })
    arriveAtReturnPoint(practice(null), '#/practice/run')
    expect(getReturnPoint()).toBeNull()
  })

  it('gives timed practice back the minutes spent learning', () => {
    const attempt = practice(100_000)
    setReturnPoint({ href: '#/practice/run', label: 'x', pausedAt: 10_000 })
    arriveAtReturnPoint(attempt, '#/practice/run', 70_000)
    expect(attempt.deadline).toBe(160_000)
  })

  it('keeps the return point while the student is still elsewhere', () => {
    setReturnPoint({ href: '#/q?id=other', label: 'x', pausedAt: null })
    arriveAtReturnPoint(practice(null), '#/practice/run')
    expect(getReturnPoint()).not.toBeNull()
  })
})
