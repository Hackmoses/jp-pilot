export type Review = { box: number; due: number }
export type Reviews = Record<string, Review>

const day = 24 * 60 * 60 * 1000
const intervals = [10 * 60 * 1000, day, 3 * day, 7 * day, 14 * day]

export function rateCard(previous: Review | undefined, knew: boolean, now: number): Review {
  const box = knew ? Math.min((previous?.box ?? 1) + 1, intervals.length) : 1
  return { box, due: now + intervals[box - 1] }
}

export function selectCards<Card extends { id: string }>(cards: readonly Card[], reviews: Reviews, now: number): Card[] {
  const due = cards.filter(({ id }) => reviews[id]?.due <= now)
    .sort((a, b) => reviews[a.id].due - reviews[b.id].due)
  return due.concat(cards.filter(({ id }) => !reviews[id])).slice(0, 20)
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
