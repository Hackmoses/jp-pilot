// Fails the build if the first load of the home page grows past the budget.
// Counts what a first visit downloads before anything is tapped: the page, its styles and its code.
import { readFileSync } from 'node:fs'
import { gzipSync } from 'node:zlib'

const BUDGET_KB = 40
const dist = new URL('../dist/', import.meta.url)
const manifest = JSON.parse(readFileSync(new URL('.vite/manifest.json', dist), 'utf8'))
const entry = manifest['index.html']
const files = ['index.html', entry.file, ...(entry.css ?? [])]
const sizes = files.map((file) => [file, gzipSync(readFileSync(new URL(file, dist))).length / 1024])
const total = sizes.reduce((sum, [, kb]) => sum + kb, 0)
for (const [file, kb] of sizes) console.log(`[budget] ${file} ${kb.toFixed(1)} kB gzip`)
console.log(`[budget] first load ${total.toFixed(1)} kB of ${BUDGET_KB} kB`)
if (total > BUDGET_KB) {
  console.error(`[budget] Home first load is over budget by ${(total - BUDGET_KB).toFixed(1)} kB`)
  process.exitCode = 1
}
