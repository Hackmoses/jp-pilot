import { useId, useLayoutEffect, useRef, useState } from 'preact/hooks'
import { logEvent } from '../../lib/store'
import './share.css'

const reasons = [
  ['wrong_answer', 'Wrong answer'],
  ['unclear', 'Unclear'],
  ['typo', 'Typo'],
  ['other', 'Other'],
] as const

function ReportForm({ questionId, onClose, onSaved }: {
  questionId: string
  onClose: () => void
  onSaved: () => void
}) {
  const titleId = useId()
  const dialog = useRef<HTMLDialogElement>(null)
  const [reason, setReason] = useState<(typeof reasons)[number][0]>()

  useLayoutEffect(() => {
    const form = dialog.current
    if (!form) return
    form.showModal()
    return () => form.close()
  }, [])

  return (
    <dialog class="jp-report-dialog" ref={dialog} aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}>
      <form onSubmit={(event) => {
        event.preventDefault()
        if (!reason) return
        logEvent('report_tap', { questionId, reason })
        onSaved()
      }}>
        <fieldset>
          <legend id={titleId}>What looks wrong?</legend>
          {reasons.map(([value, label]) => (
            <label key={value}>
              <input type="radio" name="reason" value={value} checked={reason === value}
                onChange={() => setReason(value)} />
              {label}
            </label>
          ))}
        </fieldset>
        <div class="jp-report-actions">
          <button class="jp-wsd-button" type="button" onClick={onClose}>Cancel</button>
          <button class="jp-wsd-button jp-wsd-primary" type="submit" disabled={!reason}>
            Save report
          </button>
        </div>
      </form>
    </dialog>
  )
}

export function ReportButton({ questionId }: { questionId: string }) {
  const [openFor, setOpenFor] = useState<string>()
  const [savedFor, setSavedFor] = useState<string>()
  const trigger = useRef<HTMLButtonElement>(null)

  function close() {
    setOpenFor(undefined)
    // Run after the modal unmounts and its background becomes interactive again.
    requestAnimationFrame(() => trigger.current?.focus())
  }

  return (
    <div class="jp-report-control">
      <button
        class="jp-wsd-button jp-report-trigger"
        ref={trigger}
        type="button"
        aria-label="Report this question"
        onClick={() => {
          setSavedFor(undefined)
          setOpenFor(questionId)
        }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M4 22V4" />
          <path d="M4 4h12l-2 4 2 4H4" />
        </svg>
        <span class="jp-hide-sm">Report this question</span>
      </button>
      {savedFor === questionId && <span class="jp-report-status" role="status">Saved</span>}
      {openFor === questionId && <ReportForm questionId={questionId} onClose={close}
        onSaved={() => {
          setSavedFor(questionId)
          close()
        }} />}
    </div>
  )
}
