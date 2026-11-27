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
// Maths commands lib/mathText.tsx can render. Anything else shows as raw text.
const MATH_COMMANDS = new Set(['frac', 'sqrt', 'left', 'right', 'matrix', 'det'])
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
    // A doubled backslash shows as a stray "\\" on screen before \frac or \sqrt.
    for (const animation of data.animations) {
      for (const step of [...(animation.steps ?? []), ...(animation.teach ?? [])]) {
        if (typeof step.display === 'string' && step.display.includes('\\\\')) errors.push(`${animation.id}: step ${step.n} display has a doubled backslash`)
        for (const [, name] of (step.display ?? '').matchAll(/\\([A-Za-z]+)/g)) {
          if (!MATH_COMMANDS.has(name)) errors.push(`${animation.id}: step ${step.n} uses \\${name}, which the app cannot display`)
        }
      }
    }
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
    for (const [, name] of JSON.stringify(question).matchAll(/\\\\([A-Za-z]+)/g)) {
      if (!MATH_COMMANDS.has(name)) errors.push(`${question.id}: uses \\${name}, which the app cannot display`)
    }
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

// Every glossary definition must be copied from the source it cites, so Ask JP never shows invented text.
const glossaryFile = path.join(dataDir, 'glossary.json')
if (existsSync(glossaryFile)) {
  const glossary = readJson(glossaryFile)
  for (const entry of glossary.entries ?? []) {
    const label = `glossary ${entry.term}`
    if (!entry.term || !entry.subject || !entry.definition || !entry.source?.file || !entry.source?.id) { errors.push(`${label}: missing a field`); continue }
    if (!['draft', 'approved'].includes(entry.status)) errors.push(`${label}: status must be draft or approved`)
    let text = null
    if (entry.source.file.startsWith('questions-')) {
      const question = allQuestions.find((q) => q.id === entry.source.id)
      if (question) text = [question.explanation, ...question.options.map((o) => o.why)].join(' ')
    } else {
      const lessonFile = path.join(rootDir, entry.source.file + '.json')
      if (existsSync(lessonFile)) {
        const scene = (readJson(lessonFile).lessons ?? []).flatMap((l) => l.scenes ?? []).find((sc) => sc.id === entry.source.id)
        if (scene) text = scene.say ?? ''
      }
    }
    if (text === null) errors.push(`${label}: source ${entry.source.file} ${entry.source.id} not found`)
    else if (!text.includes(entry.definition)) errors.push(`${label}: definition is not in its source`)
  }
}

// Every solution must speak in one voice, and never in the old fallback voice.
// Add a track here only while it is queued in audio/revoice-paths.txt to be voiced again.
const MIXED_VOICE_QUEUE = new Set([])
const audioManifestFile = path.join(rootDir, 'audio', 'manifest.json')
if (existsSync(audioManifestFile)) {
  const voicesByTrack = new Map()
  for (const clip of readJson(audioManifestFile).clips ?? []) {
    const parts = clip.path.split('/')
    const track = parts[1] === 'teach' ? parts.slice(0, 3).join('/') : parts.slice(0, 2).join('/')
    if (!voicesByTrack.has(track)) voicesByTrack.set(track, new Set())
    voicesByTrack.get(track).add(clip.voice)
  }
  let queued = 0
  for (const [track, voices] of voicesByTrack) {
    const bad = voices.size > 1 || [...voices].some((voice) => String(voice).startsWith('kokoro'))
    if (!bad) continue
    if (MIXED_VOICE_QUEUE.has(track)) { queued++; continue }
    errors.push(`${track}: mixes voices (${[...voices].join(', ')}). Voice the whole solution in one voice.`)
  }
  if (queued) console.log(`${queued} solution(s) with mixed voices are queued to be voiced again (audio/revoice-paths.txt).`)
}

if (pending.length) console.log(`${pending.length} calculation question(s) have no worked-step animation yet: ${pending.join(', ')}`)

for (const error of errors) console.error(error)

if (errors.length > 0) {
  process.exitCode = 1
} else {
  console.log(`Validated ${allQuestions.length} questions and ${allAnimations.length} animations across ${questionFiles.length} question file(s).`)
}
