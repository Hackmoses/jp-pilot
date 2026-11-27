import { describe, expect, it } from 'vitest'
import { mayAnswer } from './access'
import { greetingFor } from './greeting'

describe('visitor access', () => {
  it('never limits while accounts are off', () => {
    expect(mayAnswer('q9', { enabled: false, answered: ['a', 'b', 'c', 'd', 'e'] })).toBe(true)
  })
  it('allows four free questions, then asks for an account', () => {
    expect(mayAnswer('q4', { enabled: true, answered: ['a', 'b', 'c'] })).toBe(true)
    expect(mayAnswer('q5', { enabled: true, answered: ['a', 'b', 'c', 'd'] })).toBe(false)
    expect(mayAnswer('b', { enabled: true, answered: ['a', 'b', 'c', 'd'] })).toBe(true)
    expect(mayAnswer('q5', { enabled: true, signedIn: true, answered: ['a', 'b', 'c', 'd'] })).toBe(true)
  })
})

describe('greeting', () => {
  it('follows the local time of day', () => {
    expect(greetingFor(new Date(2026, 10, 26, 8))).toBe('Good morning')
    expect(greetingFor(new Date(2026, 10, 26, 12))).toBe('Good afternoon')
    expect(greetingFor(new Date(2026, 10, 26, 16, 59))).toBe('Good afternoon')
    expect(greetingFor(new Date(2026, 10, 26, 17))).toBe('Good evening')
  })
})
