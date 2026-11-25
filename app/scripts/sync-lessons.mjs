import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'

const bank = new URL('../../lessons-bank/', import.meta.url)
const output = new URL('../public/lessons/', import.meta.url)
const manifestFile = new URL('../public/audio/lessons/manifest.json', import.meta.url)
const manifest = await readFile(manifestFile, 'utf8').then(JSON.parse).catch((error) => {
  if (error.code === 'ENOENT') return []
  throw error
})
const list = Array.isArray(manifest) ? manifest : manifest.scenes
if (!Array.isArray(list)) throw new Error('Lesson audio manifest must list scenes')
const clips = new Map(list.map((clip) => {
  if (!clip.sceneId || !Number.isFinite(clip.durationMs) || clip.durationMs <= 0 || !Array.isArray(clip.beats) ||
      clip.beats.some(({ word, atMs }, i) => typeof word !== 'string' || !Number.isFinite(atMs) ||
        atMs < 0 || atMs > clip.durationMs || (i > 0 && atMs < clip.beats[i - 1].atMs))) throw new Error('Invalid lesson audio timing: ' + clip.sceneId)
  return [clip.sceneId, clip]
}))
await mkdir(output, { recursive: true })
const index = []
for (const name of (await readdir(bank)).filter((file) => file.endsWith('.json')).sort()) {
  const text = await readFile(new URL(name, bank), 'utf8')
  const topic = JSON.parse(text)
  const lessons = topic.lessons.map(({ id, title, scenes, pastQuestion }) => ({
    id, title, sceneIds: [...scenes, ...pastQuestion?.scenes ?? []].map((scene) => scene.id),
  }))
  const entries = lessons.flatMap(({ sceneIds }) => sceneIds.flatMap((id) => clips.has(id) ? [[id, clips.get(id)]] : []))
  // Include only this topic's audio timings. The topic remains the only data request.
  await writeFile(new URL(name, output), entries.length ? JSON.stringify({ ...topic, clips: Object.fromEntries(entries) }) : text)
  index.push({ subject: topic.subject, topicId: topic.topicId, file: name, lessons })
}
await writeFile(new URL('index.json', output), JSON.stringify(index, null, 2) + '\n')
