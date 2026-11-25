import { useEffect, useRef, useState } from 'preact/hooks'
import { lazyView } from '../../lib/lazyView'
import { interpolate } from '../try-it/motion'
import { AudioSceneClock, beatTimes, fallbackMs, lessonScenes, sceneFrame } from './lesson'
import type { Clip, Frame, Lesson } from './lesson'
import './lessons.css'

const Waves = lazyView(() => import('./waves').then((module) => module.default))
const Mole = lazyView(() => import('./mole').then((module) => module.default))
const optionIds = ['A', 'B', 'C', 'D'] as const
const clipUrl = (id: string) => import.meta.env.BASE_URL + 'audio/lessons/' + id + '.webm'

function release(audio?: HTMLAudioElement) {
  if (!audio) return
  audio.pause()
  audio.removeAttribute('src')
  audio.load()
}

export function LessonPlayer({ lesson, file, clips, onComplete }: {
  lesson: Lesson; file: string; clips?: Record<string, Clip>; onComplete: () => void
}) {
  const { View, failed } = (file === 'physics-12-waves' ? Waves : Mole).useView()
  const scenes = lessonScenes(lesson)
  const [index, setIndex] = useState(0)
  const [replay, setReplay] = useState(0)
  const [captions, setCaptions] = useState(true)
  const [playing, setPlaying] = useState(false)
  const [done, setDone] = useState(false)
  const [unavailable, setUnavailable] = useState(false)
  const [frame, setFrame] = useState<Frame | null>(null)
  const [reduce, setReduce] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches)
  const playback = useRef<{ start(): void; pause(): void }>()
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
      time = Math.min(time, duration)
      setUnavailable(true)
      paint(time)
      if (wantsPlay.current) startFrames()
    }
    const start = () => {
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
    playback.current = { start, pause }
    if (wantsPlay.current) start()
    return () => {
      active = false
      playback.current = undefined
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
  const drawing = frame && { ...frame, seconds: reduce ? 0 : frame.seconds }

  return <div class="jp-player jp-concept-player">
    <div class="jp-player__header">
      <span>Scene {index + 1} of {scenes.length}</span>
      {(!clip || unavailable) && <span>Voice coming soon</span>}
    </div>
    {failed && <p role="status">Could not load the animation. Close the lesson and reload the page to retry.</p>}
    {!View && !failed && <p role="status">Loading animation…</p>}
    {View && <div class="jp-player__paper jp-concept-paper">
      {question && <div class="jp-concept-question">
        <strong>JAMB {question.year} · Question {question.number}</strong>
        <p>{question.prompt}</p>
        <ol type="A">{question.options.map((option, i) =>
          <li key={optionIds[i]} data-answer={answerShown && question.answer === optionIds[i]}>{option}</li>,
        )}</ol>
      </div>}
      {drawing && <View scene={scene} frame={drawing} />}
      {question ? <ol class="jp-concept-steps">
        {visibleScenes.map((step) => {
          const visible = step.id === scene.id ? reached : step.beats.length
          return step.beats.slice(0, visible).map(({ label }, i) => {
            const amount = step.id === scene.id && i === reached - 1 && !reduce
              ? interpolate('0', '100')(Math.min(1, (frame?.sinceBeat ?? 0) / 650)) : '100'
            return <li key={step.id + i} class="jp-player__row" style={{ clipPath: 'inset(0 ' + (100 - Number(amount)) + '% 0 0)' }}>{label}</li>
          })
        })}
      </ol> : <div class="jp-concept-beat" aria-hidden="true">{scene.beats[reached - 1]?.label}</div>}
    </div>}
    {captions && <p class="jp-player__caption" aria-live="polite">{scene.say}</p>}
    {done && <p role="status" class="jp-summary-sub">{played.current.size === scenes.length ? 'Lesson complete' : 'Play each scene to complete this lesson.'}</p>}
    <div class="jp-player__controls jp-concept-controls">
      <button type="button" aria-label="Previous scene" disabled={!index} onClick={() => select(index - 1)}>‹</button>
      <button type="button" aria-label={playing ? 'Pause' : 'Play'} class="jp-player__play" disabled={!View}
        onClick={() => {
          if (playing) playback.current?.pause()
          else if (done) { wantsPlay.current = true; select(index) }
          else playback.current?.start()
        }}>{playing ? 'Pause' : 'Play'}</button>
      <button type="button" aria-label="Replay scene" disabled={!View} onClick={() => {
        wantsPlay.current = true
        select(index)
      }}>↻</button>
      <button type="button" aria-label="Next scene" disabled={index === scenes.length - 1} onClick={() => select(index + 1)}>›</button>
      <button type="button" aria-label="Captions" aria-pressed={captions} onClick={() => setCaptions(!captions)}>CC</button>
    </div>
    <progress aria-label="Scene progress" max={1} value={frame?.progress ?? 0} />
    {lesson.tryIt && <a class="jp-summary-sub" href={lesson.tryIt === 'gas-laws' ? '#/study?subject=chemistry&chapter=3&try=gas-laws' : '#' + lesson.tryIt} onClick={(event) => {
      playback.current?.pause()
      if (lesson.tryIt === 'gas-laws') return
      event.preventDefault()
      const target = document.getElementById(lesson.tryIt!)
      target?.scrollIntoView({ block: 'start' })
      target?.querySelector('button')?.focus({ preventScroll: true })
    }}>Try it yourself</a>}
  </div>
}
