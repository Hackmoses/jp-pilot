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
  const [internalOpen, setInternalOpen] = useState(false)
  const isOpen = controlledOpen ?? internalOpen
  const [animatedMode, setAnimatedMode] = useState(false)
  const [index, setIndex] = useState(-1)
  const [playing, setPlaying] = useState(false)
  const [finished, setFinished] = useState(false)
  const [replay, setReplay] = useState(0)
  const [replaying, setReplaying] = useState(false)
  const [speechAvailable, setSpeechAvailable] = useState(false)
  const [activeKey, setActiveKey] = useState<string | null>(getActiveSpeechKey)
  const speechKey = `player:${id}`
  const speaking = activeKey === speechKey
  const current = steps[index]

  useEffect(() => {
    if (
      !isOpen ||
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
  }, [isOpen])

  useEffect(() => subscribeToSpeechAvailability(setSpeechAvailable), [])
  useEffect(() => subscribeToSpeechState(setActiveKey), [])
  useEffect(
    () => () => {
      if (getActiveSpeechKey() === speechKey) cancelSpeech()
    },
    [speechKey],
  )

  useEffect(() => {
    if (playSignal <= 0) return
    remaining.current = duration
    setAnimatedMode(true)
    setIndex(0)
    setFinished(false)
    setReplaying(false)
    setReplay((prev) => prev + 1)
    setPlaying(true)
    logEvent('player_play', { animationId: id, questionId })
  }, [playSignal, duration, id, questionId])

  useLayoutEffect(() => {
    if (!playing || index < 0) return

    const startedAt = performance.now()
    let elapsed = false
    const timer = window.setTimeout(() => {
      elapsed = true
      remaining.current = duration
      if (index === steps.length - 1) {
        setFinished(true)
        setPlaying(false)
      } else {
        setIndex(index + 1)
      }
    }, remaining.current)

    return () => {
      window.clearTimeout(timer)
      if (!elapsed) {
        remaining.current = Math.max(0, remaining.current - (performance.now() - startedAt))
      }
    }
  }, [playing, index, duration, steps.length])

  function handleToggleOpen() {
    if (isOpen) setPlaying(false)
    if (onToggleOpen) {
      onToggleOpen()
    } else {
      setInternalOpen((prev) => !prev)
    }
  }

  function startAnimatedFromStepOne() {
    remaining.current = duration
    setAnimatedMode(true)
    setIndex(0)
    setFinished(false)
    setReplaying(false)
    setReplay((prev) => prev + 1)
    setPlaying(true)
    logEvent('player_play', { animationId: id, questionId })
  }

  function togglePlay() {
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

  function replayStep() {
    if (!current) return

    setPlaying(false)
    setReplaying(true)
    setReplay((prev) => prev + 1)
    logEvent('player_replay_step', { animationId: id, questionId, step: current.n })
  }

  function readSteps() {
    if (speaking) {
      cancelSpeech()
      return
    }
    const narration = steps.map((step) => step.narration).join(' ')
    if (speak(narration, speechKey)) logEvent('read_aloud', { animationId: id, questionId })
  }

  return (
    <section class="jp-calc-card" aria-label="See the calculation">
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

      <div id={bodyId} hidden={!isOpen}>
        {!animatedMode ? (
          <>
            <div class="jp-calc-paper">
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
              {speechAvailable && (
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
                  setPlaying(false)
                  setAnimatedMode(false)
                }}
              >
                All steps
              </button>
            </div>

            <div class="jp-player__paper" data-running={playing || replaying}>
              {!current && (
                <p class="jp-player__prompt">Tap play to watch the working, one step at a time.</p>
              )}
              {steps.map((step, position) => (
                <div
                  key={position === index ? `${position}-${replay}` : position}
                  class="jp-player__row"
                  data-current={position === index}
                  aria-hidden={position > index ? true : undefined}
                >
                  <span class="jp-player__line">{step.display}</span>
                  <span class="jp-player__tag">{step.tag}</span>
                </div>
              ))}
            </div>

            <p class="jp-player__caption" aria-live="polite" aria-atomic="true">
              {current ? `“${current.narration}”` : 'A caption appears for each step.'}
            </p>

            <div class="jp-player__controls">
              <button type="button" class="jp-player__play" onClick={togglePlay} aria-label={playing ? 'Pause' : 'Play'}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  {playing
                    ? <path d="M6 5h4v14H6zm8 0h4v14h-4z" />
                    : <path d="M7 4.5v15l13-7.5z" />}
                </svg>
              </button>
              <button type="button" class="jp-player__replay" onClick={replayStep} disabled={!current} aria-label="Replay this step" title="Replay this step">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5" />
                </svg>
              </button>
              {speechAvailable && (
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
        )}
      </div>
    </section>
  )
}
