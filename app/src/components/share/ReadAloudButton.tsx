import { useEffect, useState } from 'preact/hooks'
import { getQuestion } from '../../lib/data'
import {
  cancelSpeech,
  getActiveSpeechKey,
  isSpeechAvailable,
  speak,
  subscribeToSpeechAvailability,
  subscribeToSpeechState,
} from '../../lib/speech'
import { logEvent } from '../../lib/store'
import type { Option } from '../../lib/types'
import './share.css'

type ReadAloudProps = {
  questionId: string
} & (
  | { target: 'question'; options: readonly Option[] }
  | { target: 'explanation' }
)

export function ReadAloudButton(props: ReadAloudProps) {
  const { questionId, target } = props
  const speechKey = `${questionId}:${target}`
  const [available, setAvailable] = useState(isSpeechAvailable)
  const [activeKey, setActiveKey] = useState<string | null>(getActiveSpeechKey)
  const question = getQuestion(questionId)
  const speaking = activeKey === speechKey

  useEffect(() => subscribeToSpeechAvailability(setAvailable), [])
  useEffect(() => subscribeToSpeechState(setActiveKey), [])
  useEffect(
    () => () => {
      if (getActiveSpeechKey() === speechKey) cancelSpeech()
    },
    [speechKey],
  )

  if (!available || !question) return null

  const words = props.target === 'question'
    ? [question.stem, ...props.options.map((option, index) => `Option ${'ABCD'[index]}. ${option.text}`)].join(' ')
    : question.explanation
  const idleLabel = target === 'question' ? 'Read question aloud' : 'Read explanation aloud'
  const stopLabel = target === 'question' ? 'Stop reading question' : 'Stop reading explanation'

  return (
    <button
      class={target === 'question' ? 'jp-wsd-button jp-read-aloud' : 'jp-wsd-button jp-read-aloud jp-read-aloud--explain'}
      type="button"
      aria-label={speaking ? stopLabel : idleLabel}
      aria-pressed={speaking}
      onClick={() => {
        if (speaking) {
          cancelSpeech()
        } else if (speak(words, speechKey)) {
          logEvent('read_aloud', { questionId, target })
        }
      }}
    >
      {speaking ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <rect x="6" y="6" width="12" height="12" rx="2" />
        </svg>
      ) : (
        <svg width={target === 'question' ? 18 : 14} height={target === 'question' ? 18 : 14} viewBox="0 0 24 24" fill="none" stroke="currentColor"
          stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M11 5 6 9H2v6h4l5 4V5zM15.5 8.5a5 5 0 0 1 0 7" />
          {target === 'question' && <path d="M19 5a10 10 0 0 1 0 14" />}
        </svg>
      )}
      {target === 'explanation' && (speaking ? 'Stop reading' : 'Read aloud')}
    </button>
  )
}
