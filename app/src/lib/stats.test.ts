import { describe, expect, it } from 'vitest'
import { overLabel, roundDown } from './stats'

describe('home counts', () => {
  it('rounds down so the label is always true', () => {
    expect(overLabel(258)).toBe('Over 250')
    expect(overLabel(217)).toBe('Over 200')
    expect(overLabel(167)).toBe('Over 150')
    expect(overLabel(1262)).toBe('Over 1,200')
    expect(overLabel(505)).toBe('Over 500')
    expect(overLabel(66)).toBe('Over 60')
    expect(overLabel(500)).toBe('500')
    expect(overLabel(7)).toBe('7')
    expect(roundDown(5321)).toBe(5300)
  })
})
