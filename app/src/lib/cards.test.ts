import { expect, it } from 'vitest'
import { rateCard, selectCards, type Reviews } from './leitner'
import { ENGLISH_CARD_TOPICS, STUDY_TOPICS, syllabusSections } from './sections'

const deckFiles = import.meta.glob('../../../cards-bank/*.json', { eager: true, import: 'default' })
const pilotCounts = {
  synonyms: 80, antonyms: 80, idioms: 40, 'phrasal-verbs-prepositions': 30,
  'confusable-words': 30, spelling: 50, 'grammar-rules': 30,
}

type Deck = {
  title: string
  cards: {
    id: string; deck: string; front: string; meaning: string; example: string
    jamb?: { year: number; number: number; context?: string }
    check?: boolean; note?: string
    trap?: string; rule?: { text: string; right: string; wrong: string }
  }[]
}
const decks = Object.fromEntries(Object.entries(deckFiles).map(([name, contents]) =>
  [name.split('/').pop()!.replace('.json', ''), contents as Deck],
))

it('has a complete pilot of distinct cards with valid citations and Study topics', () => {
  expect(Object.keys(decks).sort()).toEqual(Object.keys(pilotCounts).sort())
  expect(Object.values(ENGLISH_CARD_TOPICS).sort()).toEqual(Object.keys(decks).sort())
  expect(STUDY_TOPICS.english).toEqual(Object.keys(ENGLISH_CARD_TOPICS))
  const chapters = syllabusSections('english', true).flatMap(({ chapters }) => chapters.map(({ id }) => id))
  expect(chapters).toEqual(expect.arrayContaining(STUDY_TOPICS.english))
  const ids = new Set()
  for (const [deckId, count] of Object.entries(pilotCounts)) {
    const { title, cards } = decks[deckId]
    const fronts = new Set()
    expect(title.trim()).not.toBe('')
    expect(cards).toHaveLength(count)
    for (const card of cards) {
      expect(card.deck).toBe(deckId)
      expect(card.id).toMatch(/^[a-z0-9-]+$/)
      expect(ids.has(card.id), card.id).toBe(false)
      expect(fronts.has(card.front.toLowerCase()), card.id).toBe(false)
      ids.add(card.id)
      fronts.add(card.front.toLowerCase())
      for (const text of [card.front, card.meaning, card.example]) expect(text.trim()).not.toBe('')
      if (deckId !== 'spelling') expect(card.jamb, card.id).toBeDefined()
      if (card.jamb) {
        expect(Number.isInteger(card.jamb.year)).toBe(true)
        expect(card.jamb.year).toBeGreaterThanOrEqual(2010)
        expect(card.jamb.year).toBeLessThanOrEqual(2018)
        expect(Number.isInteger(card.jamb.number)).toBe(true)
        expect(card.jamb.number).toBeGreaterThan(0)
        expect(card.jamb.number).toBeLessThanOrEqual(card.jamb.year >= 2017 ? 60 : 100)
        if (card.jamb.context) expect(card.jamb.context.split(/\s+/).length).toBeLessThan(15)
      }
      if (card.check) expect(card.note?.trim()).toBeTruthy()
      if (['spelling', 'grammar-rules', 'confusable-words'].includes(deckId)) expect(card.trap?.trim()).toBeTruthy()
      if (['spelling', 'grammar-rules'].includes(deckId)) {
        for (const text of [card.rule?.text, card.rule?.right, card.rule?.wrong]) expect(text?.trim()).toBeTruthy()
      }
    }
  }
})

it('resets a missed card and extends the interval through box five', () => {
  const now = 12345
  const day = 86400000
  let review = rateCard(undefined, true, now)
  expect(review).toEqual({ box: 2, due: now + day })
  for (const [box, days] of [[3, 3], [4, 7], [5, 14], [5, 14]]) {
    review = rateCard(review, true, now)
    expect(review).toEqual({ box, due: now + days * day })
  }
  expect(rateCard(review, false, now)).toEqual({ box: 1, due: now + 600000 })
})

it('chooses oldest due cards, then new cards, and caps a session at twenty', () => {
  const cards = Array.from({ length: 25 }, (_, id) => ({ id: String(id) }))
  const reviews: Reviews = { 0: { box: 2, due: 4 }, 1: { box: 1, due: 5 }, 2: { box: 1, due: 2 } }
  const session = selectCards(cards, reviews, 4)
  expect(session.slice(0, 3).map(({ id }) => id)).toEqual(['2', '0', '3'])
  expect(session.some(({ id }) => id === '1')).toBe(false)
  expect(session).toHaveLength(20)
  expect(selectCards([cards[1]], reviews, 5)).toEqual([cards[1]])
  expect(selectCards([cards[1]], reviews, 4)).toEqual([])
})
