import { describe, expect, it } from 'vitest'
import {
  findSlashFractions,
  scanAnimationForSlashFractions,
  scanQuestionForSlashFractions,
} from '../../scripts/fraction-check.mjs'

const dataFiles = import.meta.glob('../../../data/**/*.json', { eager: true, import: 'default' }) as Record<
  string,
  Record<string, unknown>
>
const lessonFiles = import.meta.glob('../../../lessons-bank/*.json', { eager: true, import: 'default' }) as Record<
  string,
  Record<string, unknown>
>

describe('fraction notation rules', () => {
  it('uses \\frac{numerator}{denominator} instead of / in all data/ question and animation files', () => {
    const entries = Object.entries(dataFiles)
    expect(entries.length).toBeGreaterThan(0)
    const violations: string[] = []

    for (const [filePath, parsed] of entries) {
      const name = filePath.split('/').pop() ?? filePath
      if (name.includes('question') || name.includes('batch')) {
        const questions = Array.isArray(parsed.questions)
          ? (parsed.questions as Record<string, unknown>[])
          : Array.isArray(parsed)
            ? (parsed as Record<string, unknown>[])
            : []
        for (const question of questions) {
          for (const issue of scanQuestionForSlashFractions(question)) {
            violations.push(`${filePath} [${issue.id}] ${issue.field}: ${issue.hits.join(', ')}`)
          }
        }
      } else if (name.includes('animation')) {
        const animations = Array.isArray(parsed.animations)
          ? (parsed.animations as Record<string, unknown>[])
          : Array.isArray(parsed)
            ? (parsed as Record<string, unknown>[])
            : []
        for (const anim of animations) {
          for (const issue of scanAnimationForSlashFractions(anim)) {
            violations.push(`${filePath} [${issue.id}] ${issue.field}: ${issue.hits.join(', ')}`)
          }
        }
      }
    }

    expect(violations).toEqual([])
  })

  it('uses \\frac{numerator}{denominator} in lessons-bank on-screen text rendered with renderMathText', () => {
    const entries = Object.entries(lessonFiles)
    expect(entries.length).toBeGreaterThan(0)
    const violations: string[] = []

    // LessonPlayer.tsx currently renders scene.beats[].label as raw text without renderMathText,
    // so only rendered fields (lesson.title, pastQuestion, and tryIt explain blocks) are checked here.
    for (const [filePath, parsed] of entries) {
      if (!Array.isArray(parsed?.lessons)) continue

      for (const lesson of parsed.lessons as Array<Record<string, unknown>>) {
        const check = (field: string, value: unknown) => {
          const hits = findSlashFractions(value)
          if (hits.length > 0) {
            violations.push(`${filePath} [${String(lesson.id)}] ${field}: ${hits.join(', ')}`)
          }
        }
        check('title', lesson.title)
        const pq = lesson.pastQuestion as Record<string, unknown> | null | undefined
        if (pq) {
          check('pastQuestion.prompt', pq.prompt)
          check('pastQuestion.instructions', pq.instructions)
          check('pastQuestion.afterOptions', pq.afterOptions)
          const opts = Array.isArray(pq.options) ? pq.options : []
          for (let i = 0; i < opts.length; i++) {
            check(`pastQuestion.options[${i}]`, opts[i])
          }
        }
        const tryIt = lesson.tryIt as Record<string, unknown> | null | undefined
        if (tryIt && typeof tryIt === 'object') {
          check('tryIt.prompt', tryIt.prompt)
          check('tryIt.feedback', tryIt.feedback)
          const opts = Array.isArray(tryIt.options) ? tryIt.options : []
          for (let i = 0; i < opts.length; i++) {
            check(`tryIt.options[${i}]`, opts[i])
          }
        }
      }
    }

    expect(violations).toEqual([])
  })

  it('allows units, rates, IPA, and prose slashes while catching slash fractions', () => {
    expect(findSlashFractions('0.2 mol/dm³, 160 g/mol, 10 m/s², 60 km/h')).toEqual([])
    expect(findSlashFractions('Pronounced /kuː/ and /aɪ/, using Yes/No and and/or')).toEqual([])
    expect(findSlashFractions('Use t_{1/2} and ₦600/£1 and ₦40 / kWh')).toEqual([])
    expect(findSlashFractions('Buffer NH₃ / NH₄Cl and acetic acid / sodium acetate')).toEqual([])
    expect(findSlashFractions('Contains 2/40 mol')).toEqual(['2/40'])
    expect(findSlashFractions('P₁V₁/T₁ = P₂V₂/T₂')).toEqual(['P₁V₁/T₁', 'P₂V₂/T₂'])
    expect(findSlashFractions('Find dy/dx')).toEqual(['dy/dx'])
    expect(findSlashFractions('(a+b)/c')).toEqual(['(a+b)/c'])
  })
})
