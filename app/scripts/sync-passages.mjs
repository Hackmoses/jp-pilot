import { mkdir, readdir, readFile, unlink, writeFile } from 'node:fs/promises'

const bank = new URL('../../passages-bank/', import.meta.url)
const output = new URL('../public/passages/', import.meta.url)
const files = (await readdir(bank)).filter((name) => name.endsWith('.json')).sort()
await mkdir(output, { recursive: true })

const sets = []
for (const file of files) {
  const set = JSON.parse(await readFile(new URL(file, bank), 'utf8'))
  if (file !== set.id + '.json' || file === 'index.json') throw new Error('Invalid passage filename: ' + file)
  sets.push({ id: set.id, type: set.type, year: set.year, count: set.questions.length })
  await writeFile(new URL(file, output), JSON.stringify(set))
}

for (const file of await readdir(output)) {
  if (file.endsWith('.json') && file !== 'index.json' && !files.includes(file)) {
    await unlink(new URL(file, output))
  }
}

const index = JSON.stringify(sets)
await writeFile(new URL('index.json', output), index)
await writeFile(new URL('../src/lib/passage-index.json', import.meta.url), index)
