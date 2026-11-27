import { describe, expect, it } from 'vitest'
import { addDays, lagosDate, nextStreak, streakOn, subjectFor, subjectTurn } from './qotd'

describe('question of the day', () => {
  it('rolls over at midnight in Lagos, not UTC', () => {
    expect(lagosDate(Date.parse('2026-11-26T22:59:00Z'))).toBe('2026-11-26')
    expect(lagosDate(Date.parse('2026-11-26T23:00:00Z'))).toBe('2026-11-27')
  })
  it('follows the weekday rotation', () => {
    expect(subjectFor('2026-11-23')).toBe('physics') // Monday
    expect(subjectFor('2026-11-24')).toBe('chemistry')
    expect(subjectFor('2026-11-25')).toBe('biology')
    expect(subjectFor('2026-11-26')).toBe('mathematics')
    expect(subjectFor('2026-11-27')).toBe('english')
    expect(subjectFor('2026-11-30')).toBe('physics')
  })
  it('spreads weekends across all five subjects', () => {
    const seen = new Set<string>()
    for (let week = 0; week < 5; week++) {
      seen.add(subjectFor(addDays('2026-11-28', week * 7)))
      seen.add(subjectFor(addDays('2026-11-29', week * 7)))
    }
    expect(seen.size).toBe(5)
  })
  it('gives each subject the next turn without repeats', () => {
    const turns = new Map<string, number[]>()
    for (let i = 0; i < 120; i++) {
      const day = addDays('2026-11-23', i)
      const list = turns.get(subjectFor(day)) ?? []
      list.push(subjectTurn(day))
      turns.set(subjectFor(day), list)
    }
    for (const list of turns.values()) expect(list).toEqual(list.map((_, i) => i))
  })
  it('keeps a streak across consecutive days and resets after a missed day', () => {
    expect(nextStreak(null, 0, '2026-11-26')).toBe(1)
    expect(nextStreak('2026-11-25', 4, '2026-11-26')).toBe(5)
    expect(nextStreak('2026-11-26', 5, '2026-11-26')).toBe(5)
    expect(nextStreak('2026-11-23', 5, '2026-11-26')).toBe(1)
    expect(streakOn('2026-11-27', { answers: {}, last: '2026-11-26', count: 3 })).toBe(3)
    expect(streakOn('2026-11-28', { answers: {}, last: '2026-11-26', count: 3 })).toBe(0)
  })
})
