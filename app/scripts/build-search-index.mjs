// Builds the Ask JP search index from content already in the repo. Only approved glossary entries
// become definition cards. Written to public/data/search-index.json and fetched when Ask JP is first used.
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'
import { loadLib } from './load-ts.mjs'

const appDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const rootDir = path.resolve(appDir, '..')
const dataDir = path.join(appDir, 'public', 'data')
const { syllabusSections, chapterForTopic, STUDY_TOPICS, ENGLISH_CARD_TOPICS, ENGLISH_ORAL_LESSONS } =
  await loadLib(path.join(appDir, 'src', 'lib', 'sections.ts'))

const read = (file) => JSON.parse(readFileSync(file, 'utf8'))
const manifest = read(path.join(dataDir, 'manifest.json')).subjects
const subjects = ['physics', 'chemistry', 'biology', 'mathematics', 'english', ...Object.keys(manifest).sort()]
  .filter((s, i, all) => all.indexOf(s) === i && existsSync(path.join(dataDir, `questions-${s}.json`)))
const names = { physics: 'Physics', chemistry: 'Chemistry', biology: 'Biology', mathematics: 'Mathematics', english: 'English' }
const params = (subject, chapter, extra = '') => new URLSearchParams({ subject, chapter }) + extra
const entries = []
const clean = (words) => [...new Set(words.filter(Boolean).join(' ').toLowerCase().split(/[^a-z0-9]+/))].filter((w) => w.length > 1).join(' ')

for (const subject of subjects) {
  const questions = read(path.join(dataDir, `questions-${subject}.json`)).questions
  const chapterOf = (q) => q.chapter?.trim() || chapterForTopic(subject, q.topic) || q.topic
  const chapters = syllabusSections(subject).flatMap((section) => section.chapters)
  const titleOf = new Map(chapters.map((c) => [c.id, c]))
  const byChapter = new Map()
  for (const q of questions) {
    const id = chapterOf(q)
    if (!byChapter.has(id)) byChapter.set(id, [])
    byChapter.get(id).push(q)
  }
  for (const [chapter, list] of byChapter) {
    const info = titleOf.get(chapter)
    const title = info?.title ?? chapter
    const topics = list.flatMap((q) => [q.topic, q.concept])
    entries.push({ kind: 'practice', title, subject, href: '#/practice?' + params(subject, chapter),
      words: clean([...(info?.concepts ?? []), ...topics]), count: list.length, detail: names[subject] ?? subject })
    const concepts = new Map()
    for (const q of list) for (const c of [q.concept, q.topic]) if (c && c !== title) concepts.set(c, (concepts.get(c) ?? 0) + 1)
    for (const [concept, count] of concepts) {
      if (count < 2) continue
      entries.push({ kind: 'practice', title: concept, subject, href: '#/practice?' + params(subject, chapter), words: clean([title]), count, detail: title })
    }
  }
  for (const chapter of STUDY_TOPICS[subject] ?? []) {
    const info = titleOf.get(chapter)
    if (!info) continue
    entries.push({ kind: 'study', title: info.title, subject, href: '#/study?' + params(subject, chapter), words: clean(info.concepts), detail: 'Study · ' + (names[subject] ?? subject) })
  }
}

for (const [chapter, deck] of Object.entries(ENGLISH_CARD_TOPICS)) {
  entries.push({ kind: 'cards', title: deck.replace(/-/g, ' ').replace(/^./, (c) => c.toUpperCase()), subject: 'english',
    href: '#/study?' + params('english', chapter, '&cards=1'), words: deck.replace(/-/g, ' '), detail: 'Card deck · English' })
}
for (const chapter of Object.keys(ENGLISH_ORAL_LESSONS)) {
  const info = syllabusSections('english').flatMap((s) => s.chapters).find((c) => c.id === chapter)
  if (info) entries.push({ kind: 'study', title: info.title, subject: 'english', href: '#/study?' + params('english', chapter),
    words: 'oral pronunciation sound', detail: 'Oral lesson · English' })
}

const cardsDir = path.join(rootDir, 'cards-bank')
for (const file of readdirSync(cardsDir).filter((f) => f.endsWith('.json')).sort()) {
  const deck = file.replace(/\.json$/, '')
  const chapter = Object.entries(ENGLISH_CARD_TOPICS).find(([, d]) => d === deck)?.[0]
  if (!chapter) continue
  for (const card of read(path.join(cardsDir, file)).cards ?? []) {
    if (card.check === true || !card.front || !card.meaning) continue
    const pair = card.antonym ? 'Antonym · ' + card.antonym : card.synonym ? 'Synonym · ' + card.synonym : null
    entries.push({ kind: 'term', title: card.front, subject: 'english', href: '#/study?' + params('english', chapter, '&cards=1'),
      words: clean([card.antonym, card.synonym]), definition: card.meaning, example: card.example || undefined, detail: pair ?? undefined })
  }
}

const clipIndex = read(path.join(rootDir, 'data', 'biology-clip-index.json'))
const lessonsDir = path.join(rootDir, 'lessons-bank')
for (const file of readdirSync(lessonsDir).filter((f) => f.startsWith('biology-') && f.endsWith('.json')).sort()) {
  for (const lesson of read(path.join(lessonsDir, file)).lessons ?? []) {
    const clip = clipIndex[lesson.id]
    if (!clip) continue
    const first = (lesson.scenes?.[0]?.say ?? '').split(/(?<=\.)\s/)[0]
    const minutes = `${Math.floor(clip.seconds / 60)}:${String(clip.seconds % 60).padStart(2, '0')}`
    entries.push({ kind: 'clip', title: lesson.title, subject: 'biology', href: '#/study?' + params('biology', clip.chapter),
      words: clean([lesson.id.replace(/^biology-/, '').replace(/-/g, ' '), first]), detail: 'Teach me clip · ' + minutes })
  }
}

function clipChapter(lessonFile) {
  const lessons = read(path.join(lessonsDir, lessonFile + '.json')).lessons ?? []
  const chapter = lessons.map((l) => clipIndex[l.id]?.chapter).find(Boolean)
  return chapter ? '#/study?' + params('biology', chapter) : ''
}

const glossaryFile = path.join(rootDir, 'data', 'glossary.json')
let approved = 0
if (existsSync(glossaryFile)) {
  for (const entry of read(glossaryFile).entries ?? []) {
    if (entry.status !== 'approved') continue
    approved++
    const file = entry.source.file
    const href = file.startsWith('questions-') ? '#/q?id=' + encodeURIComponent(entry.source.id)
      : file === 'lessons-bank/chemistry-2-mole' ? '#/study?' + params('chemistry', '2')
      : clipChapter(file.replace('lessons-bank/', ''))
    entries.push({ kind: 'term', title: entry.term, subject: entry.subject, href, words: clean([entry.term, ...(entry.aliases ?? [])]),
      definition: entry.definition, example: entry.example || undefined })
  }
}

const json = JSON.stringify({ version: 1, entries })
writeFileSync(path.join(dataDir, 'search-index.json'), json)
console.log(`[build-search-index] ${entries.length} entries, ${approved} glossary terms, ${(json.length / 1024).toFixed(1)} kB, ${(gzipSync(json).length / 1024).toFixed(1)} kB gzip`)
