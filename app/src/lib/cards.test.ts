import { expect, it } from 'vitest'
import {
  answerCardReview,
  blankWordInSentence,
  rateCard,
  seededOrder,
  selectCards,
  spellingMode,
  type Reviews,
} from './leitner'
import { ENGLISH_CARD_TOPICS, STUDY_TOPICS, syllabusSections } from './sections'

const deckFiles = import.meta.glob('../../../cards-bank/*.json', { eager: true, import: 'default' })
const pilotCounts = {
  synonyms: 80, antonyms: 80, idioms: 40, 'phrasal-verbs-prepositions': 30,
  'confusable-words': 30, spelling: 50, 'grammar-rules': 30,
}

type CardQuestion = {
  stem: string
  options: string[]
  answer: string
  year: number
  number: number
}

type Deck = {
  title: string
  cards: {
    id: string; deck: string; front: string; meaning: string; example: string
    jamb?: { year: number; number: number; context?: string }
    check?: boolean; note?: string
    trap?: string; rule?: { text: string; right: string; wrong: string }
    question?: CardQuestion
    misspellings?: string[]
    gap?: [number, number]
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

it('gives every question-first card a stem, four distinct options and an answer A to D', () => {
  const questionDecks = ['grammar-rules', 'confusable-words', 'phrasal-verbs-prepositions', 'idioms']
  for (const deckId of questionDecks) {
    for (const card of decks[deckId].cards) {
      if (!card.question) continue
      expect(card.question.stem.trim(), card.id).not.toBe('')
      expect(card.question.options, card.id).toHaveLength(4)
      for (const option of card.question.options) {
        expect(option.trim(), card.id).not.toBe('')
      }
      expect(new Set(card.question.options.map((o) => o.trim().toLowerCase())).size, card.id).toBe(4)
      expect(card.question.answer, card.id).toMatch(/^[ABCD]$/)
      expect(card.question.year, card.id).toBe(card.jamb?.year)
      expect(card.question.number, card.id).toBe(card.jamb?.number)
    }
  }
})

it('gives every spelling card three distinct misspellings, a valid gap, and blankable example', () => {
  for (const card of decks.spelling.cards) {
    expect(card.misspellings, card.id).toHaveLength(3)
    expect(card.misspellings, card.id).toContain(card.rule?.wrong)
    const allSpellings = [card.front, ...(card.misspellings ?? [])].map((w) => w.trim().toLowerCase())
    expect(new Set(allSpellings).size, card.id).toBe(4)
    expect(card.gap, card.id).toHaveLength(2)
    const [start, end] = card.gap!
    expect(start, card.id).toBeGreaterThanOrEqual(0)
    expect(end, card.id).toBeGreaterThan(start)
    expect(end, card.id).toBeLessThanOrEqual(card.front.length)
    expect(blankWordInSentence(card.example, card.front), card.id).toContain('_____')
    expect(blankWordInSentence(card.example, card.front).toLowerCase(), card.id).not.toContain(card.front.toLowerCase())
  }
})

it('feeds question answers and two-mode spelling progression into Leitner boxes correctly', () => {
  const now = 50_000
  expect(spellingMode(undefined)).toBe('choice')
  const afterFirstCorrect = answerCardReview(undefined, true, now)
  expect(afterFirstCorrect.box).toBe(2)
  expect(spellingMode(afterFirstCorrect)).toBe('choice')
  const afterSecondCorrect = answerCardReview(afterFirstCorrect, true, now)
  expect(afterSecondCorrect.box).toBe(3)
  expect(spellingMode(afterSecondCorrect)).toBe('gap')
  const afterWrong = answerCardReview(afterSecondCorrect, false, now)
  expect(afterWrong.box).toBe(1)
  expect(spellingMode(afterWrong)).toBe('choice')
  expect(seededOrder(['a', 'b', 'c', 'd'], 'seed-1').sort()).toEqual(['a', 'b', 'c', 'd'])
})
