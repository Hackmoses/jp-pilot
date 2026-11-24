import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

let speech: typeof import('./speech')
let utterances: MockUtterance[] = []
let cancelCount = 0

class MockUtterance {
  text: string
  voice: unknown = null
  lang = ''
  onend: (() => void) | null = null
  onerror: (() => void) | null = null
  constructor(text: string) {
    this.text = text
  }
}

beforeEach(async () => {
  utterances = []
  cancelCount = 0
  vi.resetModules()
  vi.stubGlobal('SpeechSynthesisUtterance', MockUtterance)
  vi.stubGlobal('window', {
    SpeechSynthesisUtterance: MockUtterance,
    speechSynthesis: {
      getVoices: () => [{ localService: true, lang: 'en-NG', name: 'English' }],
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      speak: (u: MockUtterance) => {
        utterances.push(u)
      },
      cancel: () => {
        cancelCount++
      },
    },
  })
  speech = await import('./speech')
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('speech wrapper (D8)', () => {
  it('tracks active speech key across start, natural end, and cancel', () => {
    const states: (string | null)[] = []
    const unsub = speech.subscribeToSpeechState((k) => states.push(k))

    expect(speech.speak('Hello chemistry', 'chem-001:question')).toBe(true)
    expect(speech.getActiveSpeechKey()).toBe('chem-001:question')
    expect(utterances).toHaveLength(1)

    speech.cancelSpeech()
    expect(cancelCount).toBe(2)
    expect(speech.getActiveSpeechKey()).toBeNull()

    expect(speech.speak('Explanation text', 'chem-001:explanation')).toBe(true)
    utterances[1].onend?.()
    expect(speech.getActiveSpeechKey()).toBeNull()
    expect(states).toEqual([null, 'chem-001:question', null, 'chem-001:explanation', null])
    unsub()
  })

  it('ignores stale onerror from a cancelled utterance when a new utterance starts', () => {
    speech.speak('First', 'k1')
    const firstUtterance = utterances[0]

    speech.speak('Second', 'k2')
    firstUtterance.onerror?.()

    expect(speech.getActiveSpeechKey()).toBe('k2')
  })
})
