import { describe, expect, it } from 'vitest'
import { activeTab } from './BottomBar'

describe('bottom bar', () => {
  it('marks the tab for the current screen', () => {
    expect(activeTab('#/')).toBe('home')
    expect(activeTab('')).toBe('home')
    expect(activeTab('#/subjects?mode=study')).toBe('study')
    expect(activeTab('#/study?subject=chemistry')).toBe('study')
    expect(activeTab('#/subjects?mode=practice')).toBe('practice')
    expect(activeTab('#/practice?subject=physics')).toBe('practice')
    expect(activeTab('#/exam/rules')).toBe('exam')
    expect(activeTab('#/start')).toBe(null)
  })
})
