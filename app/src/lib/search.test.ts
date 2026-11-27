import { describe, expect, it } from 'vitest'
import { queryWords, search, type SearchIndex } from './search'

const index: SearchIndex = { version: 1, entries: [
  { kind: 'clip', title: 'Osmosis in plants and animals', subject: 'biology', href: '#/study?subject=biology&chapter=1', words: 'osmosis water membrane' },
  { kind: 'practice', title: 'Mole concept', subject: 'chemistry', href: '#/practice?subject=chemistry&chapter=4', words: 'mole avogadro', count: 9 },
  { kind: 'cards', title: 'Antonyms', subject: 'english', href: '#/study?subject=english&chapter=5', words: 'antonyms laudable opposite' },
  { kind: 'practice', title: "Ohm's law", subject: 'physics', href: '#/practice?subject=physics&chapter=18', words: 'ohm resistance current' },
] }

describe('Ask JP search', () => {
  it('drops question words', () => {
    expect(queryWords('What is a mole?')).toEqual(['mole'])
    expect(queryWords("Ohm's law")).toEqual(['ohm', 'law'])
  })
  it('finds the example questions', () => {
    expect(search(index, 'what is a mole')[0].title).toBe('Mole concept')
    expect(search(index, 'antonym of laudable')[0].title).toBe('Antonyms')
    expect(search(index, "Ohm's law")[0].title).toBe("Ohm's law")
  })
  it('allows one typo in longer words', () => {
    expect(search(index, 'osmossis')[0].subject).toBe('biology')
  })
  it('returns nothing for empty or unknown queries', () => {
    expect(search(index, 'what is')).toEqual([])
    expect(search(index, 'zebra crossing')).toEqual([])
  })
})
