import { useEffect, useState } from 'preact/hooks'
import { getQuestion } from '../../lib/data'
import { mathToSpeech } from '../../lib/mathText'
import {
  cancelSpeech,
  getActiveSpeechKey,
  isSpeechAvailable,
  speak,
  subscribeToSpeechAvailability,
  subscribeToSpeechState,
} from '../../lib/speech'
import { logEvent } from '../../lib/store'
import type { Option, OptionId, Question } from '../../lib/types'
import { OPTION_LETTERS } from '../question/logic'
import './share.css'

type ReadAloudProps = {
  questionId: string
} & (
  | { target: 'question'; options: readonly Option[] }
  | { target: 'explanation' }
  | { target: 'whyWrong'; optionId: OptionId }
  | { target: 'otherWrong'; options: readonly Option[]; pickedId: OptionId | null }
)

function describe(option: Option) {
  return option.figure ? [option.text, option.figure.alt].filter(Boolean).join('. ') : option.text
}

function wordsForQuestion(question: Question, props: ReadAloudProps) {
  switch (props.target) {
    case 'question':
      return [
        question.stem,
        question.figure?.alt,
        ...props.options.map((option, index) => 'Option ' + OPTION_LETTERS[index] + '. ' + describe(option)),
      ].filter(Boolean).join(' ')
    case 'whyWrong': {
      const option = question.options.find((item) => item.id === props.optionId)
      return [option?.figure?.alt, option?.whyWrong].filter(Boolean).join(' ')
    }
    case 'otherWrong':
      return props.options
        .map((option, index) => ({ option, letter: OPTION_LETTERS[index] ?? 'A' }))
        .filter(({ option }) => option.id !== question.answerId && option.id !== props.pickedId && option.whyWrong?.trim())
        .map(({ option, letter }) => 'Option ' + letter + ', ' + describe(option) + '. ' + option.whyWrong)
        .join(' ')
    case 'explanation':
      return question.explanation
  }
}

export function ReadAloudButton(props: ReadAloudProps) {
  const { questionId, target } = props
  const speechKey = props.target === 'whyWrong'
    ? `${questionId}:whyWrong:${props.optionId}`
    : `${questionId}:${target}`
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

  const words = wordsForQuestion(question, props)

  if (!words.trim()) return null

  const idleLabel = target === 'question'
    ? 'Read question aloud'
    : target === 'whyWrong'
      ? 'Read why your answer is wrong aloud'
      : target === 'otherWrong'
        ? 'Read why other options are wrong aloud'
        : 'Read explanation aloud'
  const stopLabel = target === 'question'
    ? 'Stop reading question'
    : target === 'whyWrong' || target === 'otherWrong'
      ? 'Stop reading'
      : 'Stop reading explanation'

  const buttonClass = target === 'question'
    ? 'jp-wsd-button jp-read-aloud'
    : target === 'whyWrong'
      ? 'jp-wsd-button jp-read-aloud jp-read-aloud--explain jp-read-aloud--wrong'
      : 'jp-wsd-button jp-read-aloud jp-read-aloud--explain'

  return (
    <button
      class={buttonClass}
      type="button"
      aria-label={speaking ? stopLabel : idleLabel}
      aria-pressed={speaking}
      onClick={() => {
        if (speaking) {
          cancelSpeech()
        } else if (speak(mathToSpeech(words), speechKey)) {
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
      {target !== 'question' && (speaking ? 'Stop reading' : 'Read aloud')}
    </button>
  )
}
