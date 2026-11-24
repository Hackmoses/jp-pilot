import { requestClip } from './calculationAudio'

type Request = ReturnType<typeof requestClip>
type Clip = Request['clip']
type Phase = 'idle' | 'loading' | 'silent' | 'lead' | 'voice' | 'gap' | 'done'

export interface PlaybackState {
  index: number
  playing: boolean
  sound: boolean
  speed: number
}

const PEN_LEAD = 200
const STEP_PAUSE = 500
const CLIP_TIMEOUT = 1500
const SILENT_WRITE = 1800
// A silent sample lets the speaker gesture authorize this media element on mobile.
const SILENCE = 'data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQIAAAAAAA=='

// Narration is on by default; the student's mute choice lasts for the session.
let soundPreference = true

export class CalculationPlayback {
  private state: PlaybackState = { index: -1, playing: false, sound: soundPreference, speed: 1 }
  private unlocked = false
  private phase: Phase = 'idle'
  private audio?: HTMLAudioElement
  private source?: string
  private pending?: Request
  private next?: Request
  private deadline?: number
  private frame = 0
  private lastFrame?: number
  private elapsed = 0
  private writtenMs = 0
  private clipMs = 0
  private attempt = 0
  private saveClip?: () => void
  private single = false
  progress = 0

  constructor(
    private readonly clips: (Clip | undefined)[],
    private readonly silentMs: number,
    private readonly onState: (state: PlaybackState) => void,
    private readonly onPen: (progress: number) => void,
  ) {}

  private update(update: Partial<PlaybackState>) {
    this.state = { ...this.state, ...update }
    this.onState(this.state)
  }

  private write(progress: number) {
    this.progress = Math.min(1, progress)
    this.onPen(this.progress)
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
      if (this.phase === 'loading' || this.phase === 'lead' || this.phase === 'voice') {
        const progress = this.progress
        this.fallBack()
        this.elapsed = progress * SILENT_WRITE
        this.write(progress)
      }
      return
    }

    this.unlock()
    if (this.phase === 'silent') this.start(this.state.index, this.single, this.state.playing)
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

  // Step back a few seconds within the current step; near its start, replay the step.
  rewind(seconds = 3) {
    if (this.state.index < 0) return
    if (this.phase === 'voice' && this.audio && this.audio.currentTime > 0.5) {
      this.audio.currentTime = Math.max(0, this.audio.currentTime - seconds)
      this.write((this.writtenMs + this.audio.currentTime * 1000) / this.clipMs)
      return
    }
    if (this.phase === 'silent' && this.elapsed > 500) {
      this.elapsed = Math.max(0, this.elapsed - seconds * 1000)
      this.write(this.elapsed / SILENT_WRITE)
      return
    }
    this.start(this.state.index, this.single, this.state.playing)
  }

  setSpeed(speed: number) {
    if (this.audio) {
      this.audio.defaultPlaybackRate = speed
      this.audio.playbackRate = speed
    }
    this.update({ speed })
  }

  start(index = 0, single = false, playing = true) {
    if (playing && this.state.sound) this.unlock()
    this.releaseClip()
    this.single = single
    this.elapsed = 0
    this.writtenMs = 0
    this.write(0)
    this.update({ index, playing })
    const clip = this.state.sound ? this.clips[index] : undefined
    const preloaded = this.next
    this.next = undefined
    if (preloaded?.clip !== clip) preloaded?.abort()
    if (clip) this.load(preloaded?.clip === clip ? preloaded : requestClip(clip))
    else this.phase = 'silent'
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
      if (this.phase === 'voice') this.playVoice()
      this.schedule()
    }
  }

  pause() {
    if (!this.state.playing) return
    this.attempt++
    this.audio?.pause()
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
    this.elapsed = 0
    this.phase = 'silent'
    this.write(0)
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
        this.clipMs = request.clip.durationMs
        this.phase = 'lead'
        this.preload()
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
      this.update({ playing: false })
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
        this.write(this.elapsed / SILENT_WRITE)
        if (this.elapsed >= this.silentMs) this.advance()
        break
      case 'lead':
        this.elapsed += delta
        this.writtenMs += delta * speed
        this.write(this.writtenMs / this.clipMs)
        if (this.elapsed >= PEN_LEAD) {
          this.elapsed = 0
          this.phase = 'voice'
          this.playVoice()
        }
        break
      case 'voice': {
        const audio = this.media()
        // After the lead, use the media clock so stalls or speed changes move both together.
        this.write((this.writtenMs + audio.currentTime * 1000) / this.clipMs)
        if (audio.ended) {
          this.write(1)
          this.elapsed = 0
          this.phase = 'gap'
        } else if (audio.currentTime === 0) {
          this.elapsed += delta
          if (this.elapsed >= CLIP_TIMEOUT) this.fallBack()
        }
        break
      }
      case 'gap':
        this.elapsed += delta
        if (this.elapsed >= STEP_PAUSE) this.advance()
        break
    }
    this.schedule()
  }
}
