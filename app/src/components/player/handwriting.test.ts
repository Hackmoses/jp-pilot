import { afterEach, expect, it, vi } from 'vitest'
import { CalculationPlayback, resetSessionPlaybackPreferences, type PlaybackState } from './CalculationPlayback'
import { bindHandwriting, handwritingFrame } from './handwriting'
import { swipeDirection } from './SolutionPlayer'

const row = { left: 0, right: 100, top: 0, bottom: 20, atoms: [] }

afterEach(() => {
  resetSessionPlaybackPreferences()
  vi.unstubAllGlobals()
})

function testClock() {
  let frame: FrameRequestCallback | undefined
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    frame = callback
    return 1
  })
  vi.stubGlobal('cancelAnimationFrame', () => { frame = undefined })
  return (time: number) => {
    const callback = frame
    expect(callback).toBeDefined()
    frame = undefined
    callback?.(time)
  }
}

it('moves the pen with recorded audio, holds on pause, and restores the same position on seek', async () => {
  class FakeAudio {
    duration = 4
    currentTime = 0
    ended = false
    oncanplay: (() => void) | null = null
    play = vi.fn(async () => {})
    pause = vi.fn()
    load = vi.fn()
    removeAttribute = vi.fn()
  }
  const audio = new FakeAudio()
  vi.stubGlobal('Audio', function () { return audio })
  vi.stubGlobal('window', { location: { href: 'http://localhost/' }, setTimeout })
  vi.stubGlobal('fetch', vi.fn(async () => new Response(new Blob(['test']))))
  const tick = testClock()
  const states: PlaybackState[] = []
  const playback = new CalculationPlayback(
    [{ path: 'audio/test.webm', durationMs: 4300, lineSha256: 'sha', voice: 'test' }],
    4000, (state) => states.push(state), () => {},
  )
  const pen = () => handwritingFrame([row], 100, playback.progress, 10)

  try {
    playback.start()
    await vi.waitFor(() => expect(audio.oncanplay).toBeTypeOf('function'))
    audio.oncanplay?.()
    tick(0)
    expect(pen()).toEqual({ x: 0, y: 20, clip: 'inset(0 100px 0 0)' })

    audio.currentTime = 2
    tick(500)
    expect(pen()?.x).toBeCloseTo(110 * 2 / 3.9)
    const halfway = pen()
    tick(1500)
    expect(pen()).toEqual(halfway)

    playback.pause()
    expect(audio.pause).toHaveBeenCalled()
    playback.rewind(1)
    expect(audio.currentTime).toBe(1)
    expect(pen()?.x).toBeCloseTo(110 / 3.9)
    playback.toggle()

    audio.currentTime = 3.9
    tick(2000)
    expect(pen()).toEqual({ x: 100, y: 10, clip: 'none' })
    audio.currentTime = 4
    audio.ended = true
    tick(2200)
    expect(pen()?.x).toBe(100)
    expect(states[states.length - 1]).toMatchObject({ index: 1, playing: false })
  } finally {
    playback.dispose()
  }
})

it('uses the silent step clock and resets the reveal for navigation and replay', () => {
  const tick = testClock()
  const playback = new CalculationPlayback([undefined, undefined], 4000, () => {}, () => {})
  playback.start()
  tick(0)
  tick(900)
  expect(playback.progress).toBeCloseTo(0.5)
  playback.pause()
  expect(playback.progress).toBeCloseTo(0.5)
  playback.toggle()
  tick(2000)
  tick(2900)
  expect(playback.progress).toBe(1)
  playback.start(1)
  expect(playback.progress).toBe(0)
  playback.start(0, true)
  expect(playback.progress).toBe(0)
  playback.dispose()
})

it('reveals an entire math box at once and lifts the pen between wrapped lines', () => {
  const rows = [
    { ...row, atoms: [{ left: 30, right: 65 }] },
    { ...row, right: 40, top: 25, bottom: 45 },
  ]
  const halfwayThroughFraction = handwritingFrame(rows, 100, 50 / 160, 10)
  expect(halfwayThroughFraction).toMatchObject({ x: 50, y: 20 })
  expect(halfwayThroughFraction?.clip).toContain('30px 22.5px')
  expect(handwritingFrame(rows, 100, 65 / 160, 10)?.clip).toContain('65px 22.5px')
  expect(handwritingFrame(rows, 100, 105 / 160, 10)).toMatchObject({ x: 50, y: 22.5 })
  expect(handwritingFrame(rows, 100, 1, 10)?.clip).toBe('none')
})

it('shows full lines and makes no pen or layout updates with reduced motion', () => {
  const preference = { matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }
  const observe = vi.fn()
  vi.stubGlobal('window', { matchMedia: vi.fn(() => preference) })
  vi.stubGlobal('ResizeObserver', function () { return { observe, disconnect: vi.fn() } })
  const paper = { getBoundingClientRect: vi.fn() }
  const line = { style: { clipPath: 'inset(0 50% 0 0)' } }
  const pen = { style: { clipPath: 'none', transform: '' } }
  const binding = bindHandwriting(
    paper as unknown as HTMLElement, line as unknown as HTMLElement, pen as unknown as SVGSVGElement,
  )
  binding.paint(0)
  binding.paint(0.5)
  expect(observe).not.toHaveBeenCalled()
  expect(paper.getBoundingClientRect).not.toHaveBeenCalled()
  expect(line.style.clipPath).toBe('')
  expect(pen.style.clipPath).toBe('')
  expect(pen.style.transform).toBe('')
  binding.dispose()
})

it('accepts horizontal drags and flicks in both directions, leaving vertical pans alone', () => {
  expect(swipeDirection(-41, 10, 600)).toBe(1)
  expect(swipeDirection(43, -8, 600)).toBe(-1)
  expect(swipeDirection(-23, 3, 42)).toBe(1)
  expect(swipeDirection(-23, 3, 200)).toBe(0)
  expect(swipeDirection(44, 70, 75)).toBe(0)
  expect(swipeDirection(9, 1, 25)).toBe(0)
})
