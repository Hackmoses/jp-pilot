import type { Option, Question } from './types'

export function shuffleOptions(q: Question, seed: number): Option[] {
  const shuffled = q.options.filter((option) => !q.lockedOptions.includes(option.id))
  let state = seed >>> 0

  for (let i = shuffled.length - 1; i > 0; i--) {
    // Mulberry32 mixes neighboring seeds before each Fisher–Yates draw.
    state = (state + 0x6d2b79f5) >>> 0
    let value = Math.imul(state ^ (state >>> 15), state | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    const fraction = ((value ^ (value >>> 14)) >>> 0) / 2 ** 32
    const j = Math.floor(fraction * (i + 1))
    const option = shuffled[i]
    shuffled[i] = shuffled[j]
    shuffled[j] = option
  }

  let index = 0
  return q.options.map((option) =>
    q.lockedOptions.includes(option.id) ? option : shuffled[index++],
  )
}
