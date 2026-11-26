import type { ComponentChildren } from 'preact'
import { useEffect, useId, useState } from 'preact/hooks'
import { hasMatrixNotation, mathToSpeech, renderMathText } from '../../lib/mathText'
import type { Option, OptionId, Question } from '../../lib/types'
import { Figure } from '../figures/Figure'
import { ReadAloudButton } from '../share/ReadAloudButton'
import { OPTION_LETTERS, getOptionViewState, getQuestionSourceLabel, getResultCopy } from './logic'

export interface QuestionCardProps {
  question: Question
  review: boolean
  options: readonly Option[]
  pickedId: OptionId | null
  reveal?: boolean
  exam?: boolean
  onPick: (optionId: OptionId) => void
  calculationSlot?: ComponentChildren
  conceptSlot?: ComponentChildren
  // Practice: a short verdict first; the full breakdown opens only when asked.
  compact?: boolean
  full?: boolean
  onFull?: () => void
  learnHref?: string
  learnLabel?: string
  verdictReason?: string
  sourceLabel?: string
}

export function QuestionCard({
  question,
  review,
  options,
  pickedId,
  reveal = false,
  exam = false,
  onPick,
  calculationSlot,
  conceptSlot,
  compact = false,
  full = false,
  onFull,
  learnHref,
  learnLabel,
  verdictReason,
  sourceLabel: sourceOverride,
}: QuestionCardProps) {
  const answered = !exam && (pickedId !== null || reveal)
  const isCorrect = answered && pickedId === question.answerId
  const result = answered && pickedId !== null ? getResultCopy(isCorrect) : null
  const brief = compact && answered && !full
  // All explanation cards start collapsed; the student opens what they need.
  const [explainOpen, setExplainOpen] = useState(false)
  const [otherWrongOpen, setOtherWrongOpen] = useState(false)
  const [wrongOpen, setWrongOpen] = useState(false)
  const wrongBodyId = useId()
  const explainBodyId = useId()
  const otherWrongBodyId = useId()

  useEffect(() => {
    setExplainOpen(false)
    setOtherWrongOpen(false)
    setWrongOpen(false)
  }, [question.id])

  const toggleExplain = () => setExplainOpen((prev) => !prev)
  const toggleOtherWrong = () => setOtherWrongOpen((prev) => !prev)
  const toggleWrong = () => setWrongOpen((prev) => !prev)

  const otherWrongOptions = answered
    ? options
        .map((option, index) => ({ option, letter: OPTION_LETTERS[index] ?? 'A' }))
        .filter(
          ({ option }) =>
            option.id !== question.answerId &&
            option.id !== pickedId &&
            typeof option.whyWrong === 'string' &&
            option.whyWrong.trim().length > 0,
        )
    : []

  const pickedIdx = pickedId ? options.findIndex((option) => option.id === pickedId) : -1
  const pickedOption = pickedIdx >= 0 ? options[pickedIdx] : undefined
  const pickedLetter = pickedIdx >= 0 ? OPTION_LETTERS[pickedIdx] : ''
  const correctIdx = options.findIndex((option) => option.id === question.answerId)
  const correctLetter = correctIdx >= 0 ? OPTION_LETTERS[correctIdx] : ''

  const hasVisual = question.figure || hasMatrixNotation(question.stem) ||
    options.some((option) => option.figure || hasMatrixNotation(option.text))
  const sourceLabel = exam ? null : (sourceOverride ?? getQuestionSourceLabel(question))

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
              {isCorrect ? 'Correct.' : compact ? `Not quite. The answer is ${correctLetter}.` : `Not quite. You chose ${pickedLetter}.`}
            </span>
            <span class="jp-result-sub">{verdictReason ?? (compact ? (isCorrect ? 'Well done. Keep going.' : 'This question comes back in your next session.')
              : reveal && !isCorrect ? 'Read why under your answer.' : result.subtitle)}</span>
          </div>
        </div>
      )}

      <section class="jp-card jp-question-card" aria-label="Question">
        {!exam && (review || sourceLabel) && (
          <div class="jp-pills">
            {review && <span class="jp-pill jp-pill--streak jp-pill--review">Review</span>}
            {sourceLabel && (
              <span class={sourceLabel.startsWith('JAMB ') ? 'jp-pill jp-jamb-badge' : 'jp-pill jp-pill--practice jp-pill--review'}>{sourceLabel}</span>
            )}
          </div>
        )}
        <p class="jp-stem">{renderMathText(question.stem)}</p>
        {question.figure && <Figure data={question.figure} />}
        {hasVisual && (exam || answered) &&
          <ReadAloudButton questionId={question.id} target="question" options={options} />}

        <div class="jp-options" role="group" aria-label="Answer options">
          {options.map((option, index) => {
            const view = getOptionViewState(option, index, question, exam ? null : pickedId, reveal)
            const statusClass = view.status === 'idle' ? '' : ` jp-option--${view.status}`

            return (
              <button
                key={option.id}
                type="button"
                class={`jp-option${statusClass}`}
                disabled={view.disabled}
                aria-disabled={view.disabled ? 'true' : undefined}
                aria-label={option.figure
                  ? [view.letter, mathToSpeech(option.text), option.figure.alt, view.note].filter(Boolean).join('. ')
                  : undefined}
                aria-pressed={exam ? pickedId === option.id : undefined}
                onClick={() => onPick(option.id)}
              >
                <span class="jp-option-main">
                  <span class="jp-badge" aria-hidden="true">
                    {view.letter}
                  </span>
                  <span class="jp-option-text">
                    {renderMathText(option.text)}
                    {option.figure && <Figure data={option.figure} />}
                  </span>
                </span>
                {view.note && (!brief || option.id === question.answerId || option.id === pickedId) &&
                  <span class="jp-option-note">{renderMathText(view.note)}</span>}
              </button>
            )
          })}
        </div>
      </section>

      {compact && answered && <div class="jp-practice-actions">
        <button type="button" class="jp-btn" aria-expanded={full} onClick={onFull}>{full ? 'Hide full solution' : 'Full solution'}</button>
        {learnHref && <a class={isCorrect ? 'jp-btn' : 'jp-btn jp-btn--primary'} href={learnHref}>{learnLabel ?? 'Learn this topic →'}</a>}
      </div>}
      {answered && !brief && calculationSlot}
      {answered && !brief && !isCorrect && pickedOption?.whyWrong && (
        <section
          class="jp-card jp-wrong-card"
          data-open={wrongOpen ? 'true' : 'false'}
          aria-label={`Why ${pickedLetter} is wrong`}
        >
          <div class="jp-wrong-head">
            <h2 class="jp-wrong-title">
              <button type="button" class="jp-wrong-title-btn" aria-expanded={wrongOpen} aria-controls={wrongBodyId} onClick={toggleWrong}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2.6" stroke-linecap="round" aria-hidden="true">
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
                WHY {pickedLetter} IS WRONG
              </button>
            </h2>
            <ReadAloudButton questionId={question.id} target="whyWrong" optionId={pickedOption.id} />
            <button type="button" class="jp-explain-toggle-btn jp-wrong-toggle-btn" aria-expanded={wrongOpen} aria-controls={wrongBodyId} onClick={toggleWrong}>
              <span>{wrongOpen ? 'Hide' : 'Show'}</span>
              <span class="jp-explain-chev" data-open={wrongOpen ? 'true' : 'false'} aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d={wrongOpen ? 'm18 15-6-6-6 6' : 'm6 9 6 6 6-6'} />
                </svg>
              </span>
            </button>
          </div>
          <div id={wrongBodyId} hidden={!wrongOpen}>
            <p class="jp-explain-body">{renderMathText(pickedOption.whyWrong)}</p>
          </div>
        </section>
      )}

      {answered && !brief && (
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
            <p class="jp-explain-body">{renderMathText(question.explanation)}</p>
            <div class="jp-explain-notes">
              <div class="jp-explain-subgrid">
                <div class="jp-subbox jp-subbox--trap">
                  <span class="jp-subbox-label">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2.2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      aria-hidden="true"
                    >
                      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                      <path d="M12 9v4" />
                      <path d="M12 17h.01" />
                    </svg>
                    WATCH OUT: THE TRAP
                  </span>
                  <p>{renderMathText(question.trap)}</p>
                </div>
                <div class="jp-subbox jp-subbox--memo">
                  <span class="jp-subbox-label">Remember it</span>
                  <p>{renderMathText(question.mnemonic)}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {answered && !brief && conceptSlot}


      {answered && !brief && otherWrongOptions.length > 0 && (
        <section
          class="jp-card jp-other-wrong-card"
          data-open={otherWrongOpen ? 'true' : 'false'}
          aria-label="Why the other options are wrong"
        >
          <div class="jp-explain-head">
            <button
              type="button"
              class="jp-explain-title-btn jp-other-wrong-title-btn"
              aria-expanded={otherWrongOpen}
              aria-controls={otherWrongBodyId}
              onClick={toggleOtherWrong}
            >
              WHY THE OTHER OPTIONS ARE WRONG
            </button>
            <ReadAloudButton
              questionId={question.id}
              target="otherWrong"
              options={options}
              pickedId={pickedId}
            />
            <button
              type="button"
              class="jp-explain-toggle-btn jp-other-wrong-toggle-btn"
              aria-expanded={otherWrongOpen}
              aria-controls={otherWrongBodyId}
              onClick={toggleOtherWrong}
            >
              <span>{otherWrongOpen ? 'Hide' : 'Show'}</span>
              <span class="jp-explain-chev" data-open={otherWrongOpen ? 'true' : 'false'} aria-hidden="true">
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
                  <path d={otherWrongOpen ? 'm18 15-6-6-6 6' : 'm6 9 6 6 6-6'} />
                </svg>
              </span>
            </button>
          </div>
          <div id={otherWrongBodyId} class="jp-other-wrong-list" hidden={!otherWrongOpen}>
            {otherWrongOptions.map(({ option, letter }) => (
              <div key={option.id} class="jp-other-wrong-row">
                <div class="jp-other-wrong-row-head">
                  <span class="jp-other-wrong-letter" aria-hidden="true">{letter}</span>
                  <span class="jp-other-wrong-opt">
                    {renderMathText(option.text)}
                    {option.figure && <Figure data={option.figure} />}
                  </span>
                </div>
                <p class="jp-other-wrong-reason">{renderMathText(option.whyWrong ?? '')}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  )
}
