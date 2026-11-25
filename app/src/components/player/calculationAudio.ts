import spoken from '../../../../audio/spoken.json'
import audioIndex from './audioIndex.json'

export type NarrationMode = 'quick' | 'teach'

type IndexedClip = [step: number, durationMs: number, signature: string, voice?: number, path?: string]
type Clip = { path: string; durationMs: number; lineSha256: string; voice: string }

const tracks = audioIndex.tracks as unknown as Record<string, IndexedClip[] | undefined>

export function calculationAudio(id: string, mode: NarrationMode = 'quick') {
  const isTeach = mode === 'teach'
  const track = tracks[isTeach ? id + '/teach' : id]
  if (!track) return undefined
  const clips = new Map<number, Clip>()
  const prefix = isTeach ? 'audio/teach/' : 'audio/'
  for (const [step, durationMs, signature, voice = 0, path] of track) {
    const lineSha256 = Array.from(atob(signature), (byte) =>
      byte.charCodeAt(0).toString(16).padStart(2, '0')).join('')
    clips.set(step, {
      durationMs,
      lineSha256,
      voice: audioIndex.voices[voice],
      path: path ?? `${prefix}${id}/${step}.webm`,
    })
  }
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
  const version = `${clip.voice}-${clip.durationMs}-${clip.lineSha256}`
  url.searchParams.set('v', version)
  const key = url.href
  const controller = new AbortController()
  const blob = (async () => {
    const memory = played.get(key)
    if (memory) return memory
    const cache = await openAudioCache()
    const stored = await cache?.match(key).catch(() => undefined)
    if (stored) return stored.blob()
    // Older releases stored the full SHA-256 in the same version parameter.
    const cachedKeys = await cache?.keys(key, { ignoreSearch: true }).catch(() => [])
    const legacy = cachedKeys?.find(({ url }) => new URL(url).searchParams.get('v')?.startsWith(version))
    if (legacy) {
      const storedClip = await cache?.match(legacy).catch(() => undefined)
      if (storedClip) return storedClip.blob()
    }
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
