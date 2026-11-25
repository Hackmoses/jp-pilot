import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '../..')
const dataDir = path.join(rootDir, 'data')
const outDir = path.join(rootDir, 'app', 'public', 'data')

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf8'))
}

function collectFiles() {
  const questionFiles = []
  const animationFiles = []

  const scanDir = (dir) => {
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
  return { questionFiles, animationFiles }
}

const { questionFiles, animationFiles } = collectFiles()
const questionsBySubject = new Map()
const animationsById = new Map()

for (const filePath of questionFiles) {
  const parsed = readJson(filePath)
  const list = Array.isArray(parsed.questions) ? parsed.questions : Array.isArray(parsed) ? parsed : []
  for (const question of list) {
    const subject = String(question.subject || parsed.subject || '').trim().toLowerCase()
    if (!subject) continue
    if (!questionsBySubject.has(subject)) questionsBySubject.set(subject, new Map())
    questionsBySubject.get(subject).set(question.id, question)
  }
}

for (const filePath of animationFiles) {
  const parsed = readJson(filePath)
  const list = Array.isArray(parsed.animations) ? parsed.animations : Array.isArray(parsed) ? parsed : []
  for (const anim of list) {
    animationsById.set(anim.id, anim)
  }
}

mkdirSync(outDir, { recursive: true })
const manifestSubjects = {}

for (const [subject, qMap] of questionsBySubject.entries()) {
  const questions = [...qMap.values()]
  const qOut = {
    version: 1,
    subject,
    count: questions.length,
    questions,
  }
  writeFileSync(path.join(outDir, `questions-${subject}.json`), JSON.stringify(qOut))

  const animIds = new Set(questions.map((q) => q.animationId).filter(Boolean))
  const subjectAnims = [...animIds].map((id) => animationsById.get(id)).filter(Boolean)
  if (subjectAnims.length > 0) {
    const aOut = {
      version: 1,
      subject,
      count: subjectAnims.length,
      animations: subjectAnims,
    }
    writeFileSync(path.join(outDir, `animations-${subject}.json`), JSON.stringify(aOut))
  }

  const completeCount = questions.filter((q) => {
    const anim = q.animationId ? animationsById.get(q.animationId) : undefined
    if (!q.animationId || !anim || anim.id !== q.animationId || anim.questionId !== q.id) return false
    if (anim.kind === 'concept') return (anim.steps?.length ?? 0) > 0 || (anim.teach?.length ?? 0) > 0
    return (anim.teach?.length ?? 0) > 0 && (anim.steps?.length ?? 0) > 0
  }).length

  manifestSubjects[subject] = {
    count: questions.length,
    completeCount,
    hasAnimations: subjectAnims.length > 0,
  }
}

writeFileSync(
  path.join(outDir, 'manifest.json'),
  JSON.stringify({ version: 1, subjects: manifestSubjects }, null, 2) + '\n',
)

console.log(
  `Synced ${Object.keys(manifestSubjects).length} subject(s): ` +
    Object.entries(manifestSubjects)
      .map(([s, info]) => `${s} (${info.count}q${info.hasAnimations ? ', anim' : ''})`)
      .join(', '),
)
