import { describe, expect, it } from 'vitest'
import heart from '../../../../../lessons-bank/biology-heart.json'
import nephron from '../../../../../lessons-bank/biology-nephron.json'
import inheritance from '../../../../../lessons-bank/biology-inheritance.json'
import base from '../../../../../data/subjects/questions-biology.json'
import jamb from '../../../../../data/subjects/questions-biology-jamb-100.json'
import science from '../../../../../data/subjects/questions-biology-jamb-150.json'
import followUps from '../../../../../data/subjects/questions-biology-teachme.json'
import { fallbackMs, beatTimes } from '../lesson'
import { biologyMapping, followUpIds } from './mapping'
import { teachMeButton } from './TeachMe'

const topics = [heart, nephron, inheritance]
const lessons = topics.flatMap(({ lessons }) => lessons)
const questions = new Set([base, jamb, science, followUps].flatMap(({ questions }) => questions.map(({ id }) => id)))

describe('Biology Teach me pilot', () => {
  it('links real Biology questions to real clips with an application line and three distinct follow-ups', () => {
    for (const [id, entry] of Object.entries(biologyMapping)) {
      expect(questions.has(id), id).toBe(true)
      expect(entry?.applies.trim(), id).toBeTruthy()
      expect(lessons.some((lesson) => lesson.id === entry?.clipId), id).toBe(true)
      const more = followUpIds(entry!.clipId, id)
      expect(more).not.toContain(id)
      expect(new Set(more).size).toBeGreaterThanOrEqual(3)
    }
  })

  it('uses the primary button after a wrong answer and the normal button after a right answer', () => {
    const id = 'bio-jamb-2010-017'
    expect(teachMeButton('biology', id, false)?.className).toBe('jp-btn jp-btn--primary')
    expect(teachMeButton('biology', id, true)?.className).toBe('jp-btn')
    expect(teachMeButton('biology', id, undefined)).toBeUndefined()
    expect(teachMeButton('physics', id, false)).toBeUndefined()
    expect(teachMeButton('biology', 'bio-jamb-2010-002', false)).toBeUndefined()
  })

  it('keys the systemic circulation question to the left ventricle', () => {
    const question = science.questions.find(({ id }) => id === 'bio-jamb-2010-017')!
    expect(question.options.find(({ id }) => id === question.answerId)?.text).toBe('Left ventricle')
    expect(question.removeOrder).not.toContain(question.answerId)
  })

  it('advertises the silent runtime and has a cue for every beat', () => {
    for (const { id, scenes } of lessons) {
      const seconds = Math.round(scenes.reduce((ms, scene) => ms + fallbackMs(scene), 0) / 1000)
      expect(seconds).toBeGreaterThanOrEqual(30)
      expect(seconds).toBeLessThanOrEqual(50)
      const question = Object.keys(biologyMapping).find((key) => biologyMapping[key]?.clipId === id)!
      expect(teachMeButton('biology', question, false)?.text).toBe('Teach me · ' + seconds + ' sec')
      for (const scene of scenes) {
        const duration = fallbackMs(scene)
        const times = beatTimes(scene, duration)
        let previous = -1
        for (const time of times) {
          expect(time, scene.id).toBeGreaterThan(previous)
          expect(time, scene.id).toBeLessThan(duration)
          previous = time
        }
      }
    }
  })
})
