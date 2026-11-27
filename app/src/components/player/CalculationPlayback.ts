import { requestClip, type NarrationMode } from './calculationAudio'

type Request = ReturnType<typeof requestClip>
type Clip = Request['clip']
type Phase = 'idle' | 'loading' | 'silent' | 'voice' | 'done'

export interface PlaybackState {
  index: number
  playing: boolean
  sound: boolean
  speed: number
}

const CLIP_TIMEOUT = 1500
const SILENT_WRITE = 1800
// A silent sample lets the speaker gesture authorize this media element on mobile.
const SILENCE = 'data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQIAAAAAAA=='

// Narration is on by default; the student's mute, speed, and mode choices last for the session.
let soundPreference = true
// Narration starts at normal speed (1×). Students can slow it down or speed it up.
export const DEFAULT_SPEED = 1
let speedPreference = DEFAULT_SPEED
let modePreference: NarrationMode | null = null

export function getInitialNarrationMode(hasTeach: boolean, isCorrect?: boolean): NarrationMode {
  if (!hasTeach) return 'quick'
  // Teach me is the default; a manual switch is remembered for the session.
  void isCorrect
  return modePreference ?? 'teach'
}

export function setSessionNarrationMode(mode: NarrationMode) {
  modePreference = mode
}

export function getSessionPlaybackPreferences() {
  return { sound: soundPreference, speed: speedPreference }
}

export function resetSessionPlaybackPreferences() {
  soundPreference = true
  speedPreference = DEFAULT_SPEED
  modePreference = null
}

export class CalculationPlayback {
  private state: PlaybackState = { index: -1, playing: false, sound: soundPreference, speed: speedPreference }
  private unlocked = false
  private seekMs = 0
  private phase: Phase = 'idle'
  private audio?: HTMLAudioElement
  private source?: string
  private pending?: Request
  private next?: Request
  private deadline?: number
  private frame = 0
  private lastFrame?: number
  private elapsed = 0
  private clipMs = 0
  private attempt = 0
  private saveClip?: () => void
  private single = false
  progress = 0

  constructor(
    private clips: (Clip | undefined)[],
    private silentMs: number,
    private readonly onState: (state: PlaybackState) => void,
    private readonly onPen: (progress: number, index: number) => void,
  ) {}

  setClips(nextClips: (Clip | undefined)[], restart = false, silentMs = this.silentMs) {
    this.silentMs = silentMs
    this.clips = nextClips
    if (restart) {
      this.start(0, false, true)
    } else {
      this.stop()
    }
  }

  private update(update: Partial<PlaybackState>) {
    this.state = { ...this.state, ...update }
    this.onState(this.state)
  }

  private write(progress: number) {
    const next = Math.max(0, Math.min(1, progress))
    if (next === this.progress) return
    this.progress = next
    this.onPen(next, this.state.index)
  }

  private media() {
    if (!this.audio) {
      this.audio = new Audio()
      this.audio.preservesPitch = true
      this.audio.preload = 'auto'
      this.audio.defaultPlaybackRate = this.state.speed
    }
    return this.audio
  }

  setSound(enabled: boolean) {
    soundPreference = enabled
    if (enabled === this.state.sound) return
    this.update({ sound: enabled })
    if (!enabled) {
      this.next?.abort()
      this.next = undefined
      if (this.phase === 'loading' || this.phase === 'voice') this.fallBack()
      return
    }

    if (this.phase === 'silent' && this.clips[this.state.index]) {
      this.start(this.state.index, this.single, this.state.playing)
    }
  }

  // A silent sample played inside a tap authorises this media element on mobile.
  private unlock() {
    if (this.unlocked) return
    this.unlocked = true
    const audio = this.media()
    audio.src = SILENCE
    void audio.play().then(() => {
      if (audio.src === SILENCE) audio.pause()
    }).catch(() => { this.unlocked = false })
  }

  // Step back a number of seconds through the whole calculation, crossing into earlier steps.
  rewind(seconds = 3) {
    if (this.state.index < 0) return
    let remaining = seconds * 1000
    let index = this.state.index
    const position = this.positionMs()
    if (position >= remaining) {
      const offset = position - remaining
      if (this.phase === 'done') {
        this.start(index, this.single, this.state.playing, offset)
      } else {
        this.seekWithin(offset)
      }
      return
    }
    remaining -= position
    while (index > 0) {
      index--
      const length = this.stepMs(index)
      if (length >= remaining) {
        this.start(index, this.single, this.state.playing, length - remaining)
        return
      }
      remaining -= length
    }
    this.start(0, this.single, this.state.playing)
  }

  private stepMs(index: number) {
    const clip = this.state.sound ? this.clips[index] : undefined
    return clip ? clip.durationMs : this.silentMs
  }

  private positionMs() {
    switch (this.phase) {
      case 'voice': return (this.audio?.currentTime ?? 0) * 1000
      case 'silent': return this.elapsed
      case 'done': return this.stepMs(this.state.index)
      default: return 0
    }
  }

  private seekWithin(ms: number) {
    if (this.phase === 'voice' && this.audio) {
      this.audio.currentTime = ms / 1000
      this.writeVoice(ms)
    } else if (this.phase === 'silent') {
      this.elapsed = ms
      this.write(ms / this.silentWriteMs())
    } else {
      this.start(this.state.index, this.single, this.state.playing)
    }
  }

  private silentWriteMs() {
    return Math.max(1, Math.min(SILENT_WRITE, this.silentMs * 0.9))
  }

  private writeVoice(ms: number) {
    // Leave the last beat for reading. The audio element owns the time and playback rate.
    this.write(ms / (this.clipMs - Math.min(100, this.clipMs * 0.1)))
  }

  setSpeed(speed: number) {
    speedPreference = speed
    if (this.audio) {
      this.audio.defaultPlaybackRate = speed
      this.audio.playbackRate = speed
    }
    this.update({ speed })
  }

  start(index = 0, single = false, playing = true, offsetMs = 0) {
    this.seekMs = offsetMs
    const clip = this.state.sound ? this.clips[index] : undefined
    if (playing && clip) this.unlock()
    this.releaseClip()
    this.single = single
    this.elapsed = 0
    this.update({ index, playing })
    this.write(0)
    const preloaded = this.next
    this.next = undefined
    if (preloaded?.clip !== clip) preloaded?.abort()
    if (clip) this.load(preloaded?.clip === clip ? preloaded : requestClip(clip))
    else {
      this.phase = 'silent'
      if (offsetMs) {
        this.elapsed = offsetMs
        this.write(offsetMs / this.silentWriteMs())
      }
    }
    this.schedule()
  }

  toggle() {
    if (this.state.playing) {
      this.pause()
    } else if (this.phase === 'done') {
      this.start(this.state.index + 1 < this.clips.length ? this.state.index + 1 : 0)
    } else if (this.phase === 'idle') {
      this.start()
    } else {
      this.update({ playing: true })
      if (this.phase === 'voice') {
        this.playVoice()
      }
      this.schedule()
    }
  }

  pause() {
    if (!this.state.playing) return
    this.attempt++
    this.audio?.pause()
    if (this.phase === 'voice' && this.audio) this.writeVoice(this.audio.currentTime * 1000)
    this.update({ playing: false })
    this.cancelFrame()
  }

  stop() {
    this.releaseClip()
    this.next?.abort()
    this.next = undefined
    this.phase = 'idle'
    this.write(0)
    this.update({ index: -1, playing: false })
  }

  dispose() {
    this.releaseClip()
    this.next?.abort()
    if (this.audio) {
      this.audio.pause()
      this.audio.removeAttribute('src')
      this.audio.load()
    }
  }

  private cancelFrame() {
    cancelAnimationFrame(this.frame)
    this.frame = 0
    this.lastFrame = undefined
  }

  private releaseClip() {
    this.cancelFrame()
    this.attempt++
    clearTimeout(this.deadline)
    this.pending?.abort()
    this.pending = undefined
    this.saveClip = undefined
    const audio = this.audio
    if (audio) {
      audio.oncanplay = null
      audio.onerror = null
      if (this.source) {
        audio.pause()
        audio.removeAttribute('src')
        audio.load()
        URL.revokeObjectURL(this.source)
        this.source = undefined
      }
    }
  }

  private fallBack() {
    this.releaseClip()
    this.elapsed = Math.max(this.seekMs, this.progress * this.silentWriteMs())
    this.seekMs = 0
    this.phase = 'silent'
    this.write(this.elapsed / this.silentWriteMs())
    this.preload()
    this.schedule()
  }

  private load(request: Request) {
    this.phase = 'loading'
    this.pending = request
    this.deadline = window.setTimeout(() => this.fallBack(), CLIP_TIMEOUT)
    void request.blob.then((blob) => {
      if (this.pending !== request) return
      if (!blob?.size) {
        this.fallBack()
        return
      }
      const audio = this.media()
      audio.pause()
      audio.onerror = () => this.fallBack()
      audio.oncanplay = () => {
        if (this.pending !== request) return
        clearTimeout(this.deadline)
        this.pending = undefined
        this.saveClip = () => request.saveAfterPlay(blob)
        this.clipMs = Number.isFinite(audio.duration) && audio.duration > 0
          ? audio.duration * 1000
          : request.clip.durationMs
        if (this.seekMs) audio.currentTime = this.seekMs / 1000
        this.seekMs = 0
        this.phase = 'voice'
        this.writeVoice(audio.currentTime * 1000)
        this.preload()
        if (this.state.playing) this.playVoice()
        this.schedule()
      }
      this.source = URL.createObjectURL(blob)
      audio.src = this.source
      audio.load()
    })
  }

  private preload() {
    const clip = this.state.sound && this.clips[this.state.index + 1]
    if (clip && !this.next) this.next = requestClip(clip)
  }

  private playVoice() {
    const attempt = ++this.attempt
    const save = this.saveClip
    const audio = this.media()
    audio.playbackRate = this.state.speed
    void audio.play().then(() => save?.()).catch(() => {
      if (attempt === this.attempt) this.fallBack()
    })
  }

  private advance() {
    if (this.single || this.state.index + 1 === this.clips.length) {
      this.releaseClip()
      this.phase = 'done'
      this.update({ playing: false, index: this.single ? this.state.index : this.clips.length })
    } else {
      this.start(this.state.index + 1)
    }
  }

  private schedule() {
    if (this.state.playing && this.phase !== 'loading' && !this.frame) {
      this.frame = requestAnimationFrame(this.tick)
    }
  }

  private tick = (now: number) => {
    this.frame = 0
    const delta = now - (this.lastFrame ?? now)
    this.lastFrame = now
    const speed = this.state.speed
    switch (this.phase) {
      case 'silent':
        this.elapsed += delta * speed
        this.write(this.elapsed / this.silentWriteMs())
        if (this.elapsed >= this.silentMs) this.advance()
        break
      case 'voice': {
        const audio = this.media()
        // Using the media clock keeps stalls and speed changes in sync with the pen.
        this.writeVoice(audio.currentTime * 1000)
        if (audio.ended) {
          this.write(1)
          this.advance()
        } else if (audio.currentTime === 0) {
          this.elapsed += delta
          if (this.elapsed >= CLIP_TIMEOUT) this.fallBack()
        }
        break
      }
    }
    this.schedule()
  }
}
