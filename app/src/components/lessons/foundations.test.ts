import { describe, expect, it } from 'vitest'
import bank from '../../../../lessons-bank/english-foundations.json'
import dictionary from '../../../../lessons-bank/english-oral-words.json'
import { hasCompletedConceptLesson, hasCompletedInteractive, hasStartedConceptLesson,
  completeConceptLesson, markInteractiveCompleted, startConceptLesson } from '../../lib/modes'
import { foundationSection } from './foundations-topics'
import { beatTimes, fallbackMs, lessonScenes, spokenToken, wordCues, wordMarker, words } from './lesson'
import type { Clip, Lesson, Scene } from './lesson'

const lessons = bank.lessons as unknown as Lesson[]
const pronunciationIds = new Set(dictionary.map(({ id }) => id))
describe('English Foundations lesson data', () => {
  it('matches the ten Study topics and preserves unique scene IDs and real question sources', () => {
    expect(lessons.map(({ id, title }) => ({ id, title }))).toEqual(foundationSection.chapters.map(({ id, title }) => ({ id, title })))
    const identifiers = new Set<string>()
    for (const lesson of lessons) {
      for (const playerLesson of [lesson, ...(lesson.supplement ? [{ ...lesson.supplement, id: lesson.id }] : [])]) {
        const q = playerLesson.pastQuestion!
        expect(q.year).toBeGreaterThanOrEqual(2010)
        expect(q.number).toBeGreaterThan(0)
        expect(q.options).toHaveLength(4)
        expect(q.answer).toMatch(/^[ABCD]$/)
        expect(q.source.file).toBe('JAMB-USE-OF-ENGLISH-PAST-QUESTIONS.pdf')
        expect(q.source.page).toBeGreaterThan(0)
        expect(q.source.keyPage).toBeGreaterThanOrEqual(q.source.page)
        for (const s of lessonScenes(playerLesson)) {
          expect(s.id).toMatch(new RegExp('^' + lesson.id + '-'))
          expect(identifiers.has(s.id), s.id).toBe(false)
          identifiers.add(s.id)
          expect(s.show.trim()).toBeTruthy()
          expect(s.say.trim()).toBeTruthy()
        }
      }
    }
    expect(identifiers.size).toBeGreaterThan(60)
  })

  it('resolves every word token and finds every beat in narration order, including attached punctuation', () => {
    for (const lesson of lessons) {
      const scenes = [...lessonScenes(lesson), ...lesson.supplement ? lessonScenes({ ...lesson.supplement, id: lesson.id }) : []]
      for (const scene of scenes) {
        const matches = [...scene.say.matchAll(wordMarker)]
        expect(matches).toHaveLength((scene.say.match(/\{\{word:/g) ?? []).length)
        for (const [, id] of matches) expect(pronunciationIds.has(id), scene.id + ' ' + id).toBe(true)
        const tokens = words(scene.say).map(spokenToken)
        let previous = -1
        for (const beat of scene.beats) {
          const position = tokens.indexOf(spokenToken(beat.word), previous + 1)
          expect(position, scene.id + ' ' + beat.word).toBeGreaterThan(previous)
          previous = position
        }
        expect(beatTimes(scene, fallbackMs(scene)).every((time) => time >= 0 && time < fallbackMs(scene))).toBe(true)
      }
    }
  })

  it('uses a timed word cue when provided and word-count positions for the silent player', () => {
    const scene: Scene = { id: 'english-demo', say: 'Try {{word:box}} then {{word:ship}}.', show: 'Two words', visual: 'english', beats: [] }
    const clip: Clip = { sceneId: scene.id, durationMs: 1600, beats: [{ word: '{{word:box}}', atMs: 220 }] }
    expect(wordCues(scene, fallbackMs(scene))).toEqual([{ id: 'box', atMs: 400 }, { id: 'ship', atMs: 1200 }])
    expect(wordCues(scene, clip.durationMs, clip)[0]).toEqual({ id: 'box', atMs: 220 })
    const repeated = { ...scene, say: 'Try {{word:box}} then {{word:box}}.' }
    const twice = { ...clip, beats: [...clip.beats, { word: '{{word:box}}', atMs: 1300 }] }
    expect(wordCues(repeated, clip.durationMs, twice).map(({ atMs }) => atMs)).toEqual([220, 1300])
  })

  it('records starting, lesson completion, and activity completion separately', () => {
    const id = 'english-foundations-test'
    startConceptLesson(id)
    expect(hasStartedConceptLesson(id)).toBe(true)
    expect(hasCompletedConceptLesson(id)).toBe(false)
    completeConceptLesson('english', id, id, [id])
    expect(hasCompletedConceptLesson(id)).toBe(true)
    expect(hasCompletedInteractive('english', id)).toBe(false)
    markInteractiveCompleted('english', id)
    expect(hasCompletedInteractive('english', id)).toBe(true)
  })
})
