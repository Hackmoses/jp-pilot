// Concept lessons: short voiced lessons that teach the idea behind a family of questions
// (data/<subject>-lessons.json). This file has no imports so build scripts can load it too.

export type LessonPart = 'like-five' | 'rules' | 'example-1' | 'example-2' | 'watch-out' | 'conclusion'

// A hand-drawn diagram for a step. Each beat draws one part of the drawing in when the voice
// reaches its word. Parts numbered below \`chapter\` (part-<n>-x with n < chapter) are already drawn.
export type StepFigure = { drawing: string; chapter: number; beats: { word: string; cue: string }[] }

export type LessonStep = {
  n: number
  part: LessonPart
  tag: string
  title?: string
  display: string
  working?: string[]
  narration: string
  figure?: StepFigure
}

export type QuickCheck = {
  questionId?: string
  written?: boolean
  stem: string
  options: { id: 'a' | 'b' | 'c' | 'd'; text: string; why: string }[]
  answerId: 'a' | 'b' | 'c' | 'd'
}

export type ConceptLesson = {
  id: string
  title: string
  minutes: number
  chapters: string[]
  alsoLinks?: { subject: string; chapter: string }[]
  keywords: string[]
  steps: LessonStep[]
  quickCheck: QuickCheck
}

export type LessonIndexEntry = {
  id: string
  title: string
  subject: string
  minutes: number
  chapters: string[]
  alsoLinks: { subject: string; chapter: string }[]
  keywords: string[]
  practiceChapter: string
  practiceCount: number
}

export const PART_LABELS: Record<LessonPart, string> = {
  'like-five': 'Like you’re five',
  rules: 'The rules',
  'example-1': 'Example 1',
  'example-2': 'Example 2',
  'watch-out': 'Watch out',
  conclusion: 'Remember',
}

type QuestionLike = { subject: string; topic?: string; concept?: string }

// The lesson for a question: same subject and chapter (or a cross-subject link). When a chapter has
// more than one lesson, the question's topic and concept must mention one of the lesson's keywords.
export function lessonFor(question: QuestionLike, chapter: string, lessons: readonly LessonIndexEntry[]) {
  const candidates = lessons.filter((lesson) =>
    (lesson.subject === question.subject && lesson.chapters.includes(chapter)) ||
    lesson.alsoLinks.some((link) => link.subject === question.subject && link.chapter === chapter))
  if (candidates.length <= 1) return candidates[0]
  const text = ((question.topic ?? '') + ' ' + (question.concept ?? '')).toLowerCase()
  let best: LessonIndexEntry | undefined
  let bestScore = 0
  for (const lesson of candidates) {
    const score = lesson.keywords.filter((word) => text.includes(word.toLowerCase())).length
    if (score > bestScore) { best = lesson; bestScore = score }
  }
  return best
}
