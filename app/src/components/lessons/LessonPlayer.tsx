import { useEffect, useRef, useState } from 'preact/hooks'
import { lazyView } from '../../lib/lazyView'
import { interpolate } from '../try-it/motion'
import { AudioSceneClock, beatTimes, fallbackMs, lessonScenes, sceneFrame, wordCues } from './lesson'
import type { Clip, Frame, Lesson, WordBank } from './lesson'
import { Caption, PrintedPrompt } from './LessonText'
import './lessons.css'

const Waves = lazyView(() => import('./waves').then((module) => module.default))
const Mole = lazyView(() => import('./mole').then((module) => module.default))
const foundations = [
  lazyView(() => import('./english/letters-drawing').then((module) => module.default)),
  lazyView(() => import('./english/syllables-drawing').then((module) => module.default)),
  lazyView(() => import('./english/vowels-drawing').then((module) => module.default)),
  lazyView(() => import('./english/consonants-drawing').then((module) => module.default)),
  lazyView(() => import('./english/parts-drawing').then((module) => module.default)),
  lazyView(() => import('./english/rules-drawing').then((module) => module.default)),
  lazyView(() => import('./english/endings-drawing').then((module) => module.default)),
  lazyView(() => import('./english/pairs-drawing').then((module) => module.default)),
  lazyView(() => import('./english/spelling-drawing').then((module) => module.default)),
  lazyView(() => import('./english/stress-drawing').then((module) => module.default)),
]
const optionIds = ['A', 'B', 'C', 'D'] as const
const clipUrl = (id: string) => import.meta.env.BASE_URL + 'audio/lessons/' + id + '.webm'

function release(audio?: HTMLAudioElement) {
  if (!audio) return
  audio.pause()
  audio.removeAttribute('src')
  audio.load()
}

export function LessonPlayer({ lesson, file, clips, pronunciations, onComplete }: {
  lesson: Lesson; file: string; clips?: Record<string, Clip>; pronunciations?: WordBank; onComplete: () => void
}) {
  const unit = file === 'english-foundations' ? foundations[Number(lesson.id.split('-')[2]) - 1] : undefined
  const { View, failed } = (unit ?? (file === 'physics-12-waves' ? Waves : Mole)).useView()
  const scenes = lessonScenes(lesson)
  const [index, setIndex] = useState(0)
  const [replay, setReplay] = useState(0)
  const [captions, setCaptions] = useState(true)
  const [playing, setPlaying] = useState(false)
  const [done, setDone] = useState(false)
  const [unavailable, setUnavailable] = useState(false)
  const [frame, setFrame] = useState<Frame | null>(null)
  const [reduce, setReduce] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches)
  const playback = useRef<{ start(): void; pause(): void; preview(id: string): void }>()
  const nextClip = useRef<{ id: string; audio: HTMLAudioElement }>()
  const wantsPlay = useRef(true)
  const played = useRef(new Set<string>())
  const scene = scenes[index]
  const clip = clips?.[scene.id]

  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)')
    const change = () => setReduce(media.matches)
    media.addEventListener('change', change)
    return () => {
      media.removeEventListener('change', change)
      release(nextClip.current?.audio)
    }
  }, [])

  useEffect(() => {
    if (!View) return
    let audio: HTMLAudioElement | undefined
    let clock: AudioSceneClock | undefined
    let duration = clip?.durationMs ?? fallbackMs(scene)
    let times = beatTimes(scene, duration, clip)
    const availableCues = (length: number, timing?: Clip) => pronunciations
      ? wordCues(scene, length, timing).filter(({ id }) => pronunciations[id]?.audio) : []
    let cues = availableCues(duration, clip)
    let cueIndex = 0
    let wordAudio: HTMLAudioElement | undefined
    let time = 0
    let startedAt = 0
    let raf = 0
    let running = false
    let active = true
    const paint = (ms: number) => setFrame(sceneFrame(ms, duration, times))
    const stop = () => { running = false; cancelAnimationFrame(raf) }
    const prefetch = () => {
      const next = scenes[index + 1]
      if (!next || !clips?.[next.id] || nextClip.current?.id === next.id) return
      const pending = new Audio()
      pending.preload = 'auto'
      pending.src = clipUrl(next.id)
      nextClip.current = { id: next.id, audio: pending }
    }
    const finish = () => {
      stop()
      paint(duration)
      played.current.add(scene.id)
      if (index < scenes.length - 1) {
        setIndex(index + 1)
      } else {
        wantsPlay.current = false
        setPlaying(false)
        setDone(true)
        if (played.current.size === scenes.length) onComplete()
      }
    }
    const tick = (now: number) => {
      if (!running) return
      time = clock ? clock.sample() : now - startedAt
      if (!clock && time >= duration) { finish(); return }
      paint(time)
      if (cueIndex < cues.length && cues[cueIndex].atMs <= time) {
        playWord(cues[cueIndex++].id, true)
        return
      }
      raf = requestAnimationFrame(tick)
    }
    const startFrames = () => {
      if (running) return
      prefetch()
      startedAt = performance.now() - time
      running = true
      raf = requestAnimationFrame(tick)
    }
    const position = () => {
      if (!clock || !audio) return
      time = clock.seek()
      paint(time)
      if (wantsPlay.current && !audio.paused && audio.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
        clock.start()
        startFrames()
      }
    }
    const hold = () => {
      stop()
      if (clock) { time = clock.hold(); paint(time) }
    }
    const dropAudio = () => {
      if (!active || !audio) return
      usingFallback = true
      hold()
      audio.onplaying = audio.onwaiting = audio.onpause = audio.onseeking = audio.onseeked = audio.onended = audio.onerror = null
      release(audio)
      audio = undefined
      clock = undefined
      duration = fallbackMs(scene)
      times = beatTimes(scene, duration)
      cues = availableCues(duration)
      time = Math.min(time, duration)
      setUnavailable(true)
      paint(time)
      if (wantsPlay.current) startFrames()
    }
    const start = () => {
      clearWord()
      wantsPlay.current = true
      setPlaying(true)
      if (!clip || usingFallback) { startFrames(); return }
      if (!audio) {
        audio = new Audio()
        configure(audio)
      }
      const requested = audio
      void requested.play().catch((error: DOMException) => {
        if (!active || requested !== audio || !wantsPlay.current || error.name === 'AbortError') return
        if (error.name === 'NotAllowedError') pause()
        else dropAudio()
      })
    }
    const pause = () => {
      wantsPlay.current = false
      setPlaying(false)
      if (!clock && running) { time = performance.now() - startedAt; paint(time) }
      hold()
      audio?.pause()
      clearWord()
    }
    const clearWord = () => {
      if (!wordAudio) return
      wordAudio.onended = wordAudio.onerror = null
      release(wordAudio)
      wordAudio = undefined
    }
    const playWord = (id: string, resume: boolean) => {
      if (!pronunciations?.[id]?.audio) return
      hold()
      audio?.pause()
      clearWord()
      const example = new Audio(import.meta.env.BASE_URL + 'audio/words/' + id + '.webm')
      wordAudio = example
      const finishWord = () => {
        if (!active || wordAudio !== example) return
        clearWord()
        if (resume && wantsPlay.current) start()
      }
      example.onended = example.onerror = finishWord
      void example.play().catch(finishWord)
    }
    const configure = (element: HTMLAudioElement) => {
      clock = new AudioSceneClock(element)
      element.onplaying = () => {
        if (!wantsPlay.current) { element.pause(); return }
        time = clock!.start()
        startFrames()
      }
      element.onwaiting = hold
      element.onpause = hold
      element.onseeking = hold
      element.onseeked = position
      element.onended = finish
      element.onerror = () => { if (active) { usingFallback = true; dropAudio() } }
      if (!element.src) element.src = clipUrl(scene.id)
    }
    let usingFallback = false
    if (nextClip.current?.id === scene.id && clip) {
      audio = nextClip.current.audio
      nextClip.current = undefined
      configure(audio)
      if (audio.error) { usingFallback = true; dropAudio() }
    } else {
      release(nextClip.current?.audio)
      nextClip.current = undefined
    }
    setUnavailable(usingFallback)
    paint(0)
    playback.current = { start, pause, preview: (id) => { pause(); playWord(id, false) } }
    if (wantsPlay.current) start()
    return () => {
      active = false
      playback.current = undefined
      clearWord()
      stop()
      if (audio) {
        audio.onplaying = audio.onwaiting = audio.onpause = audio.onseeking = audio.onseeked = audio.onended = audio.onerror = null
        release(audio)
      }
    }
  }, [scene.id, replay, View])

  const select = (target: number) => {
    setDone(false)
    setFrame(null)
    if (target === index) setReplay(replay + 1)
    else setIndex(target)
  }
  const question = index >= lesson.scenes.length ? lesson.pastQuestion : null
  const reached = frame?.reached ?? 0
  const visibleScenes = question ? scenes.slice(lesson.scenes.length, index + 1) : []
  const answerShown = question && visibleScenes.some((step) =>
    step.beats.slice(0, step.id === scene.id ? reached : undefined).some(({ label }) => label.startsWith(question.answer + ' ·')),
  )
  const drawing = frame && { ...frame, seconds: reduce ? 0 : frame.seconds, reduced: reduce }
  const tryIt = typeof lesson.tryIt === 'string' ? lesson.tryIt : undefined

  return <div class="jp-concept-player">
    <div class="jp-concept-header">
      <span>Scene {index + 1} of {scenes.length}</span>
      {(!clip || unavailable) && <span class="jp-concept-badge">Voice coming soon</span>}
    </div>
    {failed && <p class="jp-mode-lead jp-concept-status" role="status">Could not load the animation. Close the lesson and reload the page to retry.</p>}
    {!View && !failed && <p class="jp-mode-lead jp-concept-status" role="status">Loading animation…</p>}
    {View && <div class="jp-concept-paper">
      {question && <div class="jp-concept-question">
        <span class="jp-jamb-badge">JAMB {question.year} · Question {question.number}</span>
        {question.instructions && <p>{question.instructions}</p>}
        {question.prompt && <p><PrintedPrompt question={question} /></p>}
        <ol type="A" class={question.optionLabels ? 'jp-concept-printed-options' : undefined}>{question.options.map((option, i) =>
          <li key={optionIds[i]} data-answer={(answerShown || Boolean(unit && index === scenes.length - 1 && frame?.progress === 1)) && question.answer === optionIds[i]}>
            {question.optionLabels && <span>{question.optionLabels[i]} </span>}{option}</li>,
        )}</ol>
        {question.afterOptions && <p>{question.afterOptions}</p>}
      </div>}
      {drawing && <View scene={scene} frame={drawing} pronunciations={pronunciations} />}
      {question ? <ol class="jp-concept-steps">
        {visibleScenes.map((step) => {
          const visible = step.id === scene.id ? reached : step.beats.length
          return step.beats.slice(0, visible).map(({ label }, i) => {
            const amount = step.id === scene.id && i === reached - 1 && !reduce
              ? interpolate('0', '100')(Math.min(1, (frame?.sinceBeat ?? 0) / 650)) : '100'
            return <li key={step.id + i} class="jp-concept-step" style={{ clipPath: 'inset(0 ' + (100 - Number(amount)) + '% 0 0)' }}>{label}</li>
          })
        })}
      </ol> : <div class="jp-concept-beat" aria-hidden="true">{scene.beats[reached - 1]?.label}</div>}
    </div>}
    {captions && <p class="jp-concept-caption" aria-live="polite">{pronunciations
      ? <Caption line={scene.say} pronunciations={pronunciations} onPlay={(id) => playback.current?.preview(id)} />
      : scene.say}</p>}
    <div class="jp-concept-controls" role="group" aria-label="Lesson playback controls">
      <button type="button" class="jp-concept-btn" aria-label="Previous scene" disabled={!index} onClick={() => select(index - 1)}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
      </button>
      <button type="button" aria-label={playing ? 'Pause' : 'Play'} class="jp-concept-btn jp-concept-play" disabled={!View}
        onClick={() => {
          if (playing) playback.current?.pause()
          else if (done) { wantsPlay.current = true; select(index) }
          else playback.current?.start()
        }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          {playing ? <path d="M6 5h4v14H6zm8 0h4v14h-4z" /> : <path d="M7 4.5v15l13-7.5z" />}
        </svg>
        <span>{playing ? 'Pause' : 'Play'}</span>
      </button>
      <button type="button" class="jp-concept-btn" aria-label="Replay scene" disabled={!View} onClick={() => {
        wantsPlay.current = true
        select(index)
      }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5" /></svg>
      </button>
      <button type="button" class="jp-concept-btn" aria-label="Next scene" disabled={index === scenes.length - 1} onClick={() => select(index + 1)}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
      </button>
      <button type="button" class="jp-concept-btn jp-concept-cc" aria-label="Captions" aria-pressed={captions} onClick={() => setCaptions(!captions)}>CC</button>
    </div>
    <div class="jp-concept-progress-wrap">
      <progress class="jp-concept-progress" aria-label="Scene progress" max={1} value={frame?.progress ?? 0} />
    </div>
    {(done || tryIt) && <div class="jp-concept-footer">
      {done && <p role="status" class={played.current.size === scenes.length ? 'jp-mode-studied jp-concept-done' : 'jp-summary-sub jp-concept-done'}>
        {played.current.size === scenes.length ? '✓ Lesson complete' : 'Play each scene to complete this lesson.'}
      </p>}
      {tryIt && <a class="jp-btn" href={tryIt === 'gas-laws' ? '#/study?subject=chemistry&chapter=3&try=gas-laws' : '#' + tryIt} onClick={(event) => {
        playback.current?.pause()
        if (tryIt === 'gas-laws') return
        event.preventDefault()
        const target = document.getElementById(tryIt)
        target?.scrollIntoView({ block: 'start' })
        target?.querySelector<HTMLButtonElement>('button[aria-expanded]')?.focus({ preventScroll: true })
      }}>Try it yourself →</a>}
    </div>}
  </div>
}
