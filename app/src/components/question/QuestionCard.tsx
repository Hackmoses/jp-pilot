import type { ComponentChildren } from 'preact'
import { useEffect, useId, useState } from 'preact/hooks'
import type { Option, OptionId, Question } from '../../lib/types'
import { ReadAloudButton } from '../share/ReadAloudButton'
import { OPTION_LETTERS, getOptionViewState, getRemoveButtonLabel, getResultCopy } from './logic'

export interface QuestionCardProps {
  question: Question
  review: boolean
  options: readonly Option[]
  pickedId: OptionId | null
  removedIds: readonly OptionId[]
  hintOpen: boolean
  onPick: (optionId: OptionId) => void
  onToggleHint: () => void
  onRemoveOption?: () => void
  removalsLeft?: number
  showRemoveButton?: boolean
  calculationSlot?: ComponentChildren
}

export function QuestionCard({
  question,
  review,
  options,
  pickedId,
  removedIds,
  hintOpen,
  onPick,
  onToggleHint,
  onRemoveOption,
  removalsLeft = 0,
  showRemoveButton = false,
  calculationSlot,
}: QuestionCardProps) {
  const answered = pickedId !== null
  const isCorrect = answered && pickedId === question.answerId
  const result = answered ? getResultCopy(isCorrect, removedIds.length) : null
  const [explainOpen, setExplainOpen] = useState(true)
  const explainBodyId = useId()

  useEffect(() => {
    setExplainOpen(true)
  }, [question.id])

  const toggleExplain = () => setExplainOpen((prev) => !prev)

  const pickedIdx = pickedId ? options.findIndex((option) => option.id === pickedId) : -1
  const pickedOption = pickedIdx >= 0 ? options[pickedIdx] : undefined
  const pickedLetter = pickedIdx >= 0 ? OPTION_LETTERS[pickedIdx] : ''
  const correctIdx = options.findIndex((option) => option.id === question.answerId)
  const correctLetter = correctIdx >= 0 ? OPTION_LETTERS[correctIdx] : ''

  return (
    <>
      {result && (
        <div
          class={`jp-result ${isCorrect ? 'jp-result--good' : 'jp-result--bad'}`}
          role="status"
          aria-live="polite"
        >
          <span class="jp-result-icon" aria-hidden="true">
            {isCorrect ? (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            ) : (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="3"
                stroke-linecap="round"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            )}
          </span>
          <div class="jp-result-copy">
            <span class="jp-result-title">
              {isCorrect ? 'Correct.' : `Not quite. You chose ${pickedLetter}.`}
            </span>
            <span class="jp-result-sub">{result.subtitle}</span>
          </div>
        </div>
      )}

      <section class="jp-card jp-question-card" aria-label="Question">
        {review && <span class="jp-pill jp-pill--streak jp-pill--review">Review</span>}
        <p class="jp-stem">{question.stem}</p>

        <div class="jp-options" role="group" aria-label="Answer options">
          {options.map((option, index) => {
            const view = getOptionViewState(option, index, question, pickedId, removedIds)
            const statusClass = view.status === 'idle' ? '' : ` jp-option--${view.status}`

            return (
              <button
                key={option.id}
                type="button"
                class={`jp-option${statusClass}`}
                disabled={view.disabled}
                aria-disabled={view.disabled ? 'true' : undefined}
                onClick={() => onPick(option.id)}
              >
                <span class="jp-option-main">
                  <span class="jp-badge" aria-hidden="true">
                    {view.letter}
                  </span>
                  <span class="jp-option-text">{option.text}</span>
                </span>
                {view.note && <span class="jp-option-note">{view.note}</span>}
              </button>
            )
          })}
        </div>

        {!answered && (
          <>
            <div class="jp-actions">
              {showRemoveButton && onRemoveOption && (
                <button
                  type="button"
                  class="jp-btn jp-btn--remove"
                  disabled={removalsLeft === 0}
                  onClick={onRemoveOption}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path d="M8 12h8" />
                  </svg>
                  {getRemoveButtonLabel(removalsLeft)}
                </button>
              )}
              <button
                type="button"
                class="jp-btn jp-btn--hint"
                aria-expanded={hintOpen}
                onClick={onToggleHint}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <path d="M9 18h6" />
                  <path d="M10 22h4" />
                  <path d="M12 2a7 7 0 0 0-4 12.7V16h8v-1.3A7 7 0 0 0 12 2z" />
                </svg>
                {hintOpen ? 'Hide hint' : 'Show a hint'}
              </button>
            </div>

            {hintOpen && (
              <div class="jp-hint-box" role="region" aria-label="Hint">
                <span class="jp-hint-label">Hint</span>
                <p>{question.hint}</p>
              </div>
            )}
          </>
        )}
      </section>

      {answered && calculationSlot}

      {answered && !isCorrect && pickedOption?.whyWrong && (
        <section
          class="jp-card jp-wrong-card"
          aria-label={`Why ${pickedLetter} is wrong`}
        >
          <div class="jp-wrong-head">
            <h2 class="jp-wrong-title">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2.6" stroke-linecap="round" aria-hidden="true">
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
              WHY {pickedLetter} IS WRONG
            </h2>
            <ReadAloudButton questionId={question.id} target="whyWrong" optionId={pickedOption.id} />
          </div>
          <p class="jp-explain-body">{pickedOption.whyWrong}</p>
        </section>
      )}

      {answered && (
        <section
          class="jp-card jp-explain-card"
          data-open={explainOpen ? 'true' : 'false'}
          aria-label={`Why ${correctLetter} is correct`}
        >
          <div class="jp-explain-head">
            <button
              type="button"
              class="jp-explain-title-btn"
              aria-expanded={explainOpen}
              aria-controls={explainBodyId}
              onClick={toggleExplain}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M20 6 9 17l-5-5" />
              </svg>
              WHY {correctLetter} IS CORRECT
            </button>
            <ReadAloudButton questionId={question.id} target="explanation" />
            <button
              type="button"
              class="jp-explain-toggle-btn"
              aria-expanded={explainOpen}
              aria-controls={explainBodyId}
              onClick={toggleExplain}
            >
              <span>{explainOpen ? 'Hide' : 'Show'}</span>
              <span class="jp-explain-chev" data-open={explainOpen ? 'true' : 'false'} aria-hidden="true">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d={explainOpen ? 'm18 15-6-6-6 6' : 'm6 9 6 6 6-6'} />
                </svg>
              </span>
            </button>
          </div>
          <div id={explainBodyId} class="jp-explain-content" hidden={!explainOpen}>
            <p class="jp-explain-body">{question.explanation}</p>
            <div class="jp-explain-subgrid">
              <div class="jp-subbox jp-subbox--trap">
                <span class="jp-subbox-label">The trap</span>
                <p>{question.trap}</p>
              </div>
              <div class="jp-subbox jp-subbox--memo">
                <span class="jp-subbox-label">Remember it</span>
                <p>{question.mnemonic}</p>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  )
}
