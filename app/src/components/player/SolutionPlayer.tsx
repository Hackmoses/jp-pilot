import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks'
import { getAnimation, getQuestion } from '../../lib/data'
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

export function SolutionPlayer({ animationId }: { animationId: string }) {
  const animation = getAnimation(animationId)
  return animation ? <Player key={animation.id} animation={animation} /> : null
}

function Player({ animation }: { animation: Animation }) {
  const { id, questionId, steps, stepSeconds } = animation
  const duration = stepSeconds * 1000
  const remaining = useRef(duration)
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
  const trap = getQuestion(questionId)?.trap

  useEffect(() => {
    if (document.getElementById('jp-caveat-font')) return

    const font = document.createElement('link')
    font.id = 'jp-caveat-font'
    font.rel = 'stylesheet'
    font.href = 'https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&display=swap'
    document.head.append(font)
  }, [])

  useEffect(() => subscribeToSpeechAvailability(setSpeechAvailable), [])
  useEffect(() => subscribeToSpeechState(setActiveKey), [])
  useEffect(
    () => () => {
      if (getActiveSpeechKey() === speechKey) cancelSpeech()
    },
    [speechKey],
  )

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

  function togglePlay() {
    if (playing) {
      setPlaying(false)
      return
    }

    if (!current || finished) {
      remaining.current = duration
      setIndex(0)
      setFinished(false)
      setReplay(replay + 1)
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
    setReplay(replay + 1)
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
    <div class="jp-player">
      <section class="jp-player__card" aria-label="Watch it solved">
        <header class="jp-player__header">
          <h2>Watch it solved</h2>
          <span>{current ? `Step ${index + 1} of ${steps.length}` : `${steps.length} steps`}</span>
        </header>

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
      </section>

      <section class="jp-player__working">
        <h2>The working</h2>
        <ol>{steps.map((step, position) => <li key={position}>{step.display}</li>)}</ol>
      </section>

      {trap && (
        <section class="jp-player__trap">
          <h2>The trap</h2>
          <p>{trap}</p>
        </section>
      )}
    </div>
  )
}
