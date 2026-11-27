// Copies data/<subject>-lessons.json into the app and writes a small index used for links,
// Study and Ask JP. Practice counts use the same matching as the app (src/lib/conceptLessons.ts).
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadLib } from './load-ts.mjs'

const appDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const rootDir = path.resolve(appDir, '..')
const dataDir = path.join(rootDir, 'data')
const outDir = path.join(appDir, 'public', 'data')
const { chapterForTopic } = await loadLib(path.join(appDir, 'src', 'lib', 'sections.ts'))
const read = (file) => JSON.parse(readFileSync(file, 'utf8'))

const index = []
for (const file of readdirSync(dataDir).filter((f) => f.endsWith('-lessons.json'))) {
  const doc = read(path.join(dataDir, file))
  const subject = doc.subject
  writeFileSync(path.join(outDir, `lessons-${subject}.json`), JSON.stringify(doc))
  const questionsFile = path.join(outDir, `questions-${subject}.json`)
  const questions = existsSync(questionsFile) ? read(questionsFile).questions : []
  const chapterOf = (q) => q.chapter?.trim() || chapterForTopic(subject, q.topic) || q.topic
  for (const lesson of doc.lessons) {
    const practiceChapter = lesson.chapters[0]
    index.push({
      id: lesson.id, title: lesson.title, subject, minutes: lesson.minutes ?? 3,
      chapters: lesson.chapters, alsoLinks: lesson.alsoLinks ?? [], keywords: lesson.keywords ?? [],
      practiceChapter, practiceCount: questions.filter((q) => chapterOf(q) === practiceChapter).length,
    })
  }
}
writeFileSync(path.join(outDir, 'lessons-index.json'), JSON.stringify(index))
console.log(`[sync-concept-lessons] ${index.length} lessons`)
