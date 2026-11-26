export type Review = { box: number; due: number }
export type Reviews = Record<string, Review>

const day = 24 * 60 * 60 * 1000
const intervals = [10 * 60 * 1000, day, 3 * day, 7 * day, 14 * day]

export function rateCard(previous: Review | undefined, knew: boolean, now: number): Review {
  const box = knew ? Math.min((previous?.box ?? 1) + 1, intervals.length) : 1
  return { box, due: now + intervals[box - 1] }
}

export function answerCardReview(previous: Review | undefined, correct: boolean, now: number): Review {
  return rateCard(previous, correct, now)
}

export function spellingMode(previous: Review | undefined): 'choice' | 'gap' {
  return (previous?.box ?? 1) >= 3 ? 'gap' : 'choice'
}

export function blankWordInSentence(sentence: string, word: string): string {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return sentence.replace(new RegExp(`\\b${escaped}\\b`, 'gi'), '_____')
}

function seedHash(seed: string): number {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export function seededOrder<T>(items: readonly T[], seed: string): T[] {
  const copy = [...items]
  let state = seedHash(seed) || 1
  for (let i = copy.length - 1; i > 0; i--) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0
    const j = state % (i + 1)
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function letterBank(target: string, misspellings: readonly string[], seed: string): string[] {
  const needed = target.toLowerCase().split('')
  const extraPool = misspellings
    .join('')
    .toLowerCase()
    .split('')
    .filter((ch) => /[a-z]/.test(ch) && !needed.includes(ch))
  const fallback = ['a', 'e', 'i', 'o', 'u', 'c', 'l', 'm', 'n', 'r', 's', 't']
  const distractors: string[] = []
  for (const ch of [...extraPool, ...fallback]) {
    if (!distractors.includes(ch)) distractors.push(ch)
    if (distractors.length >= 3) break
  }
  return seededOrder([...needed, ...distractors], seed)
}

export function selectCards<Card extends { id: string; check?: boolean }>(cards: readonly Card[], reviews: Reviews, now: number): Card[] {
  const available = cards.filter(({ check }) => check !== true)
  const due = available.filter(({ id }) => reviews[id]?.due <= now)
    .sort((a, b) => reviews[a.id].due - reviews[b.id].due)
  return due.concat(available.filter(({ id }) => !reviews[id])).slice(0, 20)
}

const currentReviews = new Map<string, Reviews>()

export function cardReviews(deck: string): Reviews {
  const current = currentReviews.get(deck)
  if (current) return current
  try {
    const value: unknown = JSON.parse(localStorage.getItem('jp:cards:' + deck) ?? '{}')
    if (value && typeof value === 'object') {
      return Object.fromEntries(Object.entries(value).filter(([, review]) =>
        Number.isInteger(review?.box) && review.box >= 1 && review.box <= 5 && Number.isFinite(review.due),
      ))
    }
  } catch {}
  return {}
}

export function saveCardReview(deck: string, id: string, review: Review) {
  const reviews = { ...cardReviews(deck), [id]: review }
  try {
    localStorage.setItem('jp:cards:' + deck, JSON.stringify(reviews))
  } catch {
    currentReviews.set(deck, reviews)
  }
}
