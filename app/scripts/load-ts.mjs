// Loads a TypeScript module from src/lib in Node. JSON imports get the attribute Node needs.
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

export async function loadLib(file) {
  const source = readFileSync(file, 'utf8').replace(/from '(\.\.?\/[^']+\.json)'/g,
    (_, rel) => `from '${pathToFileURL(path.resolve(path.dirname(file), rel)).href}' with { type: 'json' }`)
  const out = path.join(mkdtempSync(path.join(os.tmpdir(), 'jp-lib-')), path.basename(file).replace(/\.ts$/, '.mts'))
  writeFileSync(out, source)
  return import(pathToFileURL(out).href)
}
