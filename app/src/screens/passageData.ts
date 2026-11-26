import type { Option, OptionId, Question } from '../lib/types'

export type PassageType = 'comprehension' | 'cloze' | 'summary'
export type PassageLine = { number: number; text: string }
export type ReadingQuestion = {
  number: number
  stem: string
  options: { text: string; why: string }[]
  answer: 'A' | 'B' | 'C' | 'D'
  proof: number[]
  clue?: string
  skill: string
  check?: boolean
}
export type PassageSet = {
  id: string
  type: PassageType
  year: number
  title: string
  passage: PassageLine[]
  questions: ReadingQuestion[]
}
export const passageNames: Record<PassageType, string> = {
  comprehension: 'Comprehension',
  cloze: 'Cloze',
  summary: 'Summary',
}
const letters = ['a', 'b', 'c', 'd'] as const

export function toPracticeQuestion(set: PassageSet, item: ReadingQuestion): Question {
  const answerId = item.answer.toLowerCase() as OptionId
  const options = item.options.map(({ text, why }, index): Option => ({
    id: letters[index], text, why, whyWrong: letters[index] === answerId ? null : why,
  })) as Question['options']
  return {
    id: set.id + '-' + item.number, subject: 'english', topic: passageNames[set.type],
    type: 'recall', difficulty: 2, stem: item.stem, options, answerId,
    removeOrder: letters.filter((id) => id !== answerId).slice(0, 2) as Question['removeOrder'],
    hint: '', explanation: options.find(({ id }) => id === answerId)!.why, trap: '', mnemonic: '',
    askPresets: [], animationId: null, lockedOptions: [], reviewed: !item.check, yearVerified: true,
    source: { provider: 'JAMB', id: item.number, yearLabel: String(set.year) },
  }
}

export function splitGaps(line: string) {
  return line.split(/(\{\{\d+\}\})/g).map((text) => ({
    text, gap: /^\{\{\d+\}\}$/.test(text) ? Number(text.slice(2, -2)) : null,
  }))
}
