import { existsSync, readFileSync, writeFileSync } from 'node:fs'

// Run from the repository root after changing audio/manifest.json:
// node app/src/components/player/generate-audio-index.mjs
const manifest = JSON.parse(readFileSync(new URL('../../../../audio/manifest.json', import.meta.url), 'utf8'))
const output = new URL('./audioIndex.json', import.meta.url)
const voices = [...new Set(manifest.clips.map(({ voice }) => voice))]
const tracks = new Map()

for (const clip of manifest.clips) {
  const teach = clip.path.startsWith('audio/teach/')
  const track = teach ? clip.animationId + '/teach' : clip.animationId
  const canonicalPath = 'audio/' + (teach ? 'teach/' : '') + clip.animationId + '/' + clip.step + '.webm'
  const signature = Buffer.from(clip.lineSha256.slice(0, 40), 'hex').toString('base64').replace(/=+$/, '')
  const encoded = [clip.step, clip.durationMs, signature]
  const voice = voices.indexOf(clip.voice)
  if (voice !== 0 || clip.path !== canonicalPath) encoded.push(voice)
  if (clip.path !== canonicalPath) encoded.push(clip.path)
  const clips = tracks.get(track) ?? []
  clips.push(encoded)
  tracks.set(track, clips)
}

const entries = [...tracks].map(([key, clips]) => '    ' + JSON.stringify(key) + ': ' + JSON.stringify(clips))
const compact = '{\n  "voices": ' + JSON.stringify(voices) + ',\n  "tracks": {\n' + entries.join(',\n') + '\n  }\n}\n'

const current = existsSync(output) ? readFileSync(output, 'utf8').replace(/\r\n/g, '\n') : null
if (process.argv.includes('--check')) {
  if (current !== compact) {
    console.error('The bundled audio index needs to be regenerated.')
    process.exitCode = 1
  }
} else if (current !== compact) {
  writeFileSync(output, compact)
}
