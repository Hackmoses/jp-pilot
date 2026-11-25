import { describe, expect, it } from 'vitest'
import { studyInteractive } from './TryItCard'
import { deposition, faradayConstant } from './try-it-electrolysis'
import { boylePressure, charlesVolume, molecularSpeedRatio } from './try-it-gas'
import { mirrorImage } from './try-it-mirror'

describe('gas laws', () => {
  it('conserves PV at constant temperature and doubles pressure when volume halves', () => {
    expect(boylePressure(2)).toBe(100)
    expect(boylePressure(1)).toBe(200)
    expect(boylePressure(4)).toBe(50)
    for (const volume of [1, 1.3, 2, 3.7, 4]) {
      expect(boylePressure(volume) * volume).toBeCloseTo(200)
    }
  })

  it('conserves V/T at constant pressure with temperature measured in kelvin', () => {
    expect(charlesVolume(150)).toBe(1)
    expect(charlesVolume(300)).toBe(2)
    expect(charlesVolume(600)).toBe(4)
    expect(charlesVolume(455) / 455).toBeCloseTo(2 / 300)
  })

  it('scales the speed of molecules with the square root of kelvin temperature', () => {
    expect(molecularSpeedRatio(300)).toBe(1)
    expect(molecularSpeedRatio(600)).toBeCloseTo(Math.sqrt(2))
    expect(molecularSpeedRatio(150)).toBeCloseTo(Math.sqrt(0.5))
  })
})

describe('Faraday’s law', () => {
  it('converts current and time to charge, electron moles and copper mass', () => {
    expect(faradayConstant).toBe(96500)
    const result = deposition(2, 965, 'copper')
    expect(result.charge).toBe(1930)
    expect(result.electronMoles).toBeCloseTo(0.02, 9)
    expect(result.mass).toBeCloseTo(0.635, 9)
    expect(deposition(2, 1930, 'copper').mass).toBeCloseTo(1.27, 9)
    expect(deposition(4, 965, 'copper').mass).toBeCloseTo(1.27, 9)
  })

  it('uses the electron count and molar mass for silver and aluminium', () => {
    expect(deposition(2, 965, 'silver').mass).toBeCloseTo(2.16, 9)
    expect(deposition(2, 965, 'aluminium').mass).toBeCloseTo(0.18, 9)
    expect(deposition(0, 965, 'copper')).toEqual({ charge: 0, electronMoles: 0, mass: 0 })
    expect(deposition(2, 0, 'silver').mass).toBe(0)
  })
})

describe('concave mirror', () => {
  it('gives an inverted image of half the size for u = 15 cm and f = 5 cm', () => {
    const { v, magnification } = mirrorImage(15, 5)!
    expect(v).toBe(7.5)
    expect(magnification).toBe(-0.5)
    expect(Math.abs(magnification)).toBe(0.5)
  })

  it('covers C, between C and F, at F, and inside F', () => {
    expect(mirrorImage(10, 5)).toEqual({ v: 10, magnification: -1 })
    expect(mirrorImage(7.5, 5)).toEqual({ v: 15, magnification: -2 })
    expect(mirrorImage(5, 5)).toBeNull()
    expect(mirrorImage(2.5, 5)).toEqual({ v: -5, magnification: 2 })
    for (const u of [2.5, 4.5, 5.5, 10, 20]) {
      const { v } = mirrorImage(u, 5)!
      expect(1 / u + 1 / v).toBeCloseTo(1 / 5, 9)
    }
  })
})

it('offers interactives only for their study chapters', () => {
  expect(studyInteractive('chemistry', '3')?.title).toBe('Gas laws')
  expect(studyInteractive('chemistry', '15')?.title).toBe('Electrolysis')
  expect(studyInteractive('chemistry', '1')).toBeUndefined()
  expect(studyInteractive('physics', 'Reflection', 'Optical instruments')).toBeUndefined()
  expect(studyInteractive('physics', 'Optical instruments', 'Optical instruments')?.title).toBe('Concave mirror')
})
