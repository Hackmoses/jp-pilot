import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Ajv2020 from 'ajv/dist/2020.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '../..')
const dataDir = path.join(rootDir, 'data')
const ajv = new Ajv2020({ allErrors: true })

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf8'))
}

const questionSchema = readJson(path.join(rootDir, 'schemas/questions.schema.json'))
const animationSchema = readJson(path.join(rootDir, 'schemas/animations.schema.json'))
const validateQuestions = ajv.compile(questionSchema)
const validateAnimations = ajv.compile(animationSchema)

const questionFiles = []
const animationFiles = []

function scanDir(dir) {
  if (!existsSync(dir)) return
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      scanDir(fullPath)
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      if (entry.name.includes('animation')) {
        animationFiles.push(fullPath)
      } else if (entry.name.includes('question') || entry.name.includes('batch')) {
        questionFiles.push(fullPath)
      }
    }
  }
}

scanDir(dataDir)

const allQuestions = []
const allAnimations = []
const errors = []
const pending = []

for (const filePath of animationFiles) {
  const rel = path.relative(rootDir, filePath)
  const data = readJson(filePath)
  if (!validateAnimations(data)) {
    for (const error of validateAnimations.errors) {
      errors.push(`${rel}${error.instancePath}: ${error.message}`)
    }
  } else {
    allAnimations.push(...data.animations)
  }
}

for (const filePath of questionFiles) {
  const rel = path.relative(rootDir, filePath)
  const data = readJson(filePath)
  if (!validateQuestions(data)) {
    for (const error of validateQuestions.errors) {
      errors.push(`${rel}${error.instancePath}: ${error.message}`)
    }
  } else {
    allQuestions.push(...data.questions)
  }
}

for (const question of allQuestions) {
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
    if (
      preset.optionId !== undefined &&
      (!optionIds.has(preset.optionId) || preset.optionId === question.answerId)
    ) {
      errors.push(`${question.id}: askPresets.${preset.id} must point to a wrong option`)
    }
    if (preset.id === 'whynot' && question.removeOrder.includes(preset.optionId)) {
      errors.push(`${question.id}: askPresets.whynot must point to an option retained after removals`)
    }
  }
  // A named animation must exist. A calculation with no animation yet shows its written
  // explanation, so it is listed as pending instead of blocking the deploy (owner decision).
  const matched = allAnimations.some(
    (animation) => animation.id === question.animationId && animation.questionId === question.id,
  )
  if (question.animationId && !matched) {
    errors.push(`${question.id}: animationId ${question.animationId} has no matching animation`)
  } else if (question.type === 'calculation' && !matched) {
    pending.push(question.id)
  }
}

if (pending.length) console.log(`${pending.length} calculation question(s) have no worked-step animation yet: ${pending.join(', ')}`)

for (const error of errors) console.error(error)

if (errors.length > 0) {
  process.exitCode = 1
} else {
  console.log(`Validated ${allQuestions.length} questions and ${allAnimations.length} animations across ${questionFiles.length} question file(s).`)
}
