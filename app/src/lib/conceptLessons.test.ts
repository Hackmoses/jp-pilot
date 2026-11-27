import { describe, expect, it } from 'vitest'
import { lessonFor, type LessonIndexEntry } from './conceptLessons'

const lesson = (id: string, subject: string, chapters: string[], keywords: string[], alsoLinks: LessonIndexEntry['alsoLinks'] = []) =>
  ({ id, title: id, subject, minutes: 3, chapters, keywords, alsoLinks, practiceChapter: chapters[0], practiceCount: 1 })
const lessons = [
  lesson('maths-indices', 'mathematics', ['3'], ['indices', 'standard form']),
  lesson('maths-logarithms', 'mathematics', ['3'], ['log', 'logarithm']),
  lesson('maths-progressions', 'mathematics', ['8'], ['progression']),
  lesson('chem-gas-laws', 'chemistry', ['3'], ['gas'], [{ subject: 'physics', chapter: '9' }]),
]

describe('concept lesson links', () => {
  it('uses the only lesson in a chapter', () => {
    expect(lessonFor({ subject: 'mathematics', topic: 'Sequences and series' }, '8', lessons)?.id).toBe('maths-progressions')
  })
  it('picks by keyword when a chapter has several lessons', () => {
    expect(lessonFor({ subject: 'mathematics', concept: 'Laws of logarithms' }, '3', lessons)?.id).toBe('maths-logarithms')
    expect(lessonFor({ subject: 'mathematics', concept: 'Standard form' }, '3', lessons)?.id).toBe('maths-indices')
  })
  it('gives no link rather than a wrong one', () => {
    expect(lessonFor({ subject: 'mathematics', concept: 'Rationalisation' }, '3', lessons)).toBeUndefined()
    expect(lessonFor({ subject: 'mathematics' }, '9', lessons)).toBeUndefined()
  })
  it('follows cross-subject links', () => {
    expect(lessonFor({ subject: 'physics', topic: 'Gas laws' }, '9', lessons)?.id).toBe('chem-gas-laws')
  })
})
