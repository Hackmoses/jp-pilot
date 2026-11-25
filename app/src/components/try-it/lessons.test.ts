import { expect, it } from 'vitest'
import { placeValues, toDecimal } from './try-it-bases'
import { circuit, circuitTarget } from './try-it-circuit'
import { moleBridge, moleTarget } from './try-it-moles'
import { osmosis } from './try-it-osmosis'
import { oxidationNumber, oxidationTotal } from './try-it-oxidation'
import { phTarget, strongPH } from './try-it-ph'
import { waveValues } from './try-it-wave'

it('converts mass to moles and particles, with s.t.p. volume for gases only', () => {
  const sodium = moleBridge('Na', 4.6)
  expect(sodium.moles).toBeCloseTo(0.2)
  expect(sodium.particles / 1e23).toBeCloseTo(1.204)
  expect(sodium.volume).toBeNull()
  expect(moleBridge('H₂O', 18).volume).toBeNull()
  expect(moleBridge('O₂', 16).volume).toBeCloseTo(11.2)
  expect(moleTarget('Na', 6.9, 0.3)).toBe(true)
  expect(moleTarget('Na', 6.94, 0.3)).toBe(true)
  expect(moleTarget('Na', 6.95, 0.3)).toBe(false)
  expect(moleTarget('H₂O', 5.4, 0.3)).toBe(false)
})

it('tracks pH after dilution of a strong acid and a strong base', () => {
  expect(strongPH('HCl', 0.001)).toBe(3)
  expect(strongPH('HCl', 0.01)).toBe(2)
  expect(strongPH('NaOH', 0.1)).toBe(13)
  expect(strongPH('NaOH', 0.01)).toBe(12)
  expect(phTarget('HCl', 0.001, 3)).toBe(true)
  expect(phTarget('HCl', 10 ** -3.00001, 3)).toBe(false)
  expect(phTarget('NaOH', 0.001, 3)).toBe(false)
})

it('balances the oxidation number contributions to the charge', () => {
  expect(oxidationNumber('NH₃')).toBe(-3)
  expect(oxidationNumber('H₂SO₄')).toBe(6)
  expect(oxidationNumber('KMnO₄')).toBe(7)
  expect(oxidationNumber('Cr₂O₇²⁻')).toBe(6)
  expect(oxidationNumber('NO₃⁻')).toBe(5)
  expect(oxidationTotal('Cr₂O₇²⁻', 6)).toBe(-2)
  expect(oxidationTotal('Cr₂O₇²⁻', 5)).toBe(-4)
})

it('combines resistors and accounts for terminal voltage loss', () => {
  const ideal = circuit([4, 4, 4], 'parallel', 16, 0)
  expect(ideal.total).toBeCloseTo(4 / 3)
  expect(ideal.current).toBeCloseTo(12)
  expect(ideal.terminal).toBeCloseTo(16)
  expect(circuit([4, 4], 'parallel', 8, 2)).toEqual({ total: 2, current: 2, terminal: 4 })
  expect(circuit([4, 4], 'series', 8, 0)).toEqual({ total: 8, current: 1, terminal: 8 })
  expect(circuitTarget(2, 2)).toBe(true)
  expect(circuitTarget(1.94, 2)).toBe(true)
  expect(circuitTarget(2.07, 2)).toBe(false)
})

it('finds wavelength and period at the given speed and frequency', () => {
  expect(waveValues(10, 420)).toEqual({ wavelength: 42, period: 0.1 })
  expect(waveValues(5, 420)).toEqual({ wavelength: 84, period: 0.2 })
})

it('shows correct directions and states for plant cells in all three solutions', () => {
  expect(osmosis('Dilute')).toMatchObject({ water: 'Into the cell', cell: 'Turgid' })
  expect(osmosis('Equal')).toMatchObject({ water: 'No net flow', cell: 'No change' })
  expect(osmosis('Concentrated')).toMatchObject({ water: 'Out of the cell', cell: 'Plasmolysed' })
})

it('converts place-value contributions from bases two through ten', () => {
  expect(placeValues(9, [5, 1, 1])).toEqual([405, 9, 1])
  expect(toDecimal(9, [5, 1, 1])).toBe(415)
  expect(toDecimal(8, [6, 3, 7])).toBe(415)
  expect(toDecimal(2, [1, 0, 1])).toBe(5)
  expect(toDecimal(10, [5, 1, 1])).toBe(511)
})
