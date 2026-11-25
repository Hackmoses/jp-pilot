import type { ComponentChildren } from 'preact'
import { useEffect, useId, useRef, useState } from 'preact/hooks'
import { renderMathText, mathToSpeech } from '../../lib/mathText'
import { cancelSpeech, getActiveSpeechKey, speak, subscribeToSpeechAvailability, subscribeToSpeechState } from '../../lib/speech'
import type { InteractiveProps } from './TryItCard'

type Reason = {
  question: string
  choices: readonly [string, string]
  correct: 0 | 1
}

type Mission = { goal: string; reached: boolean; hint: string }
type TryItProps = InteractiveProps & {
  context: string
  prediction: { question: string; choices: readonly string[]; correct: number; why: string; action: string; observed: boolean }
  missions: readonly [Mission, Mission & { baseline: boolean; reason: Reason }, Mission & { trap: string; answer?: Reason }]
  explain: Reason & { feedback: readonly [string, string] }
  formulas: readonly string[]
  children: (unlocked: boolean) => ComponentChildren
}

export function near(value: number, target: number, tolerance = 0) {
  return Math.abs(value - target) <= tolerance + Number.EPSILON * Math.max(1, Math.abs(target))
}

export function TryIt({ context, prediction, missions, explain, formulas, practiceHref, onComplete, children }: TryItProps) {
  const [picked, setPicked] = useState<number | null>(null)
  const [observed, setObserved] = useState(false)
  const [phase, setPhase] = useState(-1)
  const [compared, setCompared] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [reasonPick, setReasonPick] = useState<number | null>(null)
  const [passed, setPassed] = useState(false)
  const [explainPick, setExplainPick] = useState<number | null>(null)
  const unlocked = picked !== null
  const mission = missions[phase]
  const choice = phase === 1 ? missions[1].reason : phase === 2 ? missions[2].answer : null
  const baseline = missions[1].baseline
  const reached = Boolean(mission?.reached && (phase !== 1 || compared))
  const failure = attempts >= 2 ? mission?.hint
    : reached && reasonPick !== null ? 'Look again at what changed in the model.'
      : 'Try again. Check the controls and your goal.'
  const instruction = !unlocked ? prediction.question : !observed ? prediction.action
    : mission ? (passed ? 'Well done. Mission complete.' : mission.goal + (choice && reached ? ' ' + choice.question : ''))
      : phase === 3 ? explain.question : 'Free play. Change the controls and watch what happens.'

  useEffect(() => {
    if (unlocked && prediction.observed) setObserved(true)
  }, [unlocked, prediction.observed])

  useEffect(() => {
    if (phase === 1 && baseline) setCompared(true)
  }, [phase, baseline])

  function checkMission() {
    if (!mission) return
    if (reached && (!choice || reasonPick === choice.correct)) {
      setPassed(true)
      if (phase === 2) onComplete()
    } else {
      setAttempts(attempts + 1)
    }
  }

  function advance() {
    setPhase(phase + 1)
    setAttempts(0)
    setPassed(false)
    setReasonPick(null)
  }

  return (
    <div class="jp-try-body">
      <p class="jp-mode-lead">{context}</p>
      <div class="jp-try-instruction">
        <div>
          <p class="jp-mode-lead"><strong>Predict.</strong> {renderMathText(prediction.question)}</p>
          <Choices label="Prediction" choices={prediction.choices} picked={picked} onPick={setPicked} locked={unlocked} />
        </div>
        <ReadInstruction text={instruction} />
      </div>
      {!unlocked && <p class="jp-mode-lead">Choose a prediction to unlock the controls.</p>}
      {unlocked && !observed && <p class="jp-mode-lead">{renderMathText(prediction.action)}</p>}
      {observed && <p class="jp-mode-lead" role="status">
        You predicted “{renderMathText(prediction.choices[picked!])}”. It turned out “{renderMathText(prediction.choices[prediction.correct])}”. {prediction.why}
      </p>}
      {mission && <div class="jp-try-mission">
        <p class="jp-mode-lead"><strong>Mission {phase + 1} of 3</strong>
          {' '}<span class="jp-mode-studied" aria-label={phase + Number(passed) + ' missions complete'}>{'✓ '.repeat(phase + Number(passed))}</span>
        </p>
        <p class="jp-mode-lead">{renderMathText(mission.goal)}</p>
      </div>}
      <fieldset class="jp-try-controls" disabled={!unlocked} aria-label="Try it controls">
        {children(unlocked)}
      </fieldset>
      <div class="jp-try-formulas">
        {formulas.map((formula) => <span key={formula}>{renderMathText(formula)}</span>)}
      </div>
      {observed && phase === -1 && <div class="jp-try-explain">
        <p class="jp-mode-lead"><strong>Free play.</strong> Change the controls and watch what happens.</p>
        <button type="button" class="jp-btn" onClick={advance}>Start missions</button>
      </div>}
      {mission && <div class="jp-try-explain">
        {choice && (reached || passed) && <>
          <p class="jp-mode-lead">{renderMathText(choice.question)}</p>
          <Choices label={phase === 1 ? 'Mission reason' : 'Mission answer'} choices={choice.choices} picked={reasonPick} onPick={setReasonPick} locked={passed} />
        </>}
        {passed ? <>
          <p class="jp-mode-studied" role="status">✓ Well done. Mission complete.</p>
          {phase === 2 && <p class="jp-mode-lead"><strong>Common trap.</strong> {missions[2].trap}</p>}
          <button type="button" class="jp-btn" onClick={advance}>{phase === 2 ? 'Explain why' : 'Next mission'}</button>
        </> : <>
          {attempts > 0 && <p class="jp-mode-lead" role="status">{failure}</p>}
          <button type="button" class="jp-btn" onClick={checkMission}
            disabled={Boolean(choice && reached && reasonPick === null)}>Check mission</button>
        </>}
      </div>}
      {phase === 3 && <div class="jp-try-explain">
        <p class="jp-mode-studied">✓ All three missions complete</p>
        <p class="jp-mode-lead"><strong>Explain why.</strong> {renderMathText(explain.question)}</p>
        <Choices label="Explain why" choices={explain.choices} picked={explainPick} onPick={setExplainPick} />
        {explainPick !== null && <>
          <p class="jp-mode-lead" role="status">{renderMathText(explain.feedback[explainPick])}</p>
          <a class="jp-btn jp-btn--primary" href={practiceHref}>Practise this</a>
        </>}
      </div>}
    </div>
  )
}

function Choices({ label, choices, picked, onPick, locked = false }: {
  label: string; choices: readonly string[]; picked: number | null; onPick: (value: number) => void; locked?: boolean
}) {
  return <div class="jp-pills jp-try-choices" role="group" aria-label={label}>
    {choices.map((choice, index) => <button key={choice} type="button"
      class={'jp-btn ' + (picked === index ? 'jp-btn--primary' : '')}
      aria-pressed={picked === index} disabled={locked} onClick={() => onPick(index)}>{renderMathText(choice)}</button>)}
  </div>
}

function ReadInstruction({ text }: { text: string }) {
  const key = useId() + ':' + text
  const [available, setAvailable] = useState(false)
  const [active, setActive] = useState<string | null>(null)
  const speaking = active === key
  useEffect(() => subscribeToSpeechAvailability(setAvailable), [])
  useEffect(() => subscribeToSpeechState(setActive), [])
  useEffect(() => () => { if (getActiveSpeechKey() === key) cancelSpeech() }, [key])
  return <button type="button" class="jp-btn jp-try-speaker" disabled={!available}
    aria-label={speaking ? 'Stop reading' : 'Read instruction aloud'} aria-pressed={speaking}
    onClick={() => speaking ? cancelSpeech() : speak(mathToSpeech(text), key)}>
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <path d="M3 9h4l5-4v14l-5-4H3zM16 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14" />
    </svg>
  </button>
}

export function Values({ items, balanced = false }: { items: Record<string, string>; balanced?: boolean }) {
  const previous = useRef(items)
  const [changed, setChanged] = useState<string[]>([])
  useEffect(() => {
    const next = Object.keys(items).filter((label) => previous.current[label] !== items[label])
    previous.current = items
    if (next.length) setChanged(next)
  }, [items])
  return <div class={'jp-try-values jp-try-readings' + (balanced ? ' jp-try-balanced' : '')}>
    {Object.entries(items).map(([label, value]) => <span key={label}>
      {renderMathText(label)} <strong class={changed.includes(label) ? 'jp-try-changed' : undefined}>{renderMathText(value)}</strong>
    </span>)}
  </div>
}

export function Select({ label, value, options, onChange }: {
  label: string; value: string; options: readonly (readonly [string, string])[]; onChange: (value: string) => void
}) {
  return <label class="jp-try-select">{label}
    <select class="jp-btn" value={value} onChange={(event) => onChange(event.currentTarget.value)}>
      {options.map(([key, text]) => <option key={key} value={key}>{text}</option>)}
    </select>
  </label>
}

export function Scene({ label, children, height = 110 }: { label: string; children: ComponentChildren; height?: number }) {
  return <div class="jp-try-scene">
    <svg viewBox={`0 0 320 ${height}`} role="img" aria-label={label}>{children}</svg>
  </div>
}

export function Slider({ label, value, valueText, min, max, step, onChange }: {
  label: string; value: number; valueText?: string; min: number; max: number; step: number; onChange: (value: number) => void
}) {
  return (
    <label class="jp-try-slider">
      {label}
      <input type="range" min={min} max={max} step={step} value={value} aria-valuetext={valueText}
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
