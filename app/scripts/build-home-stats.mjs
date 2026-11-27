// Counts for the home page, taken from JP's own content every build, so the numbers students see
// grow as questions, solutions and lessons are added. Written to public/data/home-stats.json.
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const appDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const rootDir = path.resolve(appDir, '..')
const dataDir = path.join(appDir, 'public', 'data')
const read = (file) => JSON.parse(readFileSync(file, 'utf8'))

const manifest = read(path.join(dataDir, 'manifest.json')).subjects
const subjects = Object.fromEntries(Object.entries(manifest).map(([id, entry]) => [id, entry.count]))
const questions = Object.values(subjects).reduce((sum, count) => sum + count, 0)

// Only questions taken from a printed JAMB paper count as past questions. JAMB-style practice is counted separately.
let pastQuestions = 0
for (const file of readdirSync(dataDir).filter((f) => f.startsWith('questions-') && f.endsWith('.json'))) {
  for (const q of read(path.join(dataDir, file)).questions ?? []) {
    if (q.source && typeof q.source === 'object' && q.source.provider === 'jamb-past-paper') pastQuestions++
  }
}

let solutions = 0
for (const file of readdirSync(dataDir).filter((f) => f.startsWith('animations-') && f.endsWith('.json'))) {
  const doc = read(path.join(dataDir, file))
  solutions += (Array.isArray(doc) ? doc : doc.animations ?? []).length
}

let lessons = 0
const lessonsDir = path.join(rootDir, 'lessons-bank')
if (existsSync(lessonsDir)) {
  for (const file of readdirSync(lessonsDir).filter((f) => f.endsWith('.json'))) {
    try { lessons += (read(path.join(lessonsDir, file)).lessons ?? []).length } catch { /* Not a lesson file. */ }
  }
}

const stats = { subjects, questions, pastQuestions, solutions, lessons, subjectCount: Object.keys(subjects).length }
writeFileSync(path.join(dataDir, 'home-stats.json'), JSON.stringify(stats))
console.log('[build-home-stats]', JSON.stringify({ questions, pastQuestions, solutions, lessons, subjectCount: stats.subjectCount }))
