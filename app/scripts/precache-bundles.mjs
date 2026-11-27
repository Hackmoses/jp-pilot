import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'

const dist = new URL('../dist/', import.meta.url)
const manifest = JSON.parse(await readFile(new URL('.vite/manifest.json', dist), 'utf8'))
const sources = [
  'index.html',
  'src/screens/Subjects.tsx',
  'src/screens/Study.tsx',
  'src/screens/ChapterStudy.tsx',
  'src/screens/PracticeSetup.tsx',
  'src/screens/PracticeRun.tsx',
  'src/screens/Results.tsx',
  'src/screens/Summary.tsx',
]
const visited = new Set()
// Subject questions and solutions are not precached. The worker saves each subject's data
// the first time it is opened, so a student only downloads the subjects they use.
const files = new Set(['./data/manifest.json', './data/qotd/backup.json', './data/home-stats.json', './data/lessons-index.json'])
function collect(key) {
  if (visited.has(key)) return
  const chunk = manifest[key]
  if (!chunk) throw new Error('Missing offline bundle: ' + key)
  visited.add(key)
  files.add('./' + chunk.file)
  for (const sheet of chunk.css ?? []) files.add('./' + sheet)
  for (const asset of chunk.assets ?? []) if (asset.endsWith('.woff2')) files.add('./' + asset)
  for (const imported of chunk.imports ?? []) collect(imported)
}
for (const key of sources) collect(key)

// Store renderer files in the worker itself and seed its cache during install.
// The app imports only the renderer needed, and the cache serves it without a network round-trip.
const regularFiles = new Set(files)
for (const type of ['venn', 'graph', 'chart', 'table', 'circuit', 'rays', 'geometry', 'svg']) {
  collect('src/components/figures/' + type + '.tsx')
}

const figureFiles = [...files].filter((file) => !regularFiles.has(file)).sort()
const figureBundles = Object.fromEntries(await Promise.all(figureFiles.map(async (file) =>
  [file, await readFile(new URL(file, dist), 'utf8')],
)))

const revision = createHash('sha256').update(JSON.stringify(manifest)).digest('hex').slice(0, 12)
const worker = new URL('sw.js', dist)
const source = await readFile(worker, 'utf8')
await writeFile(worker, source
  .replace(/const CACHE_NAME = '([^']+)'/, (_, name) => "const CACHE_NAME = '" + name + '-' + revision + "'")
  .replace('const PRECACHE_BUNDLES = []', 'const PRECACHE_BUNDLES = ' + JSON.stringify([...regularFiles].sort()))
  .replace('const FIGURE_BUNDLES = {}', () => 'const FIGURE_BUNDLES = ' + JSON.stringify(figureBundles)))
