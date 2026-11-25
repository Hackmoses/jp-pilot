import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'

const dist = new URL('../dist/', import.meta.url)
const manifest = JSON.parse(await readFile(new URL('.vite/manifest.json', dist), 'utf8'))
const sources = [
  'index.html',
  'src/screens/Subjects.tsx',
  'src/screens/Study.tsx',
  'src/screens/PracticeSetup.tsx',
  'src/screens/PracticeRun.tsx',
  'src/screens/Results.tsx',
  'src/screens/Summary.tsx',
  ...Object.keys(manifest).filter((key) => key.startsWith('src/components/try-it/try-it-')),
]
const visited = new Set()
const studySubjects = ['chemistry', 'physics', 'biology', 'mathematics']
const files = new Set([
  './data/manifest.json',
  ...studySubjects.flatMap((subject) => [
    './data/questions-' + subject + '.json',
    './data/animations-' + subject + '.json',
  ]),
])
function collect(key) {
  if (visited.has(key)) return
  const chunk = manifest[key]
  if (!chunk) throw new Error('Missing offline bundle: ' + key)
  visited.add(key)
  files.add('./' + chunk.file)
  for (const sheet of chunk.css ?? []) files.add('./' + sheet)
  for (const imported of chunk.imports ?? []) collect(imported)
}
for (const key of sources) collect(key)

const revision = createHash('sha256').update(JSON.stringify(manifest)).digest('hex').slice(0, 12)
const worker = new URL('sw.js', dist)
const source = await readFile(worker, 'utf8')
await writeFile(worker, source
  .replace(/(const CACHE_NAME = '[^']+)'/, '$1-' + revision + "'")
  .replace('const PRECACHE_BUNDLES = []', 'const PRECACHE_BUNDLES = ' + JSON.stringify([...files].sort())))
