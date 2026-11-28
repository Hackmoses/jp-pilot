import type { FigureData } from '../components/figures/spec'

export type OptionId = 'a' | 'b' | 'c' | 'd'

export interface Option {
  id: OptionId
  text: string
  figure?: FigureData
  why: string
  whyWrong: string | null
}

export interface AskPreset {
  id: 'simpler' | 'whynot' | 'similar'
  label?: string
  optionId?: OptionId
  answer: string
  similarAnswer?: string
}

export interface QuestionSourceObject {
  provider: string
  id: number
  yearLabel?: string | null
}

export interface Question {
  id: string
  subject: string
  topic: string
  chapter?: string
  concept?: string
  type: 'recall' | 'calculation'
  difficulty: 1 | 2 | 3
  stem: string
  figure?: FigureData
  options: [Option, Option, Option, Option]
  answerId: OptionId
  removeOrder: [OptionId, OptionId]
  hint: string
  explanation: string
  trap: string
  mnemonic: string
  askPresets: AskPreset[]
  animationId: string | null
  lockedOptions: OptionId[]
  source: string | QuestionSourceObject
  reviewed: boolean
  label?: 'JAMB-style practice'
  yearVerified?: boolean
  // A retired question leaves Practice, the CBT and counts, but old attempts and reports still find it.
  retired?: boolean
}

export interface QuestionsFile {
  version: 1
  subject: string
  count: number
  questions: Question[]
}

export interface AnimationStep {
  n: number
  display: string
  tag: string
  title?: string
  reason?: string
  working?: string[]
  narration: string
  figure?: { drawing: string; chapter: number; beats: { word: string; cue: string }[] }
}

export type AnimationKind = 'calculation' | 'concept'

export interface Animation {
  id: string
  questionId: string
  kind?: AnimationKind
  stepSeconds: number
  steps: [AnimationStep, AnimationStep, ...AnimationStep[]]
  teach?: [AnimationStep, AnimationStep, ...AnimationStep[]]
}

export interface AnimationsFile {
  version: 1
  subject?: string
  count: number
  animations: Animation[]
}
