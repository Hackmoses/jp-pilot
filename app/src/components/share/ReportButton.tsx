import { useId, useLayoutEffect, useRef, useState } from 'preact/hooks'
import { logEvent } from '../../lib/store'
import './share.css'

const reasons = [
  ['wrong_answer', 'Wrong answer'],
  ['confusing_explanation', 'Confusing explanation'],
  ['typo', 'Typo'],
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
      <button class="jp-wsd-button" ref={trigger} type="button" onClick={() => {
        setSavedFor(undefined)
        setOpenFor(questionId)
      }}>This answer looks wrong</button>
      <span role="status">{savedFor === questionId ? 'Report saved on this device.' : ''}</span>
      {openFor === questionId && <ReportForm questionId={questionId} onClose={close}
        onSaved={() => {
          setSavedFor(questionId)
          close()
        }} />}
    </div>
  )
}
