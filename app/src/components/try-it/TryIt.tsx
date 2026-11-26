import type { ComponentChildren } from 'preact'
import { useEffect, useId, useLayoutEffect, useRef, useState } from 'preact/hooks'
import { renderMathText, mathToSpeech } from '../../lib/mathText'
import { cancelSpeech, getActiveSpeechKey, speak, subscribeToSpeechAvailability, subscribeToSpeechState } from '../../lib/speech'
import { mountMotion, pulse } from './motion'
import './motion.css'
import type { InteractiveProps } from './TryItCard'

type Reason = {
  question: string
  choices: readonly [string, string]
  correct: 0 | 1
}

type Mission = { goal: string; reached: boolean; hint: string }
type TryItProps = InteractiveProps & {
  // One line: what the student will find out by doing this practical.
  aim: string
  context: string
  prediction: { question: string; choices: readonly string[]; correct: number; why: string; action: string; observed: boolean }
  missions: readonly [Mission, Mission & { baseline: boolean; reason: Reason }, Mission & { trap: string; answer?: Reason }]
  explain: { question: string; choices: readonly string[]; correct: number; feedback: readonly string[] }
  mode?: 'simulation' | 'exercise'
  formulas: readonly string[]
  children: (unlocked: boolean, challenge: number) => ComponentChildren
}

export function near(value: number, target: number, tolerance = 0) {
  return Math.abs(value - target) <= tolerance + Number.EPSILON * Math.max(1, Math.abs(target))
}

export function TryIt({ aim, context, prediction, missions, explain, formulas, practiceHref, onComplete, onRestart, mode = 'simulation', children }: TryItProps) {
  const simulation = mode === 'simulation'
  const body = useRef<HTMLDivElement>(null)
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

  // One clear next action, always in the same place, and the part of the screen it points at.
  const explained = explainPick !== null && (simulation || explainPick === explain.correct)
  const step = !unlocked ? 0 : !observed ? 1 : phase < 3 ? 2 : 3
  const now: { label: string; text: string; target: 'choices' | 'controls' | 'button' | 'reason' | 'explain' | null } =
    !unlocked ? { label: 'Step 1 · Predict', text: 'Pick what you think will happen. Being wrong is fine, that is how you learn.', target: 'choices' }
      : !observed ? { label: 'Step 2 · Watch', text: prediction.action, target: 'controls' }
        : phase === -1 ? { label: 'Step 2 · Explore', text: 'Try the controls freely and watch what changes. When you are ready, press Start missions.', target: 'button' }
          : mission && passed ? { label: `Mission ${phase + 1} of 3 · Done`, text: phase === 2 ? 'All three missions done. Press Explain why to finish.' : 'Well done. Press Next mission.', target: 'button' }
            : mission ? {
              label: `Step 3 · Mission ${phase + 1} of 3`,
              text: mission.goal + (!reached ? '' : choice && reasonPick === null ? ' Now answer the question below.' : ' Now press Check mission.'),
              target: !reached ? 'controls' : choice && reasonPick === null ? 'reason' : 'button',
            }
              : explainPick === null || !simulation && explainPick !== explain.correct ? { label: 'Step 4 · Explain', text: 'Choose the reason that explains what you saw.', target: 'explain' }
                : { label: 'Finished', text: 'You have done this practical. Practise the topic, or try it again to see it once more.', target: null }

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
      body.current?.querySelectorAll<HTMLElement>('.jp-try-values').forEach((reading) => pulse(reading, 'confirmed'))
      if (phase === 2 && simulation) onComplete()
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
    <div ref={body} class="jp-try-body" data-attention={now.target ?? undefined}>
      <p class="jp-try-aim"><span class="jp-try-kicker">Your goal</span> {renderMathText(aim)}</p>
      <ol class="jp-try-steps" aria-label="Steps">
        {['Predict', 'Watch', 'Missions', 'Explain'].map((name, index) => <li key={name}
          data-state={index < step || (index === 3 && explained) ? 'done' : index === step ? 'now' : 'next'}
          aria-current={index === step ? 'step' : undefined}>
          {name}{index === 2 && phase >= 0 && phase < 3 ? ` ${Math.min(phase + Number(passed), 3)}/3` : ''}
        </li>)}
      </ol>
      <p class="jp-try-context">{context}</p>
      <details class="jp-try-guide">
        <summary>ⓘ How to use this</summary>
        <ul>
          <li><strong>Predict</strong> first. The controls unlock after you choose.</li>
          {simulation && <><li><strong>Pause / Play</strong> stops or starts the animation.</li>
          <li><strong>0.25×</strong> plays it in slow motion.</li>
          <li><strong>Step</strong> moves one small step at a time.</li>
          <li><strong>Replay</strong> runs the animation again from the start.</li>
          <li><strong>ⓘ</strong> beside a control explains what it changes.</li></>}
          <li><strong>Restart</strong> at the top clears everything so you can try again.</li>
        </ul>
      </details>
      <div class="jp-try-predict">
        <div class="jp-try-instruction">
          <div>
            <span class="jp-try-kicker">Predict</span>
            <p class="jp-try-question">{renderMathText(prediction.question)}</p>
            <Choices label="Prediction" choices={prediction.choices} picked={picked} onPick={setPicked} locked={unlocked} />
          </div>
        </div>
        {observed && <p class={'jp-try-outcome ' + (picked === prediction.correct ? 'jp-try-outcome--good' : 'jp-try-outcome--info')} role="status">
          You predicted “{renderMathText(prediction.choices[picked!])}”. It turned out “{renderMathText(prediction.choices[prediction.correct])}”. {prediction.why}
        </p>}
      </div>
      <div class="jp-try-now" role="status" aria-live="polite">
        <div>
          <span class="jp-try-kicker">{now.label}</span>
          <p class="jp-try-now-text">{renderMathText(now.text)}</p>
        </div>
        <ReadInstruction text={now.text || instruction} />
      </div>
      {simulation ? <Playback unlocked={unlocked}>{children(unlocked, 0)}</Playback>
        : <fieldset class="jp-try-word-controls" disabled={!unlocked}>{children(unlocked, Math.min(phase + 1, 3))}</fieldset>}
      {formulas.length > 0 && <div class="jp-try-formulas-box">
        <span class="jp-try-formulas-label">Key formulas</span>
        <div class="jp-try-formulas">
          {formulas.map((formula) => <span key={formula}>{renderMathText(formula)}</span>)}
        </div>
      </div>}
      {observed && phase === -1 && <div class="jp-try-explain">
        <p class="jp-try-text"><strong>Free play.</strong> Change the controls and watch what happens.</p>
        <button type="button" class="jp-btn jp-btn--primary" onClick={advance}>Start missions</button>
      </div>}
      {mission && <div class="jp-try-explain">
        {choice && (reached || passed) && <>
          <p class="jp-try-question">{renderMathText(choice.question)}</p>
          <Choices label={phase === 1 ? 'Mission reason' : 'Mission answer'} choices={choice.choices} picked={reasonPick} onPick={setReasonPick} locked={passed} />
        </>}
        {passed ? <>
          <p class="jp-mode-studied" role="status"><span class="jp-try-tick">✓</span> Well done. Mission complete.</p>
          {phase === 2 && <p class="jp-try-trap"><strong>Common trap.</strong> {missions[2].trap}</p>}
          <button type="button" class="jp-btn jp-btn--primary" onClick={advance}>{phase === 2 ? 'Explain why' : 'Next mission'}</button>
        </> : <>
          {attempts > 0 && <p class="jp-try-hint" role="status">{failure}</p>}
          <button type="button" class="jp-btn jp-btn--primary" onClick={checkMission}
            disabled={Boolean(choice && reached && reasonPick === null)}>Check mission</button>
        </>}
      </div>}
      {phase === 3 && <div class="jp-try-explain jp-try-explain--final">
        <p class="jp-mode-studied">✓ All three missions complete</p>
        <span class="jp-try-kicker">Explain why</span>
        <p class="jp-try-question">{renderMathText(explain.question)}</p>
        <Choices label="Explain why" choices={explain.choices} picked={explainPick} onPick={(choice) => {
          setExplainPick(choice)
          if (!simulation && choice === explain.correct && !explained) onComplete()
        }} />
        {explainPick !== null && <>
          <p class="jp-try-outcome jp-try-outcome--info" role="status">{renderMathText(explain.feedback[explainPick])}</p>
          {explained && <div class="jp-pills">
            <a class="jp-btn jp-btn--primary" href={practiceHref}>Practise this</a>
            {onRestart && <button type="button" class="jp-btn" onClick={onRestart}>Try it again</button>}
          </div>}
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

function Playback({ children, unlocked }: { children: ComponentChildren; unlocked: boolean }) {
  const root = useRef<HTMLDivElement>(null)
  const motion = useRef<ReturnType<typeof mountMotion> | null>(null)
  const [playing, setPlaying] = useState(true)
  const [slow, setSlow] = useState(false)
  function play(value: boolean) {
    motion.current?.play(value)
    setPlaying(value)
  }
  useLayoutEffect(() => {
    const node = root.current!
    const controller = mountMotion(node)
    motion.current = controller
    const start = () => play(true)
    node.addEventListener('try-play', start)
    return () => {
      controller.stop()
      node.removeEventListener('try-play', start)
    }
  }, [])
  function cause(event: Event) {
    const target = event.target as HTMLElement
    const control = target.closest<HTMLElement>('button, input, select, [data-try-handle]')
    if (control && (event.type !== 'click' || control.matches('button'))) {
      pulse(control.closest('label') ?? control, 'cause')
    }
  }
  return <div class="jp-try-motion" ref={root}>
    <div class="jp-pills jp-try-playback-bar" role="group" aria-label="Animation controls">
      <button type="button" class="jp-btn" data-continuous onClick={() => play(!playing)}>{playing ? 'Pause' : 'Play'}</button>
      <button type="button" class="jp-btn" data-continuous aria-label="Slow motion 0.25 times" aria-pressed={slow}
        onClick={() => { motion.current?.rate(slow ? 1 : 0.25); setSlow(!slow) }}>0.25×</button>
      <button type="button" class="jp-btn" aria-label="Step forward" onClick={() => { play(false); motion.current?.step() }}>Step</button>
      <button type="button" class="jp-btn" onClick={() => { motion.current?.replay(); play(true) }}>Replay</button>
    </div>
    <fieldset class="jp-try-controls" disabled={!unlocked} aria-label="Try it controls"
      onInputCapture={cause} onChangeCapture={cause} onClickCapture={cause}>
      {children}
    </fieldset>
  </div>
}

function Reading({ value, live }: { value: string; live: boolean }) {
  const initial = useRef(value)
  const previous = useRef(value)
  const node = useRef<HTMLElement>(null)
  const canCount = !live && /[0-9]/.test(value) && !/[{}]/.test(value)
  useLayoutEffect(() => {
    if (!live && previous.current !== value) {
      node.current?.classList.add('jp-try-changed')
      pulse(node.current!, 'effect')
    }
    previous.current = value
  }, [value, live])
  return <strong ref={node} onAnimationEnd={(event) => event.currentTarget.classList.remove('jp-try-changed')}>
    {canCount ? <><span class="jp-try-spoken">{value}</span><span aria-hidden="true" {...ease({ '#': value })}>{initial.current}</span></>
      : renderMathText(value)}
  </strong>
}

export function Values({ items, balanced = false, live = false }: { items: Record<string, string>; balanced?: boolean; live?: boolean }) {
  return <div class={'jp-try-values jp-try-readings' + (balanced ? ' jp-try-balanced' : '')}>
    {Object.entries(items).map(([label, value]) => <span key={label}>
      {renderMathText(label)} <Reading value={value} live={live} />
    </span>)}
  </div>
}

export function ease(attrs: Record<string, number | string>) {
  return { 'data-ease': JSON.stringify(Object.fromEntries(Object.entries(attrs).map(([key, value]) => [key, String(value)]))) }
}

export function Travel({ points, seconds, offset = 0, children }: {
  points: readonly number[]; seconds: number; offset?: number; children: ComponentChildren
}) {
  return <g data-flow={[seconds, offset, ...points].join(',')} transform={`translate(${points[0]} ${points[1]})`} aria-hidden="true">{children}</g>
}

export function Trace({ x, y, series = '', labels }: {
  x: number; y: number; series?: string; labels: readonly [string, string]
}) {
  const history = useRef({ series, points: [[x, y]] })
  if (history.current.series !== series) history.current = { series, points: [[x, y]] }
  const points = history.current.points
  const [lastX, lastY] = points[points.length - 1]
  if (x !== lastX || y !== lastY) {
    points.push([x, y])
    if (points.length > 32) points.shift()
  }
  return <Scene height={100} label={labels[1] + ' plotted against ' + labels[0]}>
    <path d="M31 10v62h268" fill="none" stroke="var(--option-line)" />
    <polyline points={points.map(([px, py]) => [31 + 260 * px, 72 - 58 * py].join(',')).join(' ')}
      fill="none" stroke="var(--brand)" stroke-width="2" />
    {points.map(([px, py], i) => <circle key={i} cx={31 + 260 * px} cy={72 - 58 * py} r="2" fill="var(--brand)" />)}
    <circle cx={31 + 260 * x} cy={72 - 58 * y} {...ease({ cx: 31 + 260 * x, cy: 72 - 58 * y })} r="4" fill="var(--memo)" />
    <text x="38" y="13">{labels[1]}</text><text x="295" y="91" text-anchor="end">{labels[0]}</text>
  </Scene>
}

export function Select({ label, value, options, onChange, info }: {
  label: string; value: string; options: readonly (readonly [string, string])[]; onChange: (value: string) => void; info?: string
}) {
  return <label class="jp-try-select"><span class="jp-try-label-row">{label}{info && <Tip label={label} text={info} />}</span>
    <select class="jp-btn" value={value} onChange={(event) => onChange(event.currentTarget.value)}>
      {options.map(([key, text]) => <option key={key} value={key}>{text}</option>)}
    </select>
  </label>
}

// A details toggle keeps working while the controls are locked, so students can read tips before predicting.
function Tip({ label, text }: { label: string; text: string }) {
  return <details class="jp-try-tip">
    <summary aria-label={'What is ' + label.split(' · ')[0] + '?'}>ⓘ</summary>
    <span>{text}</span>
  </details>
}

export function Scene({ label, children, height = 110 }: { label: string; children: ComponentChildren; height?: number }) {
  return <div class="jp-try-scene">
    <svg viewBox={`0 0 320 ${height}`} role="img" aria-label={label}>{children}</svg>
  </div>
}

export function Slider({ label, value, valueText, min, max, step, onChange, info }: {
  label: string; value: number; valueText?: string; min: number; max: number; step: number; onChange: (value: number) => void; info?: string
}) {
  return (
    <label class="jp-try-slider">
      <span class="jp-try-label-row">{label}{info && <Tip label={label} text={info} />}</span>
      <input type="range" min={min} max={max} step={step} value={value} aria-valuetext={valueText}
        onInput={(event) => onChange(event.currentTarget.valueAsNumber)} />
    </label>
  )
}

// The SVG drag target is paired with a native range for keyboard and assistive technology users.
export function DragHandle({ x, y, onDrag }: { x: number; y: number; onDrag: (fraction: number) => void }) {
  const drag = useRef<{ pointer: number; start: number; x: number; width: number } | null>(null)
  return (
    <span class="jp-try-handle" data-try-handle aria-hidden="true" style={{ left: `${x * 100}%`, top: `${y * 100}%` }}
      onPointerDown={(event) => {
        if (!event.isPrimary || event.button !== 0) return
        const handle = event.currentTarget
        const width = handle.parentElement!.getBoundingClientRect().width
        drag.current = { pointer: event.pointerId, start: event.clientX, x, width }
        handle.setPointerCapture(event.pointerId)
      }}
      onPointerMove={(event) => {
        const active = drag.current
        if (active?.pointer === event.pointerId) {
          pulse(event.currentTarget, 'cause')
          onDrag(active.x + (event.clientX - active.start) / active.width)
        }
      }}
      onLostPointerCapture={() => { drag.current = null }} />
  )
}
