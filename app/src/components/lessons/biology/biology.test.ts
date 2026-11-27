import { describe, expect, it } from 'vitest'
import catalogue from '../../../../../data/biology-clip-index.json'
import base from '../../../../../data/subjects/questions-biology.json'
import jamb from '../../../../../data/subjects/questions-biology-jamb-100.json'
import science from '../../../../../data/subjects/questions-biology-jamb-150.json'
import followUps from '../../../../../data/subjects/questions-biology-teachme.json'
import batch3 from '../../../../../data/subjects/questions-biology-jamb-50-batch-3.json'
import { conceptLessonTopic } from '../../../lib/sections'
import { fallbackMs, beatTimes } from '../lesson'
import type { Topic } from '../lesson'
import { biologyMapping, followUpIds } from './mapping'
import { teachMeButton } from './TeachMe'

const topics = Object.values(import.meta.glob<Topic>('../../../../../lessons-bank/biology-*.json', {
  eager: true, import: 'default',
}))
// Every question in the original banks has a clip. Later batches map only where a clip truly teaches the idea.
const coreBank = [base, jamb, science, followUps].flatMap(({ questions }) => questions.map(({ id }) => id))
const questionBank = [...coreBank, ...batch3.questions.map(({ id }) => id)]
const topicsById = new Map(topics.flatMap((topic) => topic.lessons.map((lesson) => [lesson.id, topic] as const)))
const drawingIds = new Set(['heart', 'nephron', 'inheritance', ...Object.keys(import.meta.glob('./drawings/*.tsx'))
  .map((path) => path.slice(path.lastIndexOf('/') + 1, -4))].map((id) => 'biology-' + id))

describe('Biology Teach me', () => {
  it('maps real Biology questions to real clips and keeps practice on the same topic', () => {
    const ids = Object.keys(biologyMapping)
    const bank = new Set(questionBank)
    for (const id of ids) {
      const entry = biologyMapping[id]!
      expect(bank.has(id), id).toBe(true)
      expect(entry.applies.trim(), id).toBeTruthy()
      expect(topicsById.has(entry.clipId), id).toBe(true)
      const more = followUpIds(entry.clipId, id)
      expect(more).not.toContain(id)
      expect(new Set(more).size).toBeGreaterThanOrEqual(3)
    }
    for (const id of coreBank) expect(ids, id).toContain(id)
    for (const clip of topicsById.keys()) {
      const count = followUpIds(clip).length
      expect(count, clip).toBeGreaterThanOrEqual(4)
      expect(count, clip).toBeLessThanOrEqual(10)
    }
  })

  it('uses the primary button after a wrong answer and the normal button after a right answer', () => {
    const id = 'bio-jamb-2010-017'
    expect(teachMeButton('biology', id, false)?.className).toBe('jp-btn jp-btn--primary')
    expect(teachMeButton('biology', id, true)?.className).toBe('jp-btn')
    expect(teachMeButton('biology', id, undefined)).toBeUndefined()
    expect(teachMeButton('physics', id, false)).toBeUndefined()
    expect(teachMeButton('biology', 'unknown', false)).toBeUndefined()
  })

  it('keeps the same set of clips in the catalogue and drawing registry', () => {
    expect(new Set(Object.keys(catalogue))).toEqual(new Set(topicsById.keys()))
    expect(drawingIds).toEqual(new Set(topicsById.keys()))
  })

  const clips = topics.flatMap(({ topicId, lessons }) => lessons.map(lesson => ({ ...lesson, topicId })))
  it.each(clips)('keeps $id in Study and agrees on timing and quick check', ({ id, topicId, scenes, quickCheck }) => {
    expect(conceptLessonTopic('biology', topicId!)).toBe('biology-study-' + topicId)
    const run = scenes.reduce((ms, scene) => ms + fallbackMs(scene), 0)
    expect(run, id).toBeGreaterThanOrEqual(40_000)
    // Existing insects scenes 1-4 already have voiced audio at 58.8s, so adding scene 5 runs to ~66s.
    expect(run, id).toBeLessThanOrEqual(id === 'biology-insects' ? 70_000 : 60_000)
    expect(scenes.length, id).toBeLessThanOrEqual(5)
    expect(quickCheck?.options[quickCheck.answerIndex], id).toBeTruthy()
    const question = followUpIds(id)[0]
    expect(teachMeButton('biology', question, false)?.text).toBe('Teach me · ' + Math.round(run / 1000) + ' sec')
    for (const scene of scenes) {
      const duration = fallbackMs(scene)
      let previous = -1
      for (const time of beatTimes(scene, duration)) {
        expect(time, scene.id).toBeGreaterThan(previous)
        expect(time, scene.id).toBeLessThan(duration)
        previous = time
      }
    }
  })
})
