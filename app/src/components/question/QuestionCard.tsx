import type { Option, OptionId, Question } from '../../lib/types'
import { SolutionPlayer } from '../player/SolutionPlayer'
import { ReadAloudButton } from '../share/ReadAloudButton'
import { ReportButton } from '../share/ReportButton'
import { getOptionViewState, getRemoveButtonLabel, getResultCopy } from './logic'

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
}: QuestionCardProps) {
  const answered = pickedId !== null
  const isCorrect = answered && pickedId === question.answerId
  const result = answered ? getResultCopy(isCorrect, removedIds.length) : null

  return (
    <>
      <div class="jp-question-col">
        {result && (
          <div
            class={`jp-result ${isCorrect ? 'jp-result--good' : 'jp-result--bad'}`}
            role="status"
            aria-live="polite"
          >
            <span class="jp-result-icon" aria-hidden="true">
              {isCorrect ? (
                <svg
                  width="18"
                  height="18"
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
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="3"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              )}
            </span>
            <div class="jp-result-copy">
              <span class="jp-result-title">{result.title}</span>
              <span class="jp-result-sub">{result.subtitle}</span>
            </div>
          </div>
        )}

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

        {answered && <ReportButton questionId={question.id} />}
      </div>

      {answered && (
        <div class="jp-explain-col">
          {question.animationId && (
            <div
              class="jp-player-slot"
              data-slot="solution-player"
              data-animation-id={question.animationId}
            >
              <SolutionPlayer animationId={question.animationId} />
            </div>
          )}

          <div class="jp-blocks">
            <section class="jp-block jp-block--explain" aria-label="Why it is correct">
              <span class="jp-block-label">Why it is correct</span>
              <p>{question.explanation}</p>
              <ReadAloudButton questionId={question.id} target="explanation" />
            </section>

            {!question.animationId && (
              <section class="jp-block jp-block--trap" aria-label="The trap">
                <span class="jp-block-label">The trap</span>
                <p>{question.trap}</p>
              </section>
            )}

            <section class="jp-block jp-block--memo" aria-label="Remember it">
              <span class="jp-block-label">Remember it</span>
              <p>{question.mnemonic}</p>
            </section>
          </div>
        </div>
      )}
    </>
  )
}
