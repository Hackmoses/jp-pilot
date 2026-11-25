import physics from '../../../../lessons-bank/physics-12-waves.json'
import chemistry from '../../../../lessons-bank/chemistry-2-mole.json'
import { describe, expect, it } from 'vitest'
import { AudioSceneClock, beatTimes, fallbackMs, lessonScenes, sceneFrame, words } from './lesson'
import type { Clip, Topic } from './lesson'
import { conceptLessonTopic, STUDY_TOPICS } from '../../lib/sections'
import { completeConceptLesson, hasStudied, markInteractiveCompleted } from '../../lib/modes'

const topics = [physics, chemistry] as unknown as Topic[]
describe('concept lessons', () => {
  it('has stable unique scene IDs, ordered beat words and a keyed source for each past question', () => {
    const ids = new Set<string>()
    for (const topic of topics) {
      expect(topic.lessons).toHaveLength(5)
      for (const lesson of topic.lessons) {
        expect(lesson.scenes.length).toBeGreaterThanOrEqual(3)
        expect(lesson.scenes.length).toBeLessThanOrEqual(5)
        const count = lesson.scenes.flatMap(({ say }) => words(say)).length
        expect(count).toBeGreaterThanOrEqual(150)
        expect(count).toBeLessThanOrEqual(220)
        const question = lesson.pastQuestion
        if (question) {
          expect(question.source.file).toMatch(/^JAMB-.*-PAST-QUESTIONS\.pdf$/)
          expect(question.year).toBeGreaterThanOrEqual(2010)
          expect(question.source.page).toBeGreaterThan(0)
          expect(question.source.keyPage).toBeGreaterThanOrEqual(question.source.page)
          expect(question.number).toBeGreaterThan(0)
          expect(question.options).toHaveLength(4)
          expect(question.answer).toMatch(/^[ABCD]$/)
          expect(question.scenes.length).toBeGreaterThanOrEqual(2)
          expect(question.scenes.length).toBeLessThanOrEqual(4)
          expect(question.scenes.flatMap(({ say }) => words(say)).length).toBeGreaterThanOrEqual(80)
          expect(question.scenes.flatMap(({ say }) => words(say)).length).toBeLessThanOrEqual(120)
        }
        for (const scene of lessonScenes(lesson)) {
          expect(scene.id).toMatch(new RegExp('^' + lesson.id + '-[sq]\\d+$'))
          expect(ids.has(scene.id)).toBe(false)
          ids.add(scene.id)
          expect(scene.show.trim()).toBeTruthy()
          expect(scene.say.trim()).toBeTruthy()
          expect(scene.say).not.toMatch(/[\r\n]/)
          expect(scene.beats.length).toBeGreaterThanOrEqual(1)
          expect(scene.beats.length).toBeLessThanOrEqual(4)
          const tokens = words(scene.say)
          let previous = -1
          for (const beat of scene.beats) {
            const i = tokens.indexOf(beat.word, previous + 1)
            expect(i, scene.id + ' · ' + beat.word).toBeGreaterThan(previous)
            expect(beat.action.trim()).toBeTruthy()
            previous = i
          }
        }
      }
    }
  })
  it('keeps the pilot in Study and marks a topic after every concept lesson is complete', () => {
    for (const topic of [physics, chemistry]) {
      const { subject, topicId, lessons } = topic
      const ids = lessons.map(({ id }) => id)
      expect(STUDY_TOPICS[subject]).toContain(topicId)
      expect(conceptLessonTopic(subject, topicId)).toBeTruthy()
      markInteractiveCompleted(subject, topicId)
      expect(hasStudied(subject, topicId)).toBe(false)
      ids.slice(0, -1).forEach((id) => completeConceptLesson(subject, topicId, id, ids))
      expect(hasStudied(subject, topicId)).toBe(false)
      completeConceptLesson(subject, topicId, ids[ids.length - 1], ids)
      expect(hasStudied(subject, topicId)).toBe(true)
    }
  })
  it('estimates duration and beats using the words in the caption', () => {
    const scene = { id: 'test', show: 'Wave', visual: 'pulse', say: 'Wave moves and moves again.',
      beats: [{ word: 'moves', label: 'First', action: 'Move' }, { word: 'moves', label: 'Second', action: 'Move' }] }
    const duration = fallbackMs(scene)
    expect(duration).toBe(2000)
    expect(beatTimes(scene, duration)).toEqual([400, 1200])
    expect(sceneFrame(399, duration, [400, 1200]).reached).toBe(0)
    expect(sceneFrame(410, duration, [400, 1200])).toMatchObject({ reached: 1, sinceBeat: 10 })
    const clip: Clip = { sceneId: scene.id, durationMs: 5000, beats: [{ word: 'moves', atMs: 600 }] }
    expect(beatTimes(scene, clip.durationMs, clip)).toEqual([600, 2800])
  })
  it('samples media time, holds during pause and buffering, and updates on seek', () => {
    const audio = { currentTime: 0 }
    const clock = new AudioSceneClock(audio)
    const draw = () => sceneFrame(clock.sample(), 4000, [400, 2500])
    clock.start()
    audio.currentTime = 1
    expect(draw()).toMatchObject({ progress: 0.25, reached: 1 })
    clock.hold() // waiting
    audio.currentTime = 2
    expect(draw().progress).toBe(0.25)
    clock.start() // playing
    expect(draw().progress).toBe(0.5)
    clock.hold() // pause
    audio.currentTime = 3
    expect(draw().progress).toBe(0.5)
    clock.seek()
    expect(draw()).toMatchObject({ progress: 0.75, reached: 2 })
    audio.currentTime = 0
    clock.seek() // replay
    expect(draw()).toMatchObject({ progress: 0, reached: 0 })
  })
})
