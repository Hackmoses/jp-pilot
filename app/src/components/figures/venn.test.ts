import { describe, expect, it } from 'vitest'
import type { VennSpec } from './spec'
import { regionMask } from './venn'

describe('Venn shading', () => {
  it('distinguishes outside, exclusive pair overlaps and the triple overlap', () => {
    const spec: VennSpec = {
      sets: ['P', 'Q', 'R'],
      shaded: [[], ['P'], ['Q', 'P'], ['P', 'Q', 'R']],
    }
    expect(spec.shaded.map((region) => regionMask(spec.sets, region))).toEqual([0, 1, 3, 7])
  })

  it('covers every exact region of two sets and rejects an unknown set', () => {
    const spec: VennSpec = { sets: ['A', 'B'], shaded: [[], ['A'], ['B'], ['A', 'B']] }
    expect(spec.shaded.map((region) => regionMask(spec.sets, region))).toEqual([0, 1, 2, 3])
    expect(regionMask(spec.sets, ['C'])).toBe(-1)
  })
})
