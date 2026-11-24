let activeKey: string | null = null
let currentUtterance: SpeechSynthesisUtterance | null = null
const stateListeners = new Set<(key: string | null) => void>()

function getSynth(): SpeechSynthesis | undefined {
  return typeof window === 'undefined' || typeof window.SpeechSynthesisUtterance !== 'function'
    ? undefined
    : window.speechSynthesis
}

function getVoice(synth: SpeechSynthesis): SpeechSynthesisVoice | undefined {
  const localVoices = synth.getVoices().filter((voice) => voice.localService)
  return localVoices.find((voice) => /^en(?:[-_]|$)/i.test(voice.lang)) ?? localVoices[0]
}

function setActiveKey(nextKey: string | null): void {
  if (activeKey === nextKey) return
  activeKey = nextKey
  for (const listener of stateListeners) listener(activeKey)
}

export function isSpeechAvailable(): boolean {
  const synth = getSynth()
  return !!synth && !!getVoice(synth)
}

export function subscribeToSpeechAvailability(onChange: (available: boolean) => void): () => void {
  const synth = getSynth()
  const update = () => onChange(isSpeechAvailable())
  synth?.addEventListener('voiceschanged', update)
  update()
  return () => synth?.removeEventListener('voiceschanged', update)
}

export function getActiveSpeechKey(): string | null {
  return activeKey
}

export function subscribeToSpeechState(onChange: (key: string | null) => void): () => void {
  stateListeners.add(onChange)
  onChange(activeKey)
  return () => {
    stateListeners.delete(onChange)
  }
}

export function speak(text: string, key = '__default__'): boolean {
  const synth = getSynth()
  const voice = synth && getVoice(synth)
  if (!synth || !voice || !text.trim()) return false

  currentUtterance = null
  synth.cancel()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.voice = voice
  utterance.lang = voice.lang
  currentUtterance = utterance

  const finish = () => {
    if (currentUtterance === utterance) {
      currentUtterance = null
      setActiveKey(null)
    }
  }
  utterance.onend = finish
  utterance.onerror = finish

  setActiveKey(key)
  synth.speak(utterance)
  return true
}

export function cancelSpeech(): void {
  currentUtterance = null
  setActiveKey(null)
  getSynth()?.cancel()
}
