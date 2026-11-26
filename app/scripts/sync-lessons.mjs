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
const wordBank = JSON.parse(await readFile(new URL('english-oral-words.json', bank), 'utf8'))
const audioWords = new Set(await readdir(new URL('../public/audio/words/', import.meta.url)).catch((error) => {
  if (error.code === 'ENOENT') return []
  throw error
}))
const sceneList = ({ scenes, pastQuestion }) => [...scenes, ...pastQuestion?.scenes ?? []]
for (const name of (await readdir(bank)).filter((file) => file.endsWith('.json')).sort()) {
  const text = await readFile(new URL(name, bank), 'utf8')
  const topic = JSON.parse(text)
  // Word banks and other non-lesson files have no lessons array.
  if (!Array.isArray(topic?.lessons)) continue
  const foundations = name === 'english-foundations.json'
  const spokenWords = foundations || name === 'english-oral.json'
  const lessonScenes = (lesson) => [
    ...sceneList(lesson),
    ...lesson.supplement ? sceneList(lesson.supplement) : [],
  ]
  const lessons = topic.lessons.map((lesson) => ({
    id: lesson.id, title: lesson.title, sceneIds: lessonScenes(lesson).map((scene) => scene.id),
  }))
  const entries = lessons.flatMap(({ sceneIds }) => sceneIds.flatMap((id) => clips.has(id) ? [[id, clips.get(id)]] : []))
  // Include only this topic's audio timings. The topic remains the only data request.
  const data = { ...topic }
  if (entries.length) data.clips = Object.fromEntries(entries)
  if (spokenWords) {
    const pronunciations = new Set(topic.lessons.flatMap(lessonScenes).flatMap(({ say }) =>
      Array.from(say.matchAll(/\{\{word:([\w-]+)\}\}/g), ([, id]) => id)))
    data.words = Object.fromEntries(wordBank.filter(({ id }) => pronunciations.has(id)).map(({ id, word, ipa, stress }) =>
      [id, { word, ipa, stress, ...(audioWords.has(id + '.webm') ? { audio: true } : {}) }]))
    if (Object.keys(data.words).length !== pronunciations.size) throw new Error(name + ' references a missing pronunciation')
  }
  await writeFile(new URL(name, output), spokenWords || entries.length ? JSON.stringify(data) : text)
  index.push({ subject: topic.subject, topicId: topic.topicId, file: name, lessons })
}
await writeFile(new URL('index.json', output), JSON.stringify(index, null, 2) + '\n')
