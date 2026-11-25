import { useId, useLayoutEffect, useRef, useState } from 'preact/hooks'
import { getQuestion } from '../../lib/data'
import { logEvent } from '../../lib/store'
import type { AskPreset, Option, OptionId } from '../../lib/types'
import { Figure } from '../figures/Figure'
import { ReadAloudButton } from '../share/ReadAloudButton'
import { renderFormattedText } from './formatFormula'
import { ReplyFeedback, useTypedAsk, type AskHistory, type AskReply } from './TypedAsk'
import './ask.css'

type AskProps = {
  questionId: string
  options: readonly Option[]
  answered: boolean
  letterFor: (optionId: OptionId) => string
}

type Turn = { preset: AskPreset; label: string } | { label: string; reply: AskReply; id: string }

export type AskPanelProps = AskProps & { onClose?: () => void }
export type AskSheetProps = AskProps & { onClose: () => void }

const presetLabels = {
  simpler: 'Explain more simply',
  whynot: 'Why not this option?',
  similar: 'Give me a similar question',
}

function PresetReply({ preset, label }: { preset: AskPreset; label: string }) {
  return (
    <div class="jp-ask-turn">
      <p class="jp-ask-prompt">{label}</p>
      <div class="jp-ask-reply">
        <div class="jp-ask-bubble">
          <div class="jp-ask-bubble-head">
            <span class="jp-ask-tutor-dot" aria-hidden="true" />
            <span>JP Tutor</span>
          </div>
          <p>{renderFormattedText(preset.answer)}</p>
          {preset.id === 'similar' && preset.similarAnswer && (
            <details>
              <summary>
                <span class="jp-ask-show">Show answer</span>
                <span class="jp-ask-hide">Hide answer</span>
              </summary>
              <p class="jp-ask-similar-answer">{renderFormattedText(preset.similarAnswer)}</p>
            </details>
          )}
        </div>
        <small>Saved answer · free</small>
      </div>
    </div>
  )
}

function AskContent({
  questionId,
  options,
  answered,
  letterFor,
  onClose,
  isSheet = false,
  titleId,
}: AskProps & {
  onClose?: () => void
  isSheet?: boolean
  titleId: string
}) {
  const question = getQuestion(questionId)
  const [turns, setTurns] = useState<Turn[]>([])
  const [activePresetId, setActivePresetId] = useState<AskPreset['id'] | null>(null)
  const chat = useRef<HTMLDivElement>(null)
  const typed = import.meta.env.DEV
    ? useTypedAsk(questionId, answered && !!question, letterFor, (label, reply, id) => {
        setTurns(previous => [...previous, { label, reply, id }])
      })
    : null

  useLayoutEffect(() => {
    if (turns.length && chat.current) chat.current.scrollTop = chat.current.scrollHeight
  }, [turns])

  return (
    <>
      {isSheet && <div class="jp-ask-handle" aria-hidden="true" />}
      <header class="jp-ask-header">
        <div class="jp-ask-title-row">
          <span class="jp-ask-badge" aria-hidden="true">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />
            </svg>
          </span>
          <div class="jp-ask-title-copy">
            <h2 id={titleId}>Ask about this question</h2>
            {question && <p>{question.topic}</p>}
          </div>
        </div>
        {onClose && (
          <button
            class="jp-ask-close"
            type="button"
            aria-label={isSheet ? 'Close Ask' : 'Close Ask panel'}
            onClick={onClose}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
        )}
      </header>

      <div class={answered ? 'jp-ask-body jp-ask-body--chat' : 'jp-ask-body'}>
        {!question && <p>Question unavailable.</p>}
        {(question?.figure || options.some((option) => option.figure)) && (
          <details class="jp-ask-figures">
            <summary>Question diagrams</summary>
            {question?.figure && <Figure data={question.figure} />}
            {options.map((option) => option.figure && <div key={option.id}>
              <strong>Option {letterFor(option.id)}</strong>
              <Figure data={option.figure} />
            </div>)}
            <ReadAloudButton questionId={questionId} target="question" options={options} />
          </details>
        )}
        {question && !answered && (
          <p class="jp-ask-hint-note">Saved answers unlock after you answer the question.</p>
        )}
        {question && answered && (
          <>
            <div class="jp-ask-starters">
              <span class="jp-ask-kicker">Suggested questions</span>
              <div class="jp-ask-presets">
                {question.askPresets.map((preset) => {
                  const label = preset.id === 'whynot' && preset.optionId
                    ? `Why not ${letterFor(preset.optionId)}?`
                    : preset.label ?? presetLabels[preset.id]
                  return (
                    <button
                      type="button"
                      key={preset.id}
                      data-active={activePresetId === preset.id ? 'true' : undefined}
                      onClick={() => {
                        logEvent('ask_preset', { questionId, presetId: preset.id })
                        setActivePresetId(preset.id)
                        setTurns((previous) => [...previous, { preset, label }])
                      }}
                    >
                      <span class="jp-ask-chip-dot" aria-hidden="true" />
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>
            <div class="jp-ask-chat" ref={chat} role="log" aria-label={typed ? 'Ask conversation' : 'Saved answers'}>
              {turns.length === 0 && (
                <div class="jp-ask-welcome">
                  <div class="jp-ask-bubble jp-ask-bubble--welcome">
                    <p>{typed
                      ? 'Ask about this question, or tap a suggestion.'
                      : 'Tap a suggested question above for a simpler breakdown, why another option misses, or a quick follow-up.'}</p>
                  </div>
                </div>
              )}
              {turns.map((turn, index) => 'preset' in turn ? (
                <PresetReply key={index} preset={turn.preset} label={turn.label} />
              ) : import.meta.env.DEV ? (
                <div class="jp-ask-turn" key={turn.id}>
                  <p class="jp-ask-prompt">{turn.label}</p>
                  <div class="jp-ask-reply">
                    <div class="jp-ask-bubble">
                      <div class="jp-ask-bubble-head">
                        <span class="jp-ask-tutor-dot" aria-hidden="true" />
                        <span>JP Tutor</span>
                      </div>
                      <p>{turn.reply.ok ? renderFormattedText(turn.reply.answer) : turn.reply.message}</p>
                    </div>
                    {turn.reply.ok && (
                      <>
                        {turn.reply.source !== 'ai' && <small>From saved answers</small>}
                        {turn.reply.source !== 'seed' && <small>Trial answer, may contain mistakes</small>}
                        <ReplyFeedback questionId={questionId} message={turn.label} reply={turn.reply} id={turn.id} />
                      </>
                    )}
                  </div>
                </div>
              ) : null)}
            </div>
          </>
        )}
      </div>

      <footer class="jp-ask-footer">
        {typed && answered && question ? (
          <>
            <form class="jp-ask-composer jp-ask-composer--trial" onSubmit={event => {
              event.preventDefault()
              const history: AskHistory = turns.slice(-2).flatMap(turn => {
                const answer = 'preset' in turn ? turn.preset.answer : turn.reply.ok ? turn.reply.answer : ''
                return answer ? [{ role: 'student', text: turn.label }, { role: 'tutor', text: answer }] : []
              })
              void typed.submit(history)
            }}>
              <input
                type="text"
                aria-label="Ask about this question"
                placeholder="Type your question"
                value={typed.draft}
                onInput={event => typed.setDraft(event.currentTarget.value)}
                enterKeyHint="send"
              />
              <button type="submit" class="jp-ask-send" aria-label="Send question"
                disabled={!typed.draft.trim() || typed.pending}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M5 12h14m-6-6 6 6-6 6" />
                </svg>
              </button>
            </form>
            <p class="jp-ask-quota" role="status">
              {typed.pending ? 'Thinking…' : `${typed.left} of 2 free questions left today`}
            </p>
          </>
        ) : <div class="jp-ask-composer">
          <input
            type="text"
            aria-label={import.meta.env.DEV ? 'Answer the question to try typed Ask' : 'Ask tutor is coming soon'}
            placeholder={import.meta.env.DEV ? 'Answer the question to try typed Ask' : 'Ask tutor is coming soon'}
            disabled
          />
          <button
            type="button"
            class="jp-ask-send"
            aria-label="Send (coming soon)"
            disabled
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M5 12h14m-6-6 6 6-6 6" />
            </svg>
          </button>
        </div>}
      </footer>
    </>
  )
}

export function AskPanel({ onClose, ...props }: AskPanelProps) {
  const titleId = useId()
  return (
    <section class="jp-ask-panel" aria-labelledby={titleId}>
      <AskContent
        key={props.questionId + props.answered}
        {...props}
        onClose={onClose}
        isSheet={false}
        titleId={titleId}
      />
    </section>
  )
}

export function AskSheet({ onClose, ...props }: AskSheetProps) {
  const dialog = useRef<HTMLDialogElement>(null)
  const pointerStartedOnBackdrop = useRef(false)
  const titleId = useId()

  useLayoutEffect(() => {
    const sheet = dialog.current
    if (!sheet) return
    const trigger = document.activeElement
    sheet.showModal()
    sheet.querySelector('button')?.focus()
    return () => {
      sheet.close()
      if (trigger instanceof HTMLElement && trigger.isConnected) trigger.focus()
    }
  }, [])

  useLayoutEffect(() => {
    logEvent('ask_open', { questionId: props.questionId })
  }, [props.questionId])

  return (
    <dialog class="jp-ask-sheet" ref={dialog} aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onPointerDown={(event) => {
        pointerStartedOnBackdrop.current = event.target === event.currentTarget
      }}
      onClick={(event) => {
        if (pointerStartedOnBackdrop.current && event.target === event.currentTarget) onClose()
        pointerStartedOnBackdrop.current = false
      }}>
      <div class="jp-ask-surface">
        <AskContent
          key={props.questionId + props.answered}
          {...props}
          onClose={onClose}
          isSheet={true}
          titleId={titleId}
        />
      </div>
    </dialog>
  )
}
