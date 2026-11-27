import { useEffect, useState } from 'preact/hooks'
import { SolutionPlayer } from '../components/player/SolutionPlayer'
import { PART_LABELS, type ConceptLesson as Lesson, type LessonIndexEntry } from '../lib/conceptLessons'
import { registerSavedQuestions } from '../lib/data'
import { loadLessonIndex } from '../lib/lessonIndex'
import { renderMathText } from '../lib/mathText'
import { chapterName } from '../lib/modes'
import { getSubject } from '../lib/subjects'
import type { Animation, AnimationStep } from '../lib/types'
import { Panel } from './Modes'
import '../styles/lesson.css'

type Loaded = { entry: LessonIndexEntry; lesson: Lesson }

function toAnimation(lesson: Lesson): Animation {
  const steps = lesson.steps.map((step, i): AnimationStep => ({
    n: i + 1,
    display: step.display,
    tag: PART_LABELS[step.part],
    // The part name leads each step's heading, so students always know where they are in the lesson.
    title: step.title && !/^(picture it|remember this)$/i.test(step.title) ? `${PART_LABELS[step.part]} · ${step.title}` : PART_LABELS[step.part],
    working: step.working,
    narration: step.narration,
  }))
  return { id: lesson.id, questionId: lesson.id, kind: 'concept', stepSeconds: 6, steps: steps as Animation['steps'] }
}

async function loadLesson(id: string): Promise<Loaded | null> {
  const entry = (await loadLessonIndex()).find((item) => item.id === id)
  if (!entry) return null
  const res = await fetch(import.meta.env.BASE_URL + `data/lessons-${entry.subject}.json`).catch(() => null)
  if (!res?.ok) return null
  const doc = await res.json() as { lessons: Lesson[] }
  const lesson = doc.lessons.find((item) => item.id === id)
  if (!lesson) return null
  registerSavedQuestions([], [toAnimation(lesson)])
  return { entry, lesson }
}

function QuickCheck({ lesson }: { lesson: Lesson }) {
  const [picked, setPicked] = useState<string | null>(null)
  const check = lesson.quickCheck
  return (
    <section class="jp-card jp-lesson-check" aria-labelledby="jp-lesson-check-title">
      <h2 id="jp-lesson-check-title" class="jp-lesson-check-title">Quick check</h2>
      <p class="jp-lesson-check-stem">{renderMathText(check.stem)}</p>
      <div class="jp-lesson-check-options" role="group" aria-label="Options">
        {check.options.map((option, i) => {
          const state = !picked ? '' : option.id === check.answerId ? 'correct' : option.id === picked ? 'wrong' : 'dim'
          return <div key={option.id} class="jp-lesson-check-option" data-state={state}>
            <button type="button" disabled={Boolean(picked)} aria-pressed={picked === option.id} onClick={() => setPicked(option.id)}>
              <b>{String.fromCharCode(65 + i)}</b> {renderMathText(option.text)}
            </button>
            {picked && <p>{renderMathText(option.why)}</p>}
          </div>
        })}
      </div>
      {picked && <button type="button" class="jp-link-btn" onClick={() => setPicked(null)}>Try again</button>}
    </section>
  )
}

export function ConceptLesson({ id }: { id: string }) {
  const [state, setState] = useState<'loading' | 'missing' | Loaded>('loading')
  useEffect(() => {
    let active = true
    void loadLesson(id).then((loaded) => { if (active) setState(loaded ?? 'missing') })
    return () => { active = false }
  }, [id])

  if (state === 'loading' || state === 'missing') return (
    <Panel title="Lesson" back="#/">
      <p class="jp-mode-lead" role="status">{state === 'loading' ? 'Loading lesson…' : 'This lesson could not be found. Check your connection and try again.'}</p>
    </Panel>
  )

  const { entry, lesson } = state
  const subjectName = getSubject(entry.subject)?.name ?? entry.subject
  const studyHref = '#/study?subject=' + encodeURIComponent(entry.subject)
  const practiceHref = '#/practice?' + new URLSearchParams({ subject: entry.subject, chapter: entry.practiceChapter })
  return (
    <Panel title={lesson.title} subtitle={`${subjectName} · concept lesson · about ${lesson.minutes} minutes`}
      back={studyHref} backLabel={subjectName + ' study'}>
      <ol class="jp-lesson-parts" aria-label="In this lesson">
        {(['like-five', 'rules', 'example-1', 'example-2', 'watch-out', 'conclusion'] as const)
          .filter((part) => lesson.steps.some((step) => step.part === part))
          .map((part) => <li key={part}>{PART_LABELS[part]}</li>)}
      </ol>
      <SolutionPlayer animationId={lesson.id} open onToggleOpen={() => {}} />
      <QuickCheck lesson={lesson} />
      {entry.practiceCount > 0 && <a class="jp-btn jp-btn--primary jp-btn--full" href={practiceHref}>
        Practise {entry.practiceCount} questions on {chapterName(entry.subject, entry.practiceChapter)} →
      </a>}
    </Panel>
  )
}
