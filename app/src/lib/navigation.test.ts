import { describe, expect, it } from 'vitest'
import { canGoBack, recordVisit } from './navigation'

describe('back trail', () => {
  it('adds new screens and removes one when the student goes back', () => {
    let trail = recordVisit('#/', [])
    trail = recordVisit('#/subjects?mode=practice', trail)
    trail = recordVisit('#/practice?subject=english', trail)
    expect(trail).toEqual(['#/', '#/subjects?mode=practice', '#/practice?subject=english'])
    trail = recordVisit('#/subjects?mode=practice', trail)
    expect(trail).toEqual(['#/', '#/subjects?mode=practice'])
    expect(canGoBack(trail)).toBe(true)
    expect(canGoBack(recordVisit('', []))).toBe(false)
  })
})
