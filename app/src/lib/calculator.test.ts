import { describe, expect, it } from 'vitest'
import { initialCalc, pressKey, type CalcKey } from './calculator'

const run = (keys: CalcKey[], start = initialCalc) => keys.reduce(pressKey, start)

describe('calculator', () => {
  it('adds and shows clean decimals', () => {
    expect(run(['0', '.', '1', '+', '0', '.', '2', '=']).value).toBe('0.3')
  })
  it('chains operations left to right', () => {
    expect(run(['2', '+', '3', '×', '4', '=']).value).toBe('20')
  })
  it('swaps the operator when two are pressed in a row', () => {
    expect(run(['9', '+', '−', '4', '=']).value).toBe('5')
  })
  it('shows Error for divide by zero and recovers on a digit', () => {
    const state = run(['5', '÷', '0', '='])
    expect(state.value).toBe('Error')
    expect(pressKey(state, '7').value).toBe('7')
  })
  it('handles square root, square, sign and percent', () => {
    expect(run(['8', '1', '√']).value).toBe('9')
    expect(run(['1', '2', 'x²']).value).toBe('144')
    expect(run(['4', '±']).value).toBe('-4')
    expect(run(['5', '0', '%']).value).toBe('0.5')
    expect(run(['4', '±', '√']).value).toBe('Error')
  })
  it('keeps memory across clear', () => {
    let state = run(['6', 'M+', '4', 'M+', '3', 'M−'])
    expect(state.memory).toBe(7)
    state = pressKey(state, 'C')
    expect(pressKey(state, 'MR').value).toBe('7')
    expect(pressKey(state, 'MC').memory).toBe(0)
  })
  it('CE clears the entry but keeps the pending sum', () => {
    expect(run(['8', '+', '5', 'CE', '2', '=']).value).toBe('10')
  })
})
