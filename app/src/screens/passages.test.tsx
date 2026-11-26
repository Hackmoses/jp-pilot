import type { VNode } from 'preact'
import { describe, expect, it } from 'vitest'
import { PassageText, type GapAnswer } from './PassagePanel'
import { splitGaps, type PassageSet } from './passageData'

const sets = Object.values(import.meta.glob<PassageSet>('../../../passages-bank/*.json', { eager: true, import: 'default' }))
type ProofNode = VNode<{ 'data-proof'?: string; 'data-answer'?: string }>

describe('printed passage sets', () => {
  it('has a unique set id and exam year for each set', () => {
    expect(sets.length).toBeGreaterThan(0)
    expect(new Set(sets.map(({ id }) => id)).size).toBe(sets.length)
    expect(new Set(sets.map(({ year }) => year)).size).toBe(sets.length)
  })

  it.each(sets)('$id has four distinct options and valid proof for every question', (set) => {
    expect(set.questions.length).toBeGreaterThanOrEqual(3)
    expect(set.passage.every(({ number, text }, index) => number === index + 1 && text.trim())).toBe(true)
    const gaps = set.passage.flatMap(({ text }) => splitGaps(text).flatMap(({ gap }) => gap === null ? [] : [gap]))
    for (const question of set.questions) {
      expect(question.stem.trim()).not.toBe('')
      expect(question.options).toHaveLength(4)
      expect(question.options.every(({ text, why }) => text.trim() && why.trim())).toBe(true)
      expect(new Set(question.options.map(({ text }) => text.trim().toLowerCase())).size).toBe(4)
      expect(question.answer).toMatch(/^[A-D]$/)
      expect(question.proof.length).toBeGreaterThan(0)
      for (const number of question.proof) expect(set.passage.some((line) => line.number === number)).toBe(true)
      if (set.type === 'cloze') {
        expect(question.clue?.trim()).toBeTruthy()
        expect(set.passage.some(({ number, text }) => question.proof.includes(number) && text.includes('{{' + question.number + '}}'))).toBe(true)
      }
    }
    expect(gaps).toEqual(set.type === 'cloze' ? set.questions.map(({ number }) => number) : [])
  })
})

describe('passage proof', () => {
  const passage = [{ number: 1, text: 'First line.' }, { number: 2, text: 'Gap {{16}} goes here.' },
    { number: 3, text: 'Third line.' }]

  it('marks only the active proof lines and uses the first proof as the scroll target', () => {
    const firstProof = () => {}
    const lines = PassageText({ passage, proof: [2, 3], gaps: new Map(), firstProof }).props.children as ProofNode[]
    expect(lines.map(({ props }) => props['data-proof'])).toEqual([undefined, 'true', 'true'])
    expect(lines.map(({ ref }) => ref)).toEqual([undefined, firstProof, undefined])
    const cleared = PassageText({ passage, proof: [], gaps: new Map() }).props.children as ProofNode[]
    expect(cleared.every(({ props }) => props['data-proof'] === undefined)).toBe(true)
  })

  it.each([false, true])('shows a chosen word with the right state (correct=%s)', (correct) => {
    const gaps = new Map<number, GapAnswer>([[16, { text: 'first', correct }]])
    const lines = PassageText({ passage, proof: [2], gaps }).props.children as ProofNode[]
    const gap = (lines[1].props.children as ProofNode[])[1]
    expect(gap.props.children).toBe('first')
    expect(gap.props['data-answer']).toBe(correct ? 'correct' : 'wrong')
  })
})
