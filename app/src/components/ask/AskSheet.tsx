import { useId, useLayoutEffect, useRef, useState } from 'preact/hooks'
import { getQuestion } from '../../lib/data'
import { logEvent } from '../../lib/store'
import type { AskPreset, OptionId } from '../../lib/types'
import './ask.css'

type AskProps = {
  questionId: string
  answered: boolean
  letterFor: (optionId: OptionId) => string
}

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
          <p>{preset.answer}</p>
          {preset.id === 'similar' && preset.similarAnswer && (
            <details>
              <summary>
                <span class="jp-ask-show">Show answer</span>
                <span class="jp-ask-hide">Hide answer</span>
              </summary>
              <p>{preset.similarAnswer}</p>
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
  const [turns, setTurns] = useState<{ preset: AskPreset; label: string }[]>([])
  const [activePresetId, setActivePresetId] = useState<AskPreset['id'] | null>(null)
  const chat = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (turns.length && chat.current) chat.current.scrollTop = chat.current.scrollHeight
  }, [turns])

  return (
    <>
      {isSheet && <div class="jp-ask-handle" aria-hidden="true" />}
      <header class="jp-ask-header">
        <div class="jp-ask-title-row">
          {!isSheet && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6d28d9"
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />
            </svg>
          )}
          <div>
            <h2 id={titleId}>Ask about this question</h2>
            {isSheet && question && <p>{question.id} · {question.topic}</p>}
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
        {question && !answered && (
          <div class="jp-ask-hint">
            <p>{question.hint}</p>
            <p>Saved answers unlock after you answer the question.</p>
          </div>
        )}
        {question && answered && (
          <>
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
                    {label}
                  </button>
                )
              })}
            </div>
            <div class="jp-ask-chat" ref={chat} role="log" aria-label="Saved answers">
              {turns.map(({ preset, label }, index) => (
                <PresetReply key={index} preset={preset} label={label} />
              ))}
            </div>
          </>
        )}
      </div>
      {isSheet && (
        <footer class="jp-ask-footer">
          <input type="text" aria-label="Typed questions are coming soon"
            placeholder="Typed questions are coming soon" disabled />
        </footer>
      )}
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
