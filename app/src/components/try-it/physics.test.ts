import { describe, expect, it } from 'vitest'
import { STUDY_TOPICS, STUDY_TRY_IDS } from '../../lib/sections'
import { studyChapterIds, studyInteractives } from './TryItCard'
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

it('pins lessons to syllabus topics, in step with the Study topic list', () => {
  const titles = (subject: string, chapter: string) => studyInteractives(subject, chapter).map((lesson) => lesson.title)
  expect(['1', '2', '3', '11', '13', '14', '15'].map((chapter) => titles('chemistry', chapter))).toEqual([
    [], ['Mole bridge', 'Limiting reagent'], ['Gas laws', 'Diffusion race', 'Partial pressures'],
    ['Freezing point depression'], ['pH scale'], ['Oxidation number finder'], ['Electrolysis'],
  ])
  expect(titles('physics', '2')).toEqual(['Relative velocity', 'Free fall'])
  expect(titles('physics', '5')).toEqual(['Pulley and machine efficiency'])
  expect(titles('physics', '12')).toEqual(['Wave on a string'])
  expect(titles('physics', '14')).toEqual(['Concave mirror'])
  expect(titles('physics', '15')).toEqual([])
  expect(titles('physics', '17')).toEqual(['Capacitors'])
  expect(titles('physics', '18')).toEqual(['Circuit lab'])
  expect(titles('biology', '1')).toEqual(['Osmosis cell'])
  expect(titles('biology', '10')).toEqual(['Punnett square'])
  expect(titles('mathematics', '1')).toEqual(['Number base converter'])
  expect(titles('mathematics', '3')).toEqual(['Indices explorer'])
  for (const subject of ['chemistry', 'physics', 'biology', 'mathematics']) {
    expect([...studyChapterIds(subject)].sort()).toEqual([...STUDY_TOPICS[subject]].sort())
  }
})

it('keeps the Study page Try it ids in step with the Try it list', () => {
  for (const [subject, chapters] of Object.entries(STUDY_TRY_IDS)) {
    for (const [chapter, ids] of Object.entries(chapters)) {
      expect(studyInteractives(subject, chapter).map((lesson) => lesson.id ?? null)).toEqual(ids)
    }
  }
})
