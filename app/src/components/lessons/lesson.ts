export type Beat = { word: string; action: string; label: string }
export type Scene = {
  id: string
  show: string
  say: string
  visual: string
  beats: Beat[]
}
export type Question = {
  year: number
  number: number
  source: { file: string; page: number; keyPage: number }
  prompt: string
  options: [string, string, string, string]
  afterOptions?: string
  answer: 'A' | 'B' | 'C' | 'D'
  scenes: Scene[]
}
export type Lesson = {
  id: string
  title: string
  scenes: Scene[]
  pastQuestion: Question | null
  tryIt: string | null
}
export type Clip = {
  sceneId: string
  durationMs: number
  beats: { word: string; atMs: number }[]
}
export type Topic = { lessons: Lesson[]; clips?: Record<string, Clip> }
export type Frame = { progress: number; seconds: number; reached: number; sinceBeat: number }
export type DrawingProps = { scene: Scene; frame: Frame }

export function lessonScenes(lesson: Lesson) {
  return [...lesson.scenes, ...lesson.pastQuestion?.scenes ?? []]
}
export const words = (line: string) => line.trim().split(/\s+/)
export const fallbackMs = (scene: Scene) => words(scene.say).length * 400
export function beatTimes(scene: Scene, duration: number, clip?: Clip) {
  const tokens = words(scene.say)
  let previous = -1
  const timings = [...clip?.beats ?? []]
  const spoken = (word: string) => word.toLowerCase().replace(/[.,!?]+$/, '')
  const positions = scene.beats.map(({ word }) => {
    previous = tokens.indexOf(word, previous + 1)
    const timed = timings.findIndex((beat) => spoken(beat.word) === spoken(word))
    return { index: previous, time: timed === -1 ? undefined : timings.splice(timed, 1)[0].atMs }
  })
  let anchor = { index: 0, time: 0 }
  return positions.map(({ index, time }, i) => {
    if (time !== undefined) {
      anchor = { index, time }
      return time
    }
    const next = positions.slice(i + 1).find((beat) => beat.time !== undefined)
    const endIndex = next?.index ?? tokens.length
    const endTime = next?.time ?? duration
    return anchor.time + (endTime - anchor.time) * (index - anchor.index) / (endIndex - anchor.index)
  })
}
export function sceneFrame(ms: number, duration: number, beats: number[]): Frame {
  const time = Math.min(duration, Math.max(0, ms))
  const reached = beats.filter((beat) => beat <= time).length
  return { progress: time / duration, seconds: time / 1000, reached,
    sinceBeat: reached ? time - beats[reached - 1] : 0 }
}

// Audio events control sampling. Seeking is also visible while playback is held.
export class AudioSceneClock {
  private running = false
  private position = 0
  constructor(private audio: Pick<HTMLAudioElement, 'currentTime'>) {}
  sample() {
    if (this.running) this.seek()
    return this.position
  }
  start() { this.running = true; return this.sample() }
  hold() { this.running = false; return this.seek() }
  seek() { return this.position = this.audio.currentTime * 1000 }
}
