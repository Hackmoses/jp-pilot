export type OptionId = 'a' | 'b' | 'c' | 'd'

export interface Option {
  id: OptionId
  text: string
  why: string
}

export interface AskPreset {
  id: 'simpler' | 'whynot' | 'similar'
  label?: string
  optionId?: OptionId
  answer: string
  similarAnswer?: string
}

export interface Question {
  id: string
  subject: 'chemistry'
  topic: string
  type: 'recall' | 'calculation'
  difficulty: 1 | 2 | 3
  stem: string
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
  source: string
  reviewed: boolean
}

export interface QuestionsFile {
  version: 1
  subject: 'chemistry'
  count: number
  questions: Question[]
}

export interface AnimationStep {
  n: number
  display: string
  tag: string
  narration: string
}

export interface Animation {
  id: string
  questionId: string
  stepSeconds: number
  steps: [AnimationStep, AnimationStep, ...AnimationStep[]]
}

export interface AnimationsFile {
  version: 1
  count: number
  animations: Animation[]
}
