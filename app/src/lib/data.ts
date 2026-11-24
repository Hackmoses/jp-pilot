import questionsFile from '../../../data/questions.json'
import animationsFile from '../../../data/animations.json'
import type { Animation, AnimationsFile, Question, QuestionsFile } from './types'

// The validator checks literal values and array lengths that JSON imports widen.
const { questions } = questionsFile as unknown as QuestionsFile
const { animations } = animationsFile as unknown as AnimationsFile

const questionsById = new Map(questions.map((question) => [question.id, question]))
const animationsById = new Map(animations.map((animation) => [animation.id, animation]))

export function getQuestions(): Question[] {
  return questions.slice()
}

export function getQuestion(id: string): Question | undefined {
  return questionsById.get(id)
}

export function getAnimation(id: string): Animation | undefined {
  return animationsById.get(id)
}
