import { mkdir, readdir, readFile, unlink, writeFile } from 'node:fs/promises'

const bank = new URL('../../cards-bank/', import.meta.url)
const output = new URL('../public/cards/', import.meta.url)
const files = (await readdir(bank)).filter((name) => name.endsWith('.json')).sort()
await mkdir(output, { recursive: true })

const index = []
for (const name of files) {
  const id = name.slice(0, -5)
  const { title, cards } = JSON.parse(await readFile(new URL(name, bank), 'utf8'))
  index.push({ id, title, count: cards.length })
  await writeFile(new URL(name, output), JSON.stringify({ title, cards }))
}
for (const name of await readdir(output)) {
  if (name.endsWith('.json') && name !== 'index.json' && !files.includes(name)) {
    await unlink(new URL(name, output))
  }
}

const metadata = JSON.stringify(index)
await writeFile(new URL('index.json', output), metadata)
// The topic page needs only counts. Bundle this metadata so it can open offline.
await writeFile(new URL('../src/lib/card-index.json', import.meta.url), metadata)
