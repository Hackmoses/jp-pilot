import { expect, it } from 'vitest'
import { interpolate } from './motion'

it('counts both values in a reading and finishes at the exact formatted value', () => {
  const reading = interpolate('20.00 m · 4.0 m/s', '10.00 m · 8.0 m/s', true)
  expect(reading(0.5)).toBe('15.00 m · 6.0 m/s')
  expect(reading(1)).toBe('10.00 m · 8.0 m/s')
})

it('moves an SVG shape through fractional coordinates and preserves its commands', () => {
  const shape = interpolate('M80 2 L100 -5', 'M120 6 L120 7')
  expect(shape(0.25)).toBe('M90.000 3.000 L105.000 -2.000')
  expect(shape(1)).toBe('M120 6 L120 7')
})

it('switches between non-comparable formats and interpolates signed readings', () => {
  expect(interpolate('25 cm', 'At infinity', true)(0.5)).toBe('At infinity')
  expect(interpolate('−4 °C', '2 °C', true)(0.5)).toBe('-1 °C')
})
