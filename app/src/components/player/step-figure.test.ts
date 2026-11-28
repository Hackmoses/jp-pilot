import { describe, expect, it } from 'vitest'
import { cueShares, reachedAt } from './StepFigure'

describe('concept lesson figures', () => {
  const line = 'A cell needs a border. In a cell, the thin gate is the membrane.'
  it('places each cue word at its share of the spoken line, in order', () => {
    const shares = cueShares(line, [{ word: 'border', cue: 'a' }, { word: 'membrane', cue: 'b' }])
    expect(shares[0]).toBeCloseTo(4 / 14)
    expect(shares[1]).toBeCloseTo(13 / 14)
  })
  it('draws a part once the voice reaches its word', () => {
    const shares = [0.3, 0.9]
    expect(reachedAt(shares, 0)).toBe(0)
    expect(reachedAt(shares, 0.35)).toBe(1)
    expect(reachedAt(shares, 1)).toBe(2)
  })
})
