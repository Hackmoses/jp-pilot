import { useRef, useState } from 'preact/hooks'
import { exportLog } from '../../lib/store'
import './share.css'

export function LogPage() {
  const snapshot = exportLog()
  const text = useRef<HTMLTextAreaElement>(null)
  const [status, setStatus] = useState('')

  async function copy() {
    try {
      await navigator.clipboard.writeText(snapshot)
      setStatus('Log copied.')
    } catch {
      text.current?.focus()
      text.current?.select()
      setStatus('Copy the selected log using your device’s copy command.')
    }
  }

  return (
    <main class="jp-log-page">
      <header class="jp-log-header">
        <a class="jp-logo" href="#/" aria-label="JP home">JP</a>
        <h1>Pilot event log</h1>
      </header>
      <textarea ref={text} aria-label="Pilot event log JSON" readOnly value={snapshot} rows={12} />
      <button class="jp-wsd-button jp-wsd-primary" type="button" onClick={copy}>Copy</button>
      <p role="status">{status}</p>
    </main>
  )
}
