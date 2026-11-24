import { useEffect, useId, useLayoutEffect, useRef, useState } from 'preact/hooks'
import { getAnimation } from '../../lib/data'
import {
  cancelSpeech,
  getActiveSpeechKey,
  speak,
  subscribeToSpeechAvailability,
  subscribeToSpeechState,
} from '../../lib/speech'
import { logEvent } from '../../lib/store'
import type { Animation } from '../../lib/types'
import { calculationAudio } from './calculationAudio'
import { CalculationPlayback, type PlaybackState } from './CalculationPlayback'
import './player.css'

export interface SolutionPlayerProps {
  animationId: string
  open?: boolean
  onToggleOpen?: () => void
  playSignal?: number
}

export function SolutionPlayer({
  animationId,
  open,
  onToggleOpen,
  playSignal = 0,
}: SolutionPlayerProps) {
  const animation = getAnimation(animationId)
  return animation ? (
    <Player
      key={animation.id}
      animation={animation}
      controlledOpen={open}
      onToggleOpen={onToggleOpen}
      playSignal={playSignal}
    />
  ) : null
}

function Player({
  animation,
  controlledOpen,
  onToggleOpen,
  playSignal,
}: {
  animation: Animation
  controlledOpen?: boolean
  onToggleOpen?: () => void
  playSignal: number
}) {
  const { id, questionId, steps, stepSeconds } = animation
  const duration = stepSeconds * 1000
  const remaining = useRef(duration)
  const bodyId = useId()
  const modalRef = useRef<HTMLDialogElement>(null)
  const expandBtnRef = useRef<HTMLButtonElement>(null)
  const pointerStartedOnBackdrop = useRef(false)
  const [internalOpen, setInternalOpen] = useState(false)
  const isOpen = controlledOpen ?? internalOpen
  const [expanded, setExpanded] = useState(false)
  const [animatedMode, setAnimatedMode] = useState(false)
  const [legacyIndex, setIndex] = useState(-1)
  const [legacyPlaying, setPlaying] = useState(false)
  const [finished, setFinished] = useState(false)
  const [replay, setReplay] = useState(0)
  const [replaying, setReplaying] = useState(false)
  const [speechAvailable, setSpeechAvailable] = useState(false)
  const [activeKey, setActiveKey] = useState<string | null>(getActiveSpeechKey)
  const paperRef = useRef<HTMLDivElement>(null)
  const [recorded] = useState(() => calculationAudio(id))
  const [audioState, setAudioState] = useState<PlaybackState>({ index: -1, playing: false, sound: true, speed: 1 })
  const [playback] = useState(() => recorded && new CalculationPlayback(
    steps.map((step) => recorded.clips.get(step.n)), duration, setAudioState,
    (progress) => paperRef.current?.style.setProperty('--jp-pen-cover', `${(1 - progress) * 100}%`),
  ))
  const index = playback ? audioState.index : legacyIndex
  const playing = playback ? audioState.playing : legacyPlaying
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

  useEffect(() => playback ? undefined : subscribeToSpeechAvailability(setSpeechAvailable), [playback])
  useEffect(() => playback ? undefined : subscribeToSpeechState(setActiveKey), [playback])
  useEffect(
    () => () => {
      if (getActiveSpeechKey() === speechKey) cancelSpeech()
    },
    [speechKey],
  )

  useEffect(() => () => playback?.dispose(), [playback])
  useLayoutEffect(() => {
    if (!isOpen && !expanded) playback?.pause()
  }, [expanded, isOpen, playback])
  useLayoutEffect(() => {
    if (playback) paperRef.current?.style.setProperty('--jp-pen-cover', `${(1 - playback.progress) * 100}%`)
  }, [animatedMode, expanded, playback])

  useEffect(() => {
    if (playSignal <= 0) return
    setAnimatedMode(true)
    if (playback) {
      playback.start()
      logEvent('player_play', { animationId: id, questionId })
      return
    }
    remaining.current = duration
    setIndex(0)
    setFinished(false)
    setReplaying(false)
    setReplay((prev) => prev + 1)
    setPlaying(true)
    logEvent('player_play', { animationId: id, questionId })
  }, [playSignal, duration, id, questionId, playback])

  useLayoutEffect(() => {
    if (playback || !legacyPlaying || legacyIndex < 0) return

    const startedAt = performance.now()
    let elapsed = false
    const timer = window.setTimeout(() => {
      elapsed = true
      remaining.current = duration
      if (legacyIndex === steps.length - 1) {
        setFinished(true)
        setPlaying(false)
      } else {
        setIndex(legacyIndex + 1)
      }
    }, remaining.current)

    return () => {
      window.clearTimeout(timer)
      if (!elapsed) {
        remaining.current = Math.max(0, remaining.current - (performance.now() - startedAt))
      }
    }
  }, [playback, legacyPlaying, legacyIndex, duration, steps.length])

  function handleToggleOpen() {
    if (isOpen) {
      playback?.pause()
      setPlaying(false)
    }
    if (onToggleOpen) {
      onToggleOpen()
    } else {
      setInternalOpen((prev) => !prev)
    }
  }

  function startAnimatedFromStepOne() {
    setAnimatedMode(true)
    logEvent('player_play', { animationId: id, questionId })
    if (playback) {
      playback.start()
      return
    }
    remaining.current = duration
    setIndex(0)
    setFinished(false)
    setReplaying(false)
    setReplay((prev) => prev + 1)
    setPlaying(true)
  }

  function togglePlay() {
    if (playback) {
      if (!playing) logEvent('player_play', { animationId: id, questionId })
      playback.toggle()
      return
    }
    if (playing) {
      setPlaying(false)
      return
    }

    if (!current || finished) {
      startAnimatedFromStepOne()
      return
    }
    if (replaying) remaining.current = duration
    setReplaying(false)
    setPlaying(true)
    logEvent('player_play', { animationId: id, questionId })
  }

  function replayStep(position: number) {
    const step = steps[position]
    if (!step) return

    logEvent('player_replay_step', { animationId: id, questionId, step: step.n })
    if (playback) {
      playback.start(position, true)
      return
    }
    setPlaying(false)
    setReplaying(true)
    setReplay((prev) => prev + 1)
  }

  function readSteps() {
    if (speaking) {
      cancelSpeech()
      return
    }
    const narration = steps.map((step) => step.narration).join(' ')
    if (speak(narration, speechKey)) logEvent('read_aloud', { animationId: id, questionId })
  }

  const speaker = playback && (
    <button
      type="button"
      class="jp-player__speaker"
      aria-label="Calculation narration"
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

  const speedControl = playback && (
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

  const StepRow = playback ? 'button' : 'div'

  const calculationBody = !animatedMode ? (
    <>
      <div
        class="jp-calc-paper"
        data-expandable={!expanded ? 'true' : undefined}
        title={!expanded ? 'Click to expand calculation' : undefined}
        onClick={!expanded ? () => setExpanded(true) : undefined}
      >
        {steps.map((step, position) => (
          <div
            key={step.n}
            class="jp-calc-line-row"
            data-final={position === steps.length - 1 ? 'true' : 'false'}
          >
            <span class="jp-calc-line-text">{step.display}</span>
            <span class="jp-calc-line-tag">{step.tag}</span>
          </div>
        ))}
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
        {!playback && speechAvailable && (
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
            playback?.stop()
            setPlaying(false)
            setAnimatedMode(false)
          }}
        >
          All steps
        </button>
      </div>

      <div class="jp-player__paper" ref={paperRef} data-timed={playback ? 'true' : undefined} data-running={playing || replaying}>
        {!current && (
          <p class="jp-player__prompt">Tap play to watch the working, one step at a time.</p>
        )}
        {steps.map((step, position) => (
          <StepRow
            key={position === index ? `${position}-${replay}` : position}
            class="jp-player__row"
            data-current={position === index}
            aria-hidden={position > index ? true : undefined}
            type={playback ? 'button' : undefined}
            aria-label={playback ? `Replay step ${position + 1}: ${step.display}` : undefined}
            onClick={playback ? () => replayStep(position) : undefined}
          >
            <span class="jp-player__line">{step.display}</span>
            <span class="jp-player__tag">{step.tag}</span>
          </StepRow>
        ))}
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
        <button type="button" class="jp-player__replay" onClick={() => (playback ? playback.rewind(3) : replayStep(index))} disabled={!current} aria-label={playback ? 'Back 3 seconds' : 'Replay this step'} title={playback ? 'Back 3 seconds' : 'Replay this step'}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5" />
          </svg>
        </button>
        {speaker}
        {speedControl}
        {!playback && speechAvailable && (
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
    <section class="jp-calc-card" aria-label="See the calculation">
      <div class="jp-calc-head">
        <button
          type="button"
          class="jp-calc-toggle"
          aria-expanded={isOpen}
          aria-controls={bodyId}
          onClick={handleToggleOpen}
        >
          <span class="jp-calc-icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
            </svg>
          </span>
          <span class="jp-calc-copy">
            <span class="jp-calc-title">See the calculation</span>
            <span class="jp-calc-sub">{steps.length} steps, written out by hand</span>
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
          aria-label="Expand calculation"
          title="Expand calculation"
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
          aria-label="Expanded calculation"
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
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
                </svg>
              </span>
              <div class="jp-calc-copy">
                <span class="jp-calc-title">See the calculation</span>
                <span class="jp-calc-sub">{steps.length} steps, written out by hand</span>
              </div>
              <button
                type="button"
                class="jp-calc-modal-close"
                aria-label="Close expanded calculation"
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
