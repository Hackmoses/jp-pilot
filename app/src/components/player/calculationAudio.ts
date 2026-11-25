import manifest from '../../../../audio/manifest.json'
import spoken from '../../../../audio/spoken.json'

export type NarrationMode = 'quick' | 'teach'

type Clip = (typeof manifest.clips)[number]

export function calculationAudio(id: string, mode: NarrationMode = 'quick') {
  const isTeach = mode === 'teach'
  const clips = new Map(
    manifest.clips
      .filter((clip) => clip.animationId === id && clip.path.startsWith('audio/teach/') === isTeach)
      .map((clip) => [clip.step, clip]),
  )
  return clips.size
    ? { clips, captions: isTeach ? undefined : (spoken as Record<string, string[]>)[id] }
    : undefined
}

const cacheName = 'jp-calculation-audio-v1'
const played = new Map<string, Blob>()

async function openAudioCache() {
  try {
    return await window.caches?.open(cacheName)
  } catch {
    return undefined
  }
}

export function requestClip(clip: Clip) {
  const url = new URL(import.meta.env.BASE_URL + clip.path, window.location.href)
  url.searchParams.set('v', `${clip.voice}-${clip.durationMs}-${clip.lineSha256}`)
  const key = url.href
  const controller = new AbortController()
  const blob = (async () => {
    const memory = played.get(key)
    if (memory) return memory
    const cache = await openAudioCache()
    const stored = await cache?.match(key).catch(() => undefined)
    if (stored) return stored.blob()
    const response = await fetch(key, { cache: 'no-store', signal: controller.signal })
    if (!response.ok || response.headers.get('Content-Type')?.includes('text/html')) return undefined
    return response.blob()
  })().catch(() => undefined)

  return {
    clip,
    blob,
    abort: () => controller.abort(),
    saveAfterPlay(data: Blob) {
      if (played.has(key)) return
      played.set(key, data)
      void openAudioCache().then((cache) => cache?.put(key, new Response(data, {
        headers: { 'Content-Type': data.type || 'audio/webm' },
      }))).catch(() => {})
    },
  }
}
