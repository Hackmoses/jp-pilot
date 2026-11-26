import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'preact/hooks'
import { getAnimation } from '../../lib/data'
import { mathToSpeech, renderMathText } from '../../lib/mathText'
import {
  cancelSpeech,
  getActiveSpeechKey,
  speak,
  subscribeToSpeechAvailability,
  subscribeToSpeechState,
} from '../../lib/speech'
import { logEvent } from '../../lib/store'
import type { Animation, AnimationStep } from '../../lib/types'
import { calculationAudio, type NarrationMode } from './calculationAudio'
import {
  CalculationPlayback,
  getInitialNarrationMode,
  getSessionPlaybackPreferences,
  setSessionNarrationMode,
  type PlaybackState,
} from './CalculationPlayback'
import { bindHandwriting } from './handwriting'
import { WritingHand } from './WritingHand'
import './player.css'

export function hasStructuredStepFields(step: AnimationStep): boolean {
  return Boolean(step.title || step.reason || (step.working && step.working.length > 0))
}

export function renderStaticStepRow(step: AnimationStep, isFinal: boolean) {
  if (!hasStructuredStepFields(step)) {
    return (
      <div
        key={step.n}
        class="jp-calc-line-row"
        data-final={isFinal ? 'true' : 'false'}
      >
        <span class="jp-calc-line-text">{renderMathText(step.display)}</span>
        <span class="jp-calc-line-tag">{step.tag}</span>
      </div>
    )
  }

  return (
    <div
      key={step.n}
      class="jp-calc-line-row jp-calc-line-row--step"
      data-final={isFinal ? 'true' : 'false'}
    >
      <span class="jp-step__title">{renderMathText(step.title ?? step.tag)}</span>
      {step.working && step.working.length > 0 && (
        <span class="jp-step__working" role="list">
          {step.working.map((line, i) => (
            <span key={i} class="jp-step__work-item" role="listitem">
              {renderMathText(line)}
            </span>
          ))}
        </span>
      )}
      <span class="jp-step__display-wrap">
        <span class="jp-calc-line-text">{renderMathText(step.display)}</span>
      </span>
      {step.reason && <span class="jp-step__reason">{renderMathText(step.reason)}</span>}
    </div>
  )
}

export function renderAnimatedStepContent(step: AnimationStep) {
  if (!hasStructuredStepFields(step)) {
    return (
      <>
        <span class="jp-player__line">{renderMathText(step.display)}</span>
        <span class="jp-player__tag">{step.tag}</span>
      </>
    )
  }

  return (
    <>
      <span class="jp-step__title">{renderMathText(step.title ?? step.tag)}</span>
      {step.working && step.working.length > 0 && (
        <span class="jp-step__working" role="list">
          {step.working.map((line, i) => (
            <span key={i} class="jp-step__work-item" role="listitem">
              {renderMathText(line)}
            </span>
          ))}
        </span>
      )}
      <span class="jp-step__display-wrap">
        <span class="jp-player__line">{renderMathText(step.display)}</span>
      </span>
      {step.reason && <span class="jp-step__reason">{renderMathText(step.reason)}</span>}
    </>
  )
}

export function swipeDirection(dx: number, dy: number, ms: number) {
  const distance = Math.abs(dx)
  if (distance <= Math.abs(dy) * 1.25 || (distance < 40 && (distance < 18 || distance < ms * 0.45))) return 0
  return dx < 0 ? 1 : -1
}

export interface SolutionPlayerProps {
  animationId: string
  open?: boolean
  onToggleOpen?: () => void
  playSignal?: number
  isCorrect?: boolean
  answerLetter?: string
}

export function SolutionPlayer({
  animationId,
  open,
  onToggleOpen,
  playSignal = 0,
  isCorrect,
  answerLetter,
}: SolutionPlayerProps) {
  const animation = getAnimation(animationId)
  return animation ? (
    <Player
      key={animation.id}
      animation={animation}
      controlledOpen={open}
      onToggleOpen={onToggleOpen}
      playSignal={playSignal}
      isCorrect={isCorrect}
      answerLetter={answerLetter}
    />
  ) : null
}

function Player({
  animation,
  controlledOpen,
  onToggleOpen,
  playSignal,
  isCorrect,
  answerLetter,
}: {
  animation: Animation
  controlledOpen?: boolean
  onToggleOpen?: () => void
  playSignal: number
  isCorrect?: boolean
  answerLetter?: string
}) {
  const { id, questionId, stepSeconds } = animation
  const isConcept = animation.kind === 'concept'
  const hasTeach = !isConcept && Boolean(animation.teach && animation.teach.length > 0)
  const [mode, setMode] = useState<NarrationMode>(() => getInitialNarrationMode(hasTeach, isCorrect))
  // Size the paper against both modes, and map answer letters to the shuffled choices.
  const tracks = useMemo(() => (['quick', ...(hasTeach ? ['teach'] : [])] as NarrationMode[]).map((kind) => ({
    kind,
    recorded: calculationAudio(id, kind),
    steps: (kind === 'teach' && animation.teach ? animation.teach : animation.steps).map((step) => {
      if (!answerLetter) return step
      const display = step.display.replace(/ \(option [A-D]\)$/, ' (option ' + answerLetter + ')')
      return display === step.display ? step : { ...step, display }
    }),
  })), [animation, answerLetter, hasTeach, id])
  const { steps, recorded } = tracks[mode === 'teach' ? 1 : 0]
  const toggleTitle = isConcept ? 'Teach me' : 'See the calculation'
  const toggleSubtitle = isConcept ? `${steps.length} steps, explained simply` : `${steps.length} steps, written out by hand`
  const toggleIcon = isConcept ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round">
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M12 2a7 7 0 0 0-4 12.7V16h8v-1.3A7 7 0 0 0 12 2z" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
    </svg>
  )
  const duration = stepSeconds * 1000
  const bodyId = useId()
  const modalRef = useRef<HTMLDialogElement>(null)
  const expandBtnRef = useRef<HTMLButtonElement>(null)
  const pointerStartedOnBackdrop = useRef(false)
  const [internalOpen, setInternalOpen] = useState(false)
  const isOpen = controlledOpen ?? internalOpen
  const [expanded, setExpanded] = useState(false)
  const [revision, setRevision] = useState(false)
  const gesture = useRef<{ x: number; y: number; time: number; pointer: number } | null>(null)
  const [speechAvailable, setSpeechAvailable] = useState(false)
  const [activeKey, setActiveKey] = useState<string | null>(getActiveSpeechKey)
  const paperRef = useRef<HTMLDivElement>(null)
  const penRef = useRef<SVGSVGElement>(null)
  const handwriting = useRef<ReturnType<typeof bindHandwriting> | null>(null)
  const hasRecorded = Boolean(recorded)
  const boundStep = useRef(-1)
  const [audioState, setAudioState] = useState<PlaybackState & { from: number; slidePaused: boolean }>(() => ({
    from: -1,
    slidePaused: false,
    index: -1,
    playing: false,
    ...getSessionPlaybackPreferences(),
  }))
  const [playback] = useState(() => new CalculationPlayback(
    steps.map((step) => recorded?.clips.get(step.n)),
    duration * (mode === 'teach' && !recorded ? 1.25 : 1),
    (state) => setAudioState((previous) => state.index === previous.index
      ? { ...state, from: previous.from, slidePaused: state.playing ? false : previous.playing || previous.slidePaused }
      : { ...state, from: Math.max(0, previous.index), slidePaused: false }),
    (progress, step) => {
      if (step === boundStep.current) handwriting.current?.paint(progress)
    },
  ))
  const { index, playing, from, slidePaused } = audioState
  const position = Math.max(0, index)
  const complete = position === steps.length
  const current = steps[position]
  const announcement = complete
    ? ['Solution complete', steps[steps.length - 1].display]
    : current && [current.title ?? current.tag, ...(current.working ?? []), current.display,
      current.reason ?? recorded?.captions?.[position] ?? current.narration]
  const speechKey = `player:${id}`
  const speaking = activeKey === speechKey

  useEffect(() => {
    if (
      !(isOpen || expanded) ||
      document.getElementById('jp-caveat-font') ||
      document.querySelector('link[href*="Caveat"]')
    ) {
      return
    }

    const font = document.createElement('link')
    font.id = 'jp-caveat-font'
    font.rel = 'stylesheet'
    font.href = 'https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&display=swap'
    document.head.append(font)
  }, [isOpen, expanded])

  useLayoutEffect(() => {
    const dialog = modalRef.current
    if (!expanded || !dialog) return
    dialog.showModal()
    return () => {
      if (dialog.open) dialog.close()
      requestAnimationFrame(() => expandBtnRef.current?.focus())
    }
  }, [expanded])

  useEffect(() => hasRecorded ? undefined : subscribeToSpeechAvailability(setSpeechAvailable), [hasRecorded])
  useEffect(() => hasRecorded ? undefined : subscribeToSpeechState(setActiveKey), [hasRecorded])
  useEffect(
    () => () => {
      if (getActiveSpeechKey() === speechKey) cancelSpeech()
    },
    [speechKey],
  )

  useEffect(() => () => playback.dispose(), [playback])
  useLayoutEffect(() => {
    if (!isOpen && !expanded) playback.pause()
  }, [expanded, isOpen, playback])
  useLayoutEffect(() => {
    const row = paperRef.current?.querySelector<HTMLElement>('[data-current="true"]')
    const pen = penRef.current
    const line = row?.querySelector<HTMLElement>('.jp-player__line')
    if (!row || !pen || !line || (!isOpen && !expanded)) return
    boundStep.current = index
    const binding = bindHandwriting(row, line, pen)
    handwriting.current = binding
    binding.paint(playback.progress)
    return () => {
      binding.dispose()
      handwriting.current = null
    }
  }, [expanded, index, isOpen, mode, playback])

  useEffect(() => {
    if (playSignal <= 0) return
    setRevision(false)
    playback.start()
    logEvent('player_play', { animationId: id, questionId })
  }, [playSignal, id, questionId, playback])

  function handleToggleOpen() {
    if (isOpen) playback.pause()
    if (onToggleOpen) {
      onToggleOpen()
    } else {
      setInternalOpen((prev) => !prev)
    }
  }

  function startAnimatedFromStepOne() {
    setRevision(false)
    logEvent('player_play', { animationId: id, questionId })
    playback.start()
  }

  function jump(target: number) {
    if (target >= 0 && target < steps.length) {
      setRevision(false)
      playback.start(target, false, playing)
    }
  }

  function togglePlay() {
    if (complete) setRevision(false)
    if (!playing) logEvent('player_play', { animationId: id, questionId })
    playback.toggle()
  }

  function replayStep(position: number) {
    const step = steps[position]
    if (!step) return
    logEvent('player_replay_step', { animationId: id, questionId, step: step.n })
    playback.start(position, true)
  }

  function readSteps() {
    if (speaking) {
      cancelSpeech()
      return
    }
    const narration = mathToSpeech(steps.map((step) => step.narration).join(' '))
    if (speak(narration, speechKey)) logEvent('read_aloud', { animationId: id, questionId })
  }

  function switchMode(nextMode: NarrationMode) {
    if (!hasTeach || nextMode === mode) return
    setSessionNarrationMode(nextMode)
    setMode(nextMode)
    const { steps: nextSteps, recorded: nextAudio } = tracks[nextMode === 'teach' ? 1 : 0]
    if (getActiveSpeechKey() === speechKey) cancelSpeech()
    setRevision(false)
    playback.setClips(
      nextSteps.map((step) => nextAudio?.clips.get(step.n)),
      true,
      duration * (nextMode === 'teach' && !nextAudio ? 1.25 : 1),
    )
    logEvent('player_play', { animationId: id, questionId, mode: nextMode })
  }

  const modeSwitch = hasTeach && (
    <div class="jp-player__modes" role="group" aria-label="Narration style">
      <button
        type="button"
        class="jp-player__mode-btn"
        aria-pressed={mode === 'quick'}
        onClick={() => switchMode('quick')}
      >
        Quick
      </button>
      <button
        type="button"
        class="jp-player__mode-btn"
        aria-pressed={mode === 'teach'}
        onClick={() => switchMode('teach')}
      >
        Teach me
      </button>
    </div>
  )

  const speaker = hasRecorded && (
    <button
      type="button"
      class="jp-player__speaker"
      aria-label={isConcept ? 'Lesson narration' : 'Calculation narration'}
      aria-pressed={audioState.sound}
      title={audioState.sound ? 'Turn narration off' : 'Turn narration on'}
      onClick={() => playback.setSound(!audioState.sound)}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M11 5 6 9H2v6h4l5 4z" />
        {audioState.sound
          ? <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
          : <path d="m16 9 6 6m0-6-6 6" />}
      </svg>
    </button>
  )

  const speedControl = (
    <select
      class="jp-player__speed"
      aria-label="Playback speed"
      value={audioState.speed}
      onChange={(event) => playback.setSpeed(Number(event.currentTarget.value))}
    >
      <option value={0.75}>0.75×</option>
      <option value={1}>1×</option>
      <option value={1.25}>1.25×</option>
    </select>
  )

  const calculationBody = (
    <div class="jp-player" onKeyDown={(event) => {
      if (event.target instanceof HTMLSelectElement || event.altKey || event.ctrlKey || event.metaKey) return
      const direction = event.key === 'ArrowLeft' ? -1 : event.key === 'ArrowRight' ? 1 : 0
      if (!direction) return
      event.preventDefault()
      event.stopPropagation()
      jump(position + direction)
    }}>
      <div
        class="jp-calc-paper jp-player__paper"
        ref={paperRef}
        tabIndex={0}
        role="group"
        aria-label="Worked solution"
        data-backward={from > position}
        data-paused={slidePaused}
        onPointerDown={(event) => {
          if (!event.isPrimary || event.button !== 0 || (event.target as Element).closest('button')) return
          gesture.current = { x: event.clientX, y: event.clientY, time: event.timeStamp, pointer: event.pointerId }
          event.currentTarget.setPointerCapture(event.pointerId)
        }}
        onPointerCancel={() => { gesture.current = null }}
        onPointerUp={(event) => {
          const start = gesture.current
          if (!start || start.pointer !== event.pointerId) return
          gesture.current = null
          const direction = swipeDirection(event.clientX - start.x, event.clientY - start.y, event.timeStamp - start.time)
          if (direction) jump(position + direction)
        }}
      >
        {tracks.flatMap((track) => track.steps.map((step, stepIndex) => {
          const selected = track.kind === mode
          const active = selected && position === stepIndex
          const slide = selected && from >= 0 && from !== position
            ? active ? 'in' : from === stepIndex ? 'out' : undefined
            : undefined
          return (
            <div
              key={track.kind + step.n}
              class="jp-player__row jp-player__row--step"
              data-current={active}
              data-slide={slide}
              data-final={stepIndex === track.steps.length - 1}
              aria-hidden={!active}
              inert={!active}
            >
              <span class="jp-player__context">{stepIndex > 0 && renderMathText(track.steps[stepIndex - 1].display)}</span>
              {renderAnimatedStepContent(step)}
              {!step.reason && <p class="jp-player__caption">{track.recorded?.captions?.[stepIndex] ?? step.narration}</p>}
              {active && index >= 0 && (
                <WritingHand penRef={penRef} class="jp-player__pen" />
              )}
            </div>
          )
        }))}
        {complete && (
          <section class="jp-player__summary" data-slide="in" aria-label="Solution summary">
            <strong>Solution summary</strong>
            <div class="jp-player__summary-list" tabIndex={0} aria-label={revision ? 'All steps' : 'Working'}>
              {revision ? steps.map((step, i) => renderStaticStepRow(step, i === steps.length - 1))
                : steps.slice(0, -1).map((step) => <div key={step.n}>{renderMathText(step.display)}</div>)}
            </div>
            {!revision && <strong class="jp-player__answer">{renderMathText(steps[steps.length - 1].display)}</strong>}
            <div class="jp-player__summary-actions">
              <button class="jp-btn" type="button" onClick={() => {
                paperRef.current?.focus({ preventScroll: true })
                startAnimatedFromStepOne()
              }}>Replay</button>
              <button class="jp-btn" type="button" aria-expanded={revision} onClick={() => setRevision(!revision)}>
                {revision ? 'Hide all steps' : 'Show all steps'}
              </button>
            </div>
          </section>
        )}
      </div>

      <p class="jp-player__announcement" aria-live="polite" aria-atomic="true">
        {announcement?.map(mathToSpeech).join('. ')}
      </p>
      <div class="jp-player__header">
        <span>Step {Math.min(position + 1, steps.length)} of {steps.length}</span>
        <div class="jp-player__progress" role="group" aria-label="Jump to step">
          {steps.map((step, i) => (
            <button key={step.n} type="button" aria-label={'Go to step ' + (i + 1)}
              aria-current={current && position === i ? 'step' : undefined} onClick={() => jump(i)} />
          ))}
        </div>
      </div>
      <div class="jp-player__controls">
        <button type="button" class="jp-player__play" onClick={togglePlay} aria-label={playing ? 'Pause' : 'Play'}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            {playing
              ? <path d="M6 5h4v14H6zm8 0h4v14h-4z" />
              : <path d="M7 4.5v15l13-7.5z" />}
          </svg>
        </button>
        <button type="button" class="jp-player__replay" onClick={() => hasRecorded ? playback.rewind(3) : replayStep(index)} disabled={index < 0 || !current} aria-label={hasRecorded ? 'Back 3 seconds' : 'Replay this step'} title={hasRecorded ? 'Back 3 seconds' : 'Replay this step'}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5" />
          </svg>
        </button>
        {[-1, 1].map((direction) => {
          const target = position + direction
          const label = direction < 0 ? 'Previous step' : 'Next step'
          return (
            <button key={direction} type="button" class="jp-btn jp-player__replay" aria-label={label} title={label}
              disabled={target < 0 || target >= steps.length}
              onClick={() => jump(target)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d={direction < 0 ? 'm15 5-7 7 7 7' : 'm9 5 7 7-7 7'} />
              </svg>
            </button>
          )
        })}
        {speaker}
        {speedControl}
        {modeSwitch}
        {!hasRecorded && speechAvailable && (
          <button type="button" class="jp-player__voice" aria-pressed={speaking} onClick={readSteps}>
            {speaking ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M11 5 6 9H2v6h4l5 4V5zM15.5 8.5a5 5 0 0 1 0 7" />
              </svg>
            )}
            {speaking ? 'Stop reading' : 'Read the steps aloud'}
          </button>
        )}
      </div>
    </div>
  )

  return (
    <section class="jp-calc-card" aria-label={toggleTitle}>
      <div class="jp-calc-head">
        <button
          type="button"
          class="jp-calc-toggle"
          aria-expanded={isOpen}
          aria-controls={bodyId}
          onClick={handleToggleOpen}
        >
          <span class="jp-calc-icon" aria-hidden="true">
            {toggleIcon}
          </span>
          <span class="jp-calc-copy">
            <span class="jp-calc-title">{toggleTitle}</span>
            <span class="jp-calc-sub">{toggleSubtitle}</span>
          </span>
          <span class="jp-calc-chev" data-open={isOpen ? 'true' : 'false'} aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </span>
        </button>
        <button
          ref={expandBtnRef}
          type="button"
          class="jp-calc-expand-btn"
          aria-label={isConcept ? 'Expand lesson' : 'Expand calculation'}
          title={isConcept ? 'Expand lesson' : 'Expand calculation'}
          onClick={() => setExpanded(true)}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
          </svg>
        </button>
      </div>

      <div id={bodyId} hidden={!isOpen || expanded}>
        {!expanded && calculationBody}
      </div>

      {expanded && (
        <dialog
          class="jp-calc-modal"
          ref={modalRef}
          aria-label={isConcept ? 'Expanded lesson' : 'Expanded calculation'}
          onCancel={(event) => {
            event.preventDefault()
            setExpanded(false)
          }}
          onPointerDown={(event) => {
            pointerStartedOnBackdrop.current = event.target === event.currentTarget
          }}
          onClick={(event) => {
            if (pointerStartedOnBackdrop.current && event.target === event.currentTarget) {
              setExpanded(false)
            }
            pointerStartedOnBackdrop.current = false
          }}
        >
          <div class="jp-calc-modal-surface">
            <header class="jp-calc-modal-head">
              <span class="jp-calc-icon" aria-hidden="true">
                {toggleIcon}
              </span>
              <div class="jp-calc-copy">
                <span class="jp-calc-title">{toggleTitle}</span>
                <span class="jp-calc-sub">{toggleSubtitle}</span>
              </div>
              <button
                type="button"
                class="jp-calc-modal-close"
                aria-label={isConcept ? 'Close expanded lesson' : 'Close expanded calculation'}
                title="Close"
                onClick={() => setExpanded(false)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="m6 6 12 12M18 6 6 18" />
                </svg>
              </button>
            </header>
            <div class="jp-calc-modal-body">
              {calculationBody}
            </div>
          </div>
        </dialog>
      )}
    </section>
  )
}
