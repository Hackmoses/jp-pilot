import { expect, it } from 'vitest'
import { hasCompletedInteractive, hasStudied, markInteractiveCompleted } from '../../lib/modes'
import { capacitance, capacitanceTarget } from './try-it-capacitors'
import { graham, unknownMass } from './try-it-diffusion'
import { arrival, falling } from './try-it-free-fall'
import { freezingDrop, freezingTarget } from './try-it-freezing'
import { indexValue } from './try-it-indices'
import { reaction, waterTarget } from './try-it-limiting'
import { gasPressures } from './try-it-partial-pressure'
import { pulley } from './try-it-pulley'
import { inheritance } from './try-it-punnett'
import { relativeVelocity } from './try-it-relative-velocity'

it('balances hydrogen and oxygen and reports leftover reactants', () => {
  expect(reaction(8, 8)).toEqual({ water: 8, hydrogenLeft: 0, oxygenLeft: 4 })
  expect(reaction(8, 20).oxygenLeft).toBe(16)
  expect(reaction(6, 2)).toEqual({ water: 4, hydrogenLeft: 2, oxygenLeft: 0 })
  expect(reaction(0, 2).water).toBe(0)
  expect(waterTarget(4, 2)).toBe(true)
  expect(waterTarget(4.1, 2)).toBe(true)
  expect(waterTarget(4.2, 2)).toBe(false)
  expect(waterTarget(4, 2.2)).toBe(false)
})

it('uses the square root of the inverse mass ratio and predicts the meeting point', () => {
  expect(graham(4, 16)).toEqual({ ratio: 2, meet: 2 / 3 })
  expect(graham(16, 4).ratio).toBe(0.5)
  expect(graham(17, 36.5).meet).toBeGreaterThan(0.5)
  expect(graham(32, 32).meet).toBe(0.5)
  expect(unknownMass(16, 2)).toBe(4)
})

it('changes the total pressure while preserving the original gas’s partial pressure', () => {
  expect(gasPressures([1, 0, 0]).partials[0]).toBe(380)
  const mixture = gasPressures([1, 2, 1])
  expect(mixture.total).toBe(1520)
  expect(mixture.partials).toEqual([380, 760, 380])
  expect(mixture.fractions).toEqual([0.25, 0.5, 0.25])
  expect(gasPressures([0, 0, 0]).total).toBe(0)
})

it('calculates freezing point depression with the particle factor', () => {
  expect(freezingDrop(1, false)).toBeCloseTo(1.86)
  expect(freezingDrop(1, true)).toBeCloseTo(3.72)
  expect(freezingDrop(1.5, false)).toBeCloseTo(2.79)
  expect(freezingTarget(1, false)).toBe(true)
  expect(freezingTarget(0.5, true)).toBe(true)
  expect(freezingTarget(1.02, false)).toBe(true)
  expect(freezingTarget(1.04, false)).toBe(false)
})

it('subtracts signed velocities in same and opposite directions', () => {
  expect(relativeVelocity(100, 130, false)).toBe(30)
  expect(relativeVelocity(100, 130, true)).toBe(-230)
  expect(relativeVelocity(80, 50, false)).toBe(-30)
})

it('models vacuum fall and slower arrival with greater drag', () => {
  expect(arrival(20)).toBe(2)
  expect(falling(2)).toEqual({ distance: 20, speed: 20 })
  const stone = arrival(20, 22)
  const feather = arrival(20, 3)
  expect(stone).toBeGreaterThan(2)
  expect(feather).toBeGreaterThan(stone)
  expect(falling(feather, 3).distance).toBeCloseTo(20)
  expect(falling(feather, 3).speed).toBeLessThan(3)
})

it('relates pulley efficiency to the distance, effort and work', () => {
  const result = pulley(6, 800, 200 / 3)
  expect(result.effort).toBeCloseTo(400)
  expect(result.advantage).toBeCloseTo(2)
  expect(result.efficiency).toBeCloseTo(33.333)
  expect(result.rope).toBe(6)
  expect(result.workIn).toBeCloseTo(2400)
  expect(pulley(6, 800, 0).workIn).toBeCloseTo(800)
})

it('combines capacitances and converts microfarads when calculating joules', () => {
  const result = capacitance([2, 4, 8], true, 6)
  expect(result.total).toBe(14)
  expect(result.charge).toBe(84)
  expect(result.energy).toBeCloseTo(2.52e-4, 10)
  expect(capacitance([2, 4, 8], false, 6).total).toBeCloseTo(8 / 7)
  expect(capacitanceTarget(result.total)).toBe(true)
  expect(capacitanceTarget(13.9)).toBe(true)
  expect(capacitanceTarget(13.89)).toBe(false)
})

it('splits X-linked outcomes by child’s sex', () => {
  expect(inheritance('Hh', 'H')).toEqual({ sons: 50, daughters: 0, carriers: 50 })
  expect(inheritance('Hh', 'h')).toEqual({ sons: 50, daughters: 50, carriers: 50 })
  expect(inheritance('HH', 'h')).toEqual({ sons: 0, daughters: 0, carriers: 100 })
  expect(inheritance('hh', 'h')).toEqual({ sons: 100, daughters: 100, carriers: 0 })
})

it('takes reciprocals and fractional roots without changing the sign', () => {
  expect(indexValue(4, 1, -0.5)).toBe(0.5)
  expect(indexValue(81, 16, -0.25)).toBeCloseTo(2 / 3)
  expect(indexValue(16, 81, 0.25)).toBeCloseTo(2 / 3)
  expect(indexValue(81, 16, -0.25) * indexValue(2, 1, -1)).toBeCloseTo(1 / 3)
})

it('keeps the older chapter completion and the newer lesson keys independent', () => {
  markInteractiveCompleted('chemistry', '2')
  expect(hasCompletedInteractive('chemistry', '2')).toBe(true)
  expect(hasCompletedInteractive('chemistry', '2', 'limiting')).toBe(false)
  markInteractiveCompleted('chemistry', '3', 'diffusion')
  expect(hasStudied('chemistry', '3')).toBe(true)
  expect(hasCompletedInteractive('chemistry', '3')).toBe(false)
  expect(hasCompletedInteractive('chemistry', '3', 'diffusion')).toBe(true)
  expect(hasCompletedInteractive('chemistry', '3', 'partial-pressure')).toBe(false)
})
