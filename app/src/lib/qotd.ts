// Question of the day. Every student sees the same question, chosen by the calendar date in Lagos.
export type QotdOption = { id: 'a' | 'b' | 'c' | 'd'; text: string }
export type QotdFile = {
  date: string
  subject: string
  id: string
  year: string
  stem: string
  options: QotdOption[]
  answerId: QotdOption['id']
  explanation: string
  hasSolution: boolean
}

export const QOTD_SUBJECTS = ['physics', 'chemistry', 'biology', 'mathematics', 'english'] as const
const ANCHOR = '2026-11-23' // A Monday. Moving it would change every day's question.

const lagosFormat = new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Lagos', year: 'numeric', month: '2-digit', day: '2-digit' })

export function lagosDate(now = Date.now()) {
  return lagosFormat.format(new Date(now))
}

function dayNumber(date: string) {
  return Math.round((Date.parse(date + 'T00:00:00Z') - Date.parse(ANCHOR + 'T00:00:00Z')) / 86_400_000)
}

export function addDays(date: string, days: number) {
  return new Date(Date.parse(date + 'T00:00:00Z') + days * 86_400_000).toISOString().slice(0, 10)
}

// Monday Physics, Tuesday Chemistry, Wednesday Biology, Thursday Mathematics, Friday English.
// Saturday and Sunday move through all five in turn.
export function subjectFor(date: string) {
  const n = dayNumber(date)
  const weekday = ((n % 7) + 7) % 7
  if (weekday < 5) return QOTD_SUBJECTS[weekday]
  const week = Math.floor(n / 7)
  return QOTD_SUBJECTS[(((week * 2 + weekday - 5) % 5) + 5) % 5]
}

// How many earlier days since the anchor went to the same subject. Picks the next question in that list.
export function subjectTurn(date: string) {
  const subject = subjectFor(date)
  let turn = 0
  for (let day = ANCHOR; day < date; day = addDays(day, 1)) if (subjectFor(day) === subject) turn++
  return turn
}

type Saved = { answers: Record<string, { id: string; picked: QotdOption['id'] }>; last: string | null; count: number }
const key = 'jp.qotd.v1'

function read(): Saved {
  try {
    const saved = JSON.parse(localStorage.getItem(key) ?? 'null') as Partial<Saved> | null
    return { answers: saved?.answers ?? {}, last: saved?.last ?? null, count: saved?.count ?? 0 }
  } catch { return { answers: {}, last: null, count: 0 } }
}

export function savedAnswer(date: string, id: string) {
  const answer = read().answers[date]
  return answer?.id === id ? answer.picked : null
}

export function nextStreak(last: string | null, count: number, date: string) {
  if (last === date) return count
  return last === addDays(date, -1) ? count + 1 : 1
}

export function streakOn(date: string, saved = read()) {
  return saved.last === date || saved.last === addDays(date, -1) ? saved.count : 0
}

export function saveAnswer(date: string, id: string, picked: QotdOption['id']) {
  const saved = read()
  if (saved.answers[date]) return streakOn(date, saved)
  const count = nextStreak(saved.last, saved.count, date)
  const answers = Object.fromEntries(Object.entries(saved.answers).filter(([day]) => day >= addDays(date, -30)))
  const next = { answers: { ...answers, [date]: { id, picked } }, last: date, count }
  try { localStorage.setItem(key, JSON.stringify(next)) } catch { /* Storage can be off. */ }
  return count
}

export function streak(date: string) {
  return streakOn(date)
}
