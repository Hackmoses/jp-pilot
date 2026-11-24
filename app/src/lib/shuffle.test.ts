import { describe, expect, it } from 'vitest'
import questionsFile from '../../../data/questions.json'
import { getQuestions, registerSubjectData } from './data'
import { shuffleOptions } from './shuffle'
import type { Question } from './types'

registerSubjectData('chemistry', questionsFile.questions as unknown as Question[])
const question = getQuestions()[0]

describe('shuffleOptions', () => {
  it('is repeatable and can change the order with another seed', () => {
    const order = (seed: number) => shuffleOptions(question, seed).map(({ id }) => id)
    expect(order(0)).toEqual(order(0))
    expect(new Set([0, 1, 2, 3].map((seed) => order(seed).join(''))).size).toBeGreaterThan(1)
  })

  it('keeps locked options at their original positions without mutating the question', () => {
    const locked = { ...question, lockedOptions: [question.options[0].id, question.options[2].id] }
    const original = question.options.slice()

    for (let seed = 0; seed < 12; seed++) {
      const options = shuffleOptions(locked, seed)
      expect(options).not.toBe(question.options)
      expect(options[0]).toBe(original[0])
      expect(options[2]).toBe(original[2])
      expect(new Set(options)).toEqual(new Set(original))
    }
    expect(question.options).toEqual(original)
  })

  it('preserves the order when every option is locked', () => {
    const locked = { ...question, lockedOptions: question.options.map(({ id }) => id) }
    expect(shuffleOptions(locked, 42)).toEqual(question.options)
  })
})
