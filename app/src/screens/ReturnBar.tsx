import { useState } from 'preact/hooks'
import { clearReturnPoint, getReturnPoint } from '../lib/modes'

// Shown on Study pages opened from a question, so the student can go straight back to it.
export function ReturnBar() {
  const [point, setPoint] = useState(getReturnPoint)
  if (!point) return null
  return <div class="jp-return-bar" role="navigation" aria-label="Return">
    <div class="jp-return-bar-inner">
      <a class="jp-btn jp-btn--primary jp-return-bar-link" href={point.href}>‹ {point.label}</a>
      <button type="button" class="jp-link-btn jp-return-bar-dismiss" aria-label="Dismiss" onClick={() => {
        clearReturnPoint()
        setPoint(null)
      }}>Not now</button>
    </div>
  </div>
}
