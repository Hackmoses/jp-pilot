import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  CalculationPlayback,
  getInitialNarrationMode,
  resetSessionPlaybackPreferences,
  setSessionNarrationMode,
  type PlaybackState,
} from './CalculationPlayback'

const makeClip = (animationId: string, step: number, path: string, durationMs: number) => ({
  animationId,
  step,
  path,
  durationMs,
  lineSha256: `sha-${step}`,
  voice: 'kokoro-af_heart',
})

describe('Quick | Teach me playback', () => {
  beforeEach(() => {
    resetSessionPlaybackPreferences()
    vi.stubGlobal('window', {
      setTimeout: globalThis.setTimeout.bind(globalThis),
      clearTimeout: globalThis.clearTimeout.bind(globalThis),
      location: { href: 'http://localhost/' },
    })
    vi.stubGlobal('requestAnimationFrame', () => 1)
    vi.stubGlobal('cancelAnimationFrame', () => {})
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('defaults to Teach me after wrong pick, Quick after right pick, and remembers manual choice', () => {
    expect(getInitialNarrationMode(false, false)).toBe('quick')
    expect(getInitialNarrationMode(true, false)).toBe('teach')
    expect(getInitialNarrationMode(true, true)).toBe('teach')

    setSessionNarrationMode('quick')
    expect(getInitialNarrationMode(true, false)).toBe('quick')

    setSessionNarrationMode('teach')
    expect(getInitialNarrationMode(true, true)).toBe('teach')
    expect(getInitialNarrationMode(false, true)).toBe('quick')
  })

  it('restarts at step 1 on mode switch and keeps sound, speed, and 3s rewind across steps', () => {
    const states: PlaybackState[] = []
    const quickClips = [
      makeClip('anim-chem-api-0154', 1, 'audio/anim-chem-api-0154/1.webm', 6010),
      makeClip('anim-chem-api-0154', 2, 'audio/anim-chem-api-0154/2.webm', 4690),
    ]
    const teachClips = [
      makeClip('anim-chem-api-0154', 1, 'audio/teach/anim-chem-api-0154/1.webm', 10500),
      makeClip('anim-chem-api-0154', 2, 'audio/teach/anim-chem-api-0154/2.webm', 9500),
      makeClip('anim-chem-api-0154', 3, 'audio/teach/anim-chem-api-0154/3.webm', 11090),
    ]

    const playback = new CalculationPlayback(
      quickClips,
      3000,
      (s) => states.push(s),
      () => {},
    )
    playback.setSound(false)
    playback.setSpeed(1.25)
    playback.start(1, false, true)
    expect(states[states.length - 1]).toEqual({ index: 1, playing: true, sound: false, speed: 1.25 })

    // Switching mode restarts from step 1 while preserving sound=false and speed=1.25.
    playback.setClips(teachClips, true)
    expect(states[states.length - 1]).toEqual({ index: 0, playing: true, sound: false, speed: 1.25 })

    // Advance into step 2 silently (muted), then rewind 3 seconds across back into step 1.
    playback.start(1, false, true, 500)
    playback.rewind(3)
    expect(states[states.length - 1]).toEqual({ index: 0, playing: true, sound: false, speed: 1.25 })

    playback.dispose()
  })
})
