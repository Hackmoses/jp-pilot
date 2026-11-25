import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { VNode } from 'preact'
import {
  CalculationPlayback,
  getInitialNarrationMode,
  resetSessionPlaybackPreferences,
  setSessionNarrationMode,
  type PlaybackState,
} from './CalculationPlayback'
import {
  hasStructuredStepFields,
  renderAnimatedStepContent,
  renderStaticStepRow,
} from './SolutionPlayer'

function collectClasses(node: unknown, out: string[] = []): string[] {
  if (!node || typeof node !== 'object') return out
  if (Array.isArray(node)) {
    for (const item of node) collectClasses(item, out)
    return out
  }
  const vnode = node as VNode<{ class?: string; children?: unknown }>
  if (typeof vnode.props?.class === 'string') out.push(vnode.props.class)
  if (vnode.props?.children !== undefined) collectClasses(vnode.props.children, out)
  return out
}

function collectText(node: unknown): string {
  if (node == null || typeof node === 'boolean') return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(collectText).join('')
  if (typeof node === 'object') {
    const vnode = node as VNode<{ children?: unknown }>
    return collectText(vnode.props?.children)
  }
  return ''
}

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

  it('keeps concept lessons free of teach-mode override and supports mute, speed, and 3s rewind', () => {
    setSessionNarrationMode('teach')
    // Concept animations pass hasTeach=false so Quick/Teach switch is hidden and Teach mode never overrides.
    expect(getInitialNarrationMode(false, false)).toBe('quick')
    expect(getInitialNarrationMode(false, true)).toBe('quick')

    const states: PlaybackState[] = []
    const conceptClips = [
      makeClip('anim-biol-api-0167', 1, 'audio/anim-biol-api-0167/1.webm', 7200),
      makeClip('anim-biol-api-0167', 2, 'audio/anim-biol-api-0167/2.webm', 7400),
    ]
    const playback = new CalculationPlayback(
      conceptClips,
      7000,
      (s) => states.push(s),
      () => {},
    )
    playback.setSound(false)
    playback.setSpeed(1.25)
    playback.start(1, false, true, 400)
    expect(states[states.length - 1]).toEqual({ index: 1, playing: true, sound: false, speed: 1.25 })

    playback.rewind(3)
    expect(states[states.length - 1]).toEqual({ index: 0, playing: true, sound: false, speed: 1.25 })

    playback.dispose()
  })

  it('renders steps without title, reason, or working identically to legacy layout', () => {
    const legacyStep = {
      n: 1,
      display: '2^{-1} = \\frac{1}{2}',
      tag: 'reciprocal',
      narration: 'Rewrite two to the power of minus one as one over two.',
    }
    expect(hasStructuredStepFields(legacyStep)).toBe(false)

    const staticRow = renderStaticStepRow(legacyStep, false)
    const staticClasses = collectClasses(staticRow).filter((c) => !c.startsWith('jp-math-'))
    expect(staticClasses).toEqual(['jp-calc-line-row', 'jp-calc-line-text', 'jp-calc-line-tag'])
    expect(staticClasses.some((c) => c.startsWith('jp-step__'))).toBe(false)

    const animContent = renderAnimatedStepContent(legacyStep)
    const animClasses = collectClasses(animContent).filter((c) => !c.startsWith('jp-math-'))
    expect(animClasses).toEqual(['jp-player__line', 'jp-player__tag'])
    expect(animClasses.some((c) => c.startsWith('jp-step__'))).toBe(false)

    const structuredStep = {
      ...legacyStep,
      title: '1) Multiply by the conjugate',
      reason: 'Multiply top and bottom by \\sqrt{5} + \\sqrt{3}.',
      working: ['5 - 3 = 2'],
    }
    expect(hasStructuredStepFields(structuredStep)).toBe(true)
    const structuredClasses = collectClasses(renderAnimatedStepContent(structuredStep))
    expect(structuredClasses).toContain('jp-step__title')
    expect(structuredClasses).toContain('jp-step__reason')
    expect(structuredClasses).toContain('jp-step__working')
    expect(structuredClasses).toContain('jp-step__work-item')
    expect(structuredClasses).toContain('jp-step__display-wrap')
    expect(structuredClasses).toContain('jp-player__line')

    const fallbackTitleStep = { ...legacyStep, reason: 'Flip upside down.' }
    const fallbackText = collectText(renderStaticStepRow(fallbackTitleStep, true))
    expect(fallbackText).toContain('reciprocal')
  })
})
