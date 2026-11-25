import { describe, expect, it } from 'vitest'
import { hasMathNotation, mathToSpeech, renderMathText } from './mathText'

describe('mathText', () => {
  it('returns plain text unchanged when no maths notation is present', () => {
    const plain = 'What is the oxidation state of chlorine in KClO₃?'
    expect(hasMathNotation(plain)).toBe(false)
    expect(renderMathText(plain)).toBe(plain)
  })

  it('parses fractions, roots, superscripts, subscripts, and tall brackets', () => {
    expect(hasMathNotation('\\frac{3}{4}')).toBe(true)
    expect(hasMathNotation('\\sqrt{5}')).toBe(true)
    expect(hasMathNotation('6r7_{8}')).toBe(true)
    expect(hasMathNotation('x^{2}')).toBe(true)
    expect(hasMathNotation('\\left(\\frac{81}{16}\\right)^{-\\frac{1}{4}}')).toBe(true)

    const rendered = renderMathText('\\left(\\frac{81}{16}\\right)^{-\\frac{1}{4}} × 2^{-1}')
    expect(Array.isArray(rendered)).toBe(true)
  })

  it('converts maths notation into spoken words', () => {
    expect(mathToSpeech('\\frac{3}{4}')).toBe('3 over 4')
    expect(mathToSpeech('x^{2}')).toBe('x squared')
    expect(mathToSpeech('\\sqrt{5}')).toBe('the square root of 5')
    expect(mathToSpeech('6r7_{8} = 511_{9}')).toBe('6r7 base 8 equals 511 base 9')
    expect(mathToSpeech('\\left(\\frac{81}{16}\\right)^{-\\frac{1}{4}} × 2^{-1}')).toBe(
      '81 over 16 to the power of minus 1 over 4 times 2 to the power of minus 1',
    )
    expect(mathToSpeech('₦400')).toBe('400 naira')
  })
})
