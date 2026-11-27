// Writes one small file per day for Question of the day, so the home page fetches about 1 kB, not a subject.
// The order of questions per subject is kept in app/qotd-order.json. New questions are added at the end,
// so earlier days keep their question when data grows.
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { QOTD_SUBJECTS, addDays, lagosDate, subjectFor, subjectTurn } from '../src/lib/qotd.ts'

const appDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dataDir = path.join(appDir, 'public', 'data')
const outDir = path.join(dataDir, 'qotd')
const orderFile = path.join(appDir, 'qotd-order.json')
const DAYS = 400

const plain = (text) => typeof text === 'string' && !text.includes('\\') && !text.includes('$')

export function isEligible(question) {
  const source = question.source
  if (typeof source !== 'object' || source === null || source.provider !== 'jamb-past-paper') return false
  if (question.yearVerified !== true || !source.yearLabel?.trim()) return false
  if (question.label || question.figure || question.options.some((option) => option.figure)) return false
  if (!question.explanation?.trim()) return false
  if (/passage|extract|stanza|poem/i.test(question.stem)) return false
  return plain(question.stem) && question.options.every((option) => plain(option.text))
}

const rank = (id) => createHash('sha256').update('jp-qotd:' + id).digest('hex')

function loadOrder() {
  if (!existsSync(orderFile)) return {}
  return JSON.parse(readFileSync(orderFile, 'utf8'))
}

const order = loadOrder()
const bySubject = {}
for (const subject of QOTD_SUBJECTS) {
  const file = path.join(dataDir, `questions-${subject}.json`)
  const questions = JSON.parse(readFileSync(file, 'utf8')).questions
  const animations = new Set()
  const animFile = path.join(dataDir, `animations-${subject}.json`)
  if (existsSync(animFile)) for (const a of JSON.parse(readFileSync(animFile, 'utf8')).animations ?? []) animations.add(a.questionId)
  const eligible = new Map(questions.filter(isEligible).map((q) => [q.id, { q, solved: animations.has(q.id) || Boolean(q.animationId) }]))
  const kept = (order[subject] ?? []).filter((id) => eligible.has(id))
  const added = [...eligible.keys()].filter((id) => !kept.includes(id)).sort((a, b) => rank(a).localeCompare(rank(b)))
  order[subject] = [...kept, ...added]
  bySubject[subject] = eligible
}
writeFileSync(orderFile, JSON.stringify(order, null, 1) + '\n')

rmSync(outDir, { recursive: true, force: true })
mkdirSync(outDir, { recursive: true })
const today = lagosDate()
const counts = {}
for (let i = -1; i < DAYS; i++) {
  const date = addDays(today, i)
  const subject = subjectFor(date)
  const list = order[subject]
  if (!list.length) continue
  const id = list[subjectTurn(date) % list.length]
  const { q, solved } = bySubject[subject].get(id)
  counts[subject] = list.length
  writeFileSync(path.join(outDir, date + '.json'), JSON.stringify({
    date, subject, id, year: q.source.yearLabel.trim(), stem: q.stem,
    options: q.options.map(({ id, text }) => ({ id, text })),
    answerId: q.answerId, explanation: q.explanation, hasSolution: solved || subject === 'biology',
  }))
}
console.log('[build-qotd] eligible per subject', JSON.stringify(counts), 'days', DAYS)
