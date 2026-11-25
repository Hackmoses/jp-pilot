import type { ComponentChildren } from 'preact'
import { useRef, useState } from 'preact/hooks'
import { renderMathText } from '../../lib/mathText'
import type { InteractiveProps } from './TryItCard'

type TryItProps = InteractiveProps & {
  prediction: string
  choices: readonly string[]
  correct: number
  explanation: string
  formulas: readonly string[]
  children: (unlocked: boolean, markInteraction: () => void) => ComponentChildren
}

export function TryIt({ prediction, choices, correct, explanation, formulas, practiceHref, children }: TryItProps) {
  const [picked, setPicked] = useState<number | null>(null)
  const [tried, setTried] = useState(false)
  return (
    <div class="jp-try-body">
      <p class="jp-mode-lead"><strong>Predict.</strong> {prediction}</p>
      <div class="jp-pills" role="group" aria-label="Prediction">
        {choices.map((choice, index) => (
          <button key={choice} type="button" class={`jp-btn ${picked === index ? 'jp-btn--primary' : ''}`}
            aria-pressed={picked === index} disabled={tried && picked !== index}
            onClick={() => { if (!tried) setPicked(index) }}>{choice}</button>
        ))}
      </div>
      {picked === null && <p class="jp-mode-lead">Choose a prediction to unlock the controls.</p>}
      <fieldset class="jp-try-controls" disabled={picked === null} aria-label="Try it controls">
        {children(picked !== null, () => setTried(true))}
      </fieldset>
      {tried && <div class="jp-try-explain">
        <p class="jp-mode-lead" role="status"><strong>Explain.</strong> {picked === correct
          ? 'Your prediction was right.' : `Your prediction was incorrect. The answer is “${choices[correct]}”.`}</p>
        <p class="jp-mode-lead">{explanation}</p>
        <div class="jp-try-formulas">
          {formulas.map((formula) => <span key={formula}>{renderMathText(formula)}</span>)}
        </div>
        <a class="jp-btn jp-btn--primary" href={practiceHref}>Practise this</a>
      </div>}
    </div>
  )
}

export function Slider({ label, value, min, max, step, onChange }: {
  label: string; value: number; min: number; max: number; step: number; onChange: (value: number) => void
}) {
  return (
    <label class="jp-try-slider">
      {label}
      <input type="range" min={min} max={max} step={step} value={value}
        onInput={(event) => onChange(event.currentTarget.valueAsNumber)} />
    </label>
  )
}

// The SVG drag target is paired with a native range for keyboard and assistive technology users.
export function DragHandle({ x, y, onDrag }: { x: number; y: number; onDrag: (fraction: number) => void }) {
  const drag = useRef<{ pointer: number; start: number; x: number; width: number } | null>(null)
  return (
    <span class="jp-try-handle" aria-hidden="true" style={{ left: `${x * 100}%`, top: `${y * 100}%` }}
      onPointerDown={(event) => {
        if (!event.isPrimary || event.button !== 0) return
        const handle = event.currentTarget
        const width = handle.parentElement!.getBoundingClientRect().width
        drag.current = { pointer: event.pointerId, start: event.clientX, x, width }
        handle.setPointerCapture(event.pointerId)
      }}
      onPointerMove={(event) => {
        const active = drag.current
        if (active?.pointer === event.pointerId) onDrag(active.x + (event.clientX - active.start) / active.width)
      }}
      onLostPointerCapture={() => { drag.current = null }} />
  )
}
