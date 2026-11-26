import { useEffect, useId, useLayoutEffect, useRef, useState } from 'preact/hooks'
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
  const trackSteps = mode === 'teach' && animation.teach ? animation.teach : animation.steps
  // The question can shuffle choices. Keep the written option letter in the student's order.
  const steps = answerLetter
    ? trackSteps.map((step) => {
      const display = step.display.replace(/ \(option [A-D]\)$/, ' (option ' + answerLetter + ')')
      return display === step.display ? step : { ...step, display }
    })
    : trackSteps
  const hasStructuredSteps = steps.some(hasStructuredStepFields)
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
  const [animatedMode, setAnimatedMode] = useState(false)
  const [speechAvailable, setSpeechAvailable] = useState(false)
  const [activeKey, setActiveKey] = useState<string | null>(getActiveSpeechKey)
  const paperRef = useRef<HTMLDivElement>(null)
  const penRef = useRef<SVGSVGElement>(null)
  const handwriting = useRef<ReturnType<typeof bindHandwriting> | null>(null)
  const recorded = calculationAudio(id, mode)
  const hasRecorded = Boolean(recorded)
  const boundStep = useRef({ index: -1, mode, paper: null as HTMLDivElement | null })
  const [audioState, setAudioState] = useState<PlaybackState>(() => ({
    index: -1,
    playing: false,
    ...getSessionPlaybackPreferences(),
  }))
  const [playback] = useState(() => new CalculationPlayback(
    steps.map((step) => recorded?.clips.get(step.n)),
    duration * (mode === 'teach' && !recorded ? 1.25 : 1),
    setAudioState,
    (progress, step) => {
      if (step === boundStep.current.index) handwriting.current?.paint(progress)
    },
  ))
  const { index, playing } = audioState
  const speechKey = `player:${id}`
  const speaking = activeKey === speechKey
  const current = steps[index]

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
    const paper = paperRef.current
    const pen = penRef.current
    const line = paper?.querySelector<HTMLElement>('[data-current="true"] .jp-player__line')
    if (!paper || !pen || !line || (!isOpen && !expanded)) return
    const previous = boundStep.current
    const binding = bindHandwriting(paper, line, pen,
      previous.paper === paper && previous.mode === mode && previous.index + 1 === index,
    )
    boundStep.current = { index, mode, paper }
    handwriting.current = binding
    binding.paint(playback.progress)
    return () => {
      binding.dispose()
      handwriting.current = null
    }
  }, [animatedMode, expanded, index, isOpen, mode, playback])

  useEffect(() => {
    if (playSignal <= 0) return
    setAnimatedMode(true)
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
    setAnimatedMode(true)
    logEvent('player_play', { animationId: id, questionId })
    playback.start()
  }

  function togglePlay() {
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
    const nextSteps = nextMode === 'teach' && animation.teach ? animation.teach : animation.steps
    const nextAudio = calculationAudio(id, nextMode)
    if (getActiveSpeechKey() === speechKey) cancelSpeech()
    setAnimatedMode(true)
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

  const calculationBody = !animatedMode ? (
    <>
      <div
        class={hasStructuredSteps ? 'jp-calc-paper jp-calc-paper--steps' : 'jp-calc-paper'}
        data-expandable={!expanded ? 'true' : undefined}
        title={!expanded ? 'Click to expand calculation' : undefined}
        onClick={!expanded ? () => setExpanded(true) : undefined}
      >
        {steps.map((step, position) => renderStaticStepRow(step, position === steps.length - 1))}
      </div>
      <div class="jp-calc-bar">
        <button
          type="button"
          class="jp-calc-play-btn"
          onClick={startAnimatedFromStepOne}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M7 4.5v15l13-7.5z" />
          </svg>
          Play step by step
        </button>
        {speaker}
        {speedControl}
        {modeSwitch}
        {!hasRecorded && speechAvailable && (
          <button
            type="button"
            class="jp-calc-voice-btn"
            aria-label={speaking ? 'Stop reading steps' : 'Read the steps aloud'}
            aria-pressed={speaking}
            onClick={readSteps}
          >
            {speaking ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M11 5 6 9H2v6h4l5 4V5zM15.5 8.5a5 5 0 0 1 0 7" />
              </svg>
            )}
          </button>
        )}
      </div>
    </>
  ) : (
    <div class="jp-player">
      <div class="jp-player__header">
        <span>{current ? `Step ${index + 1} of ${steps.length}` : `${steps.length} steps`}</span>
        <button
          type="button"
          class="jp-player__all-btn"
          onClick={() => {
            playback.stop()
            setAnimatedMode(false)
          }}
        >
          All steps
        </button>
      </div>

      <div
        class={hasStructuredSteps ? 'jp-calc-paper jp-player__paper jp-player__paper--steps' : 'jp-calc-paper jp-player__paper'}
        ref={paperRef}
      >
        {!current && (
          <p class="jp-player__prompt">
            {isConcept
              ? 'Tap play to start the lesson, one step at a time.'
              : 'Tap play to watch the working, one step at a time.'}
          </p>
        )}
        {steps.map((step, position) => {
          const structured = hasStructuredStepFields(step)
          const isFinal = position === steps.length - 1
          return (
            <button
              key={step.n}
              class={structured ? 'jp-player__row jp-player__row--step' : 'jp-player__row'}
              data-current={position === index}
              data-final={isFinal ? 'true' : 'false'}
              aria-hidden={position > index ? true : undefined}
              tabIndex={position > index ? -1 : undefined}
              type="button"
              aria-label={`Replay step ${position + 1}: ${structured ? (step.title ?? step.tag) : step.display}`}
              onClick={() => replayStep(position)}
            >
              {renderAnimatedStepContent(step)}
            </button>
          )
        })}
        <svg ref={penRef} class="jp-player__pen" viewBox="0 0 24 24" aria-hidden="true"
          fill="var(--bg)" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <path d="m1 23 2-6L16 4l3 3L6 20z" />
          <path d="M3 17l3 3M13 7l3 3" fill="none" />
          <path d="M23 14l-4-5a2 2 0 0 0-3 2l1 2-5-3a2 2 0 0 0-2 3l4 3-2-1a2 2 0 0 0-2 3l4 3c2 2 5 2 7 1l2-1" />
        </svg>
      </div>

      <p class="jp-player__caption" aria-live="polite" aria-atomic="true">
        {current ? `“${recorded?.captions?.[index] ?? current.narration}”` : 'A caption appears for each step.'}
      </p>

      <div class="jp-player__controls">
        <button type="button" class="jp-player__play" onClick={togglePlay} aria-label={playing ? 'Pause' : 'Play'}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            {playing
              ? <path d="M6 5h4v14H6zm8 0h4v14h-4z" />
              : <path d="M7 4.5v15l13-7.5z" />}
          </svg>
        </button>
        <button type="button" class="jp-player__replay" onClick={() => hasRecorded ? playback.rewind(3) : replayStep(index)} disabled={!current} aria-label={hasRecorded ? 'Back 3 seconds' : 'Replay this step'} title={hasRecorded ? 'Back 3 seconds' : 'Replay this step'}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5" />
          </svg>
        </button>
        {[-1, 1].map((direction) => {
          const target = index + direction
          const label = direction < 0 ? 'Previous step' : 'Next step'
          return (
            <button key={direction} type="button" class="jp-btn jp-player__replay" aria-label={label} title={label}
              disabled={!current || target < 0 || target >= steps.length}
              onClick={() => playback.start(target, false, playing)}>
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

      <div class="jp-player__progress" aria-hidden="true">
        {steps.map((_, position) => <span key={position} data-reached={position <= index} />)}
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
