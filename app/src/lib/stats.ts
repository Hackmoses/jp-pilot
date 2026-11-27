export type HomeStats = {
  subjects: Record<string, number>
  questions: number
  pastQuestions: number
  solutions: number
  lessons: number
  subjectCount: number
}

// Rounds a count down to a friendly figure that is always true: 258 shows as "Over 250",
// 1,262 as "Over 1,200", 47 as "Over 40". An exact round number shows as itself.
export function roundDown(n: number) {
  const step = n < 100 ? 10 : n < 1000 ? 50 : n < 10_000 ? 100 : 1000
  return Math.max(0, Math.floor(n / step) * step)
}

export function overLabel(n: number) {
  const floor = roundDown(n)
  const text = floor.toLocaleString('en-GB')
  if (n <= 0) return '0'
  if (floor === 0) return String(n)
  return n === floor ? text : 'Over ' + text
}
