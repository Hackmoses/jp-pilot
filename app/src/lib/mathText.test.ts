import { isValidElement, type VNode } from 'preact'
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

describe('matrix notation', () => {
  it('renders a square bracketed matrix with nested maths in row-major order', () => {
    const matrix = element(renderMathText('\\matrix{1,\\frac{1}{2};x_{1},4}'))
    expect(matrix.props.class).toBe('jp-math-matrix')
    const grid = element(matrix.props.children)
    expect(grid.props.style).toEqual({ gridTemplateColumns: 'repeat(2, auto)' })
    const cells = grid.props.children as unknown[]
    expect(cells).toHaveLength(4)
    expect(element(cells[0]).props.children).toBe('1')
    expect(element(element(cells[1]).props.children).props.class).toBe('jp-math-frac')
    expect(element(cells[3]).props.children).toBe('4')
  })

  it('renders determinant bars and preserves all rows in the accessible name', () => {
    const determinant = element(renderMathText('\\det{2,0,5;4,6,3;8,9,1}'))
    expect(determinant.props.class).toBe('jp-math-matrix jp-math-matrix--det')
    expect(element(determinant.props.children).props.children).toHaveLength(9)
    expect(determinant.props['aria-label']).toBe('the determinant with rows 2, 0, 5; 4, 6, 3 and 8, 9, 1')
    expect(mathToSpeech('If \\det{x,3;2,7} = 15')).toBe('If the determinant with rows x, 3 and 2, 7 equals 15')
    expect(mathToSpeech('\\matrix{1,\\frac{1}{2};\\frac{3}{4},4}')).toBe('the matrix with rows 1, 1 over 2 and 3 over 4, 4')
  })

  it('preserves malformed or unsupported matrix text', () => {
    for (const text of ['\\matrix{a,b;c}', '\\det{1,2;3,}', '\\det{1,2;3,4']) {
      expect(renderMathText(text)).toBe(text)
      expect(mathToSpeech(text)).toBe(text)
    }
  })
})

function element(value: unknown) {
  if (!isValidElement(value)) throw new Error('Expected a rendered element')
  return value as VNode<Record<string, unknown>>
}
