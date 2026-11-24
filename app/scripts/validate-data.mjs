import { readFileSync } from 'node:fs'
import Ajv2020 from 'ajv/dist/2020.js'

const ajv = new Ajv2020({ allErrors: true })

function readJson(relativePath) {
  return JSON.parse(readFileSync(new URL(relativePath, import.meta.url), 'utf8'))
}

function validateFile(name) {
  const schema = readJson(`../../schemas/${name}.schema.json`)
  const data = readJson(`../../data/${name}.json`)
  const validate = ajv.compile(schema)
  if (!validate(data)) {
    for (const error of validate.errors) {
      console.error(`${name}.json${error.instancePath}: ${error.message}`)
    }
    return undefined
  }
  return data
}

const questionsFile = validateFile('questions')
const animationsFile = validateFile('animations')
const errors = []

if (questionsFile) {
  for (const question of questionsFile.questions) {
    const optionIds = new Set(question.options.map((option) => option.id))
    if (!optionIds.has(question.answerId)) {
      errors.push(`${question.id}: answerId ${question.answerId} is missing from options`)
    }
    for (const option of question.options) {
      if (option.id === question.answerId) {
        if (option.whyWrong !== null) {
          errors.push(`${question.id}: correct option ${option.id} must have whyWrong: null`)
        }
      } else if (typeof option.whyWrong !== 'string' || option.whyWrong.trim().length === 0) {
        errors.push(`${question.id}: wrong option ${option.id} must have non-empty whyWrong text`)
      }
    }
    if (question.removeOrder.includes(question.answerId)) {
      errors.push(`${question.id}: removeOrder contains the answer`)
    }
    for (const preset of question.askPresets) {
      if (preset.optionId !== undefined &&
          (!optionIds.has(preset.optionId) || preset.optionId === question.answerId)) {
        errors.push(`${question.id}: askPresets.${preset.id} must point to a wrong option`)
      }
      if (preset.id === 'whynot' && question.removeOrder.includes(preset.optionId)) {
        errors.push(`${question.id}: askPresets.whynot must point to an option retained after removals`)
      }
    }
    if (question.type === 'calculation' && animationsFile &&
        !animationsFile.animations.some((animation) =>
          animation.id === question.animationId && animation.questionId === question.id,
        )) {
      errors.push(`${question.id}: calculation question lacks a matching animation`)
    }
  }
}

for (const error of errors) console.error(error)

if (!questionsFile || !animationsFile || errors.length > 0) {
  process.exitCode = 1
} else {
  console.log(`Validated ${questionsFile.questions.length} questions and ${animationsFile.animations.length} animations.`)
}
