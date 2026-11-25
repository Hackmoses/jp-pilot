import type { ComponentChildren } from 'preact'
import { useEffect, useState } from 'preact/hooks'
import { Feedback } from '../components/share/Feedback'
import { getQuestionsBySubject, isSubjectLoaded, loadSubject } from '../lib/data'
import {
  chapterName, continueExam, getAttempt, getChapters, getPracticeSettings, getQuestionChapter, getRecent,
  getSections, hasStudied, practicePool, practiceQueue, remember, savePracticeSettings,
  startAttempt, studyLink, type PracticeSettings,
} from '../lib/modes'
import { logEvent } from '../lib/store'
import { getSubject } from '../lib/subjects'
import { Session } from './Session'
import '../styles/modes.css'

export function Panel({ title, back = '#/modes', children }: {
  title: string; back?: string; children?: ComponentChildren
}) {
  return (
    <main class="jp-screen jp-mode-screen">
      <div class="jp-summary jp-mode-panel">
        <div class="jp-summary-brand">
          <a class="jp-logo" href="#/modes" aria-label="JP modes">JP</a>
          <a class="jp-link-btn" href={back}>Back</a>
        </div>
        <h1 class="jp-app-title">{title}</h1>
        {children}
      </div>
    </main>
  )
}

export function ModeCard({ href, title, pill, children }: {
  href: string; title: string; pill?: string | null; children?: ComponentChildren
}) {
  return (
    <a class="jp-option jp-mode-card" href={href}>
      {pill && <span class="jp-pill jp-pill--practice jp-pill--review">{pill}</span>}
      <strong class="jp-option-text">{title}</strong>
      {children && <span class="jp-summary-sub">{children}</span>}
    </a>
  )
}

export function ModeHome() {
  const recent = getRecent()
  return (
    <Panel title="How do you want to learn?" back="#/">
      <div class="jp-mode-grid">
        <ModeCard href="#/subjects?mode=study" title="Study">Learn it chapter by chapter</ModeCard>
        <ModeCard href="#/subjects?mode=practice" title="Practice">Drill questions your way</ModeCard>
        <ModeCard href="#/exam" title="Exam">Sit a timed JAMB-style test</ModeCard>
      </div>
      {getAttempt('exam') && <button class="jp-btn" onClick={continueExam}>Continue your exam</button>}
      {recent && recent.href !== '#/exam/run' &&
        <ModeCard href={recent.href} title="Continue where you stopped">{recent.label}</ModeCard>}
      <Feedback screen="Mode selection" />
    </Panel>
  )
}

export function useSubjects(subjects: readonly string[]) {
  const [status, setStatus] = useState(() => subjects.every(isSubjectLoaded) ? 'ready' : 'loading')
  useEffect(() => {
    if (subjects.every(isSubjectLoaded)) return
    let active = true
    void Promise.all(subjects.map(loadSubject)).then((loaded) => {
      if (active) setStatus(loaded.every(Boolean) ? 'ready' : 'error')
    })
    return () => { active = false }
  }, [subjects.join(',')])
  return status
}

export function Study({ params }: { params: URLSearchParams }) {
  const subject = params.get('subject') ?? 'chemistry'
  const chapter = params.get('chapter')
  const concept = params.get('concept')
  const id = params.get('id')
  const status = useSubjects([subject])
  const [conceptView, setConceptView] = useState(false)
  const questions = getQuestionsBySubject(subject)
  const subjectName = getSubject(subject)?.name ?? subject
  const chaptersHref = '#/study?subject=' + encodeURIComponent(subject)
  const chapterQuestions = questions.filter((question) => getQuestionChapter(question) === chapter && (!concept || question.concept === concept))
  const visible = new Set(questions.map(getQuestionChapter))

  useEffect(() => {
    if (status === 'ready' && chapter && chapterQuestions.length && !id) {
      remember(studyLink(subject, chapter, concept ?? undefined), 'Study · ' + chapterName(subject, chapter))
    }
  }, [status, chapter, concept, id, subject])

  if (status !== 'ready') {
    return <Panel title={status === 'loading' ? 'Loading questions…' : 'Could not load questions'} back="#/subjects?mode=study" />
  }
  if (chapter) {
    if (id && chapterQuestions.some((question) => question.id === id)) {
      return <Session study={{ subject, chapter, concept: concept ?? undefined, id }} />
    }
    return (
      <Panel title={concept ?? chapterName(subject, chapter)} back={chaptersHref}>
        {chapterQuestions.length ? <div class="jp-options">
          {chapterQuestions.map((question, index) => (
            <ModeCard key={question.id} href={studyLink(subject, chapter, concept ?? undefined) + '&id=' + encodeURIComponent(question.id)}
              title={`Question ${index + 1}`}>{question.concept ?? question.topic}</ModeCard>
          ))}
        </div> : <p class="jp-summary-sub">This chapter has no available questions.</p>}
      </Panel>
    )
  }

  const sections = getSections(subject).map((section) => ({
    ...section, chapters: section.chapters.filter((entry) => visible.has(entry.id)),
  })).filter((section) => section.chapters.length)
  const topicChapters = sections.length === 0 ? getChapters(subject, questions) : []
  const chapters = sections.length ? sections.flatMap((section) => section.chapters) : topicChapters
  const studied = chapters.filter(({ id }) => hasStudied(subject, id)).length
  return (
    <Panel title={subjectName + ' study'} back="#/subjects?mode=study">
      <div class="jp-options">
        <p class="jp-summary-sub">{studied} of {chapters.length} chapters studied</p>
        <div class="jp-progress-track" aria-hidden="true">
          <div class="jp-progress-fill" style={{ width: chapters.length ? studied * 100 / chapters.length + '%' : '0%' }} />
        </div>
      </div>
      {sections.length === 0 && topicChapters.length === 0 ? (
        <p class="jp-summary-sub">No study chapters are available for this subject yet.</p>
      ) : sections.length === 0 ? (
        <section class="jp-options" aria-label="Topics">
          <h2 class="jp-revisit-title">Topics</h2>
          {topicChapters.map((entry) => (
            <ModeCard key={entry.id} href={studyLink(subject, entry.id)} title={entry.title}>
              {hasStudied(subject, entry.id) && <span aria-label="Studied">✓ Studied</span>}
            </ModeCard>
          ))}
        </section>
      ) : <>
        <div class="jp-pills" role="group" aria-label="Study view">
          <button class={`jp-btn ${conceptView ? '' : 'jp-btn--primary'}`} aria-pressed={!conceptView} onClick={() => setConceptView(false)}>Chapters</button>
          <button class={`jp-btn ${conceptView ? 'jp-btn--primary' : ''}`} aria-pressed={conceptView} onClick={() => setConceptView(true)}>Concepts</button>
        </div>
        {conceptView ? <div class="jp-options">
          {sections.flatMap((section) => section.chapters.flatMap((entry) => entry.concepts
            .filter((concept) => questions.some((question) => question.chapter === entry.id && question.concept === concept))
            .map((concept) => <ModeCard key={entry.id + concept} href={studyLink(subject, entry.id, concept)} title={concept}>{entry.title}</ModeCard>)))}
        </div> : sections.map((section) => <section class="jp-options" key={section.id}>
          <h2 class="jp-revisit-title">{section.id} · {section.title}</h2>
          {section.chapters.map((entry) => <ModeCard key={entry.id} href={studyLink(subject, entry.id)}
            title={`${entry.number}. ${entry.title}`}>
            {hasStudied(subject, entry.id) && <span aria-label="Studied">✓ Studied</span>}
          </ModeCard>)}
        </section>)}
      </>}
    </Panel>
  )
}

export function PracticeSetup({ subject }: { subject: string }) {
  const status = useSubjects([subject])
  const [settings, setSettings] = useState(() => getPracticeSettings(subject))
  const questions = getQuestionsBySubject(subject)
  const hasSyllabus = getSections(subject).length > 0
  const chapters = getChapters(subject, questions)
  const eligible = practicePool(questions, settings).length
  const count = Math.min(eligible, settings.count === 'all' ? eligible : settings.count)
  const apply = (patch: Partial<PracticeSettings>) => {
    const next = { ...settings, ...patch }
    setSettings(next)
    savePracticeSettings(subject, next)
  }
  const start = () => {
    const queue = practiceQueue(subject, questions, settings)
    if (!queue.length) return
    logEvent('session_start', { count: queue.length, questionIds: queue.map(({ id }) => id).join(',') })
    startAttempt('practice', [subject], queue, settings.minutes)
    window.location.hash = '#/practice/run'
  }
  return (
    <Panel title={(getSubject(subject)?.name ?? subject) + ' practice'} back="#/subjects?mode=practice">
      {status !== 'ready' || !questions.length ? <p class="jp-summary-sub">
        {status === 'loading' ? 'Loading questions…' : status === 'error' ? 'Could not load questions.' : 'No complete questions are available yet.'}
      </p> : <>
        {chapters.length > 0 && <fieldset class="jp-revisit">
          <legend class="jp-revisit-title">{hasSyllabus ? 'Chapters' : 'Topics'}</legend>
          <div><button class={`jp-btn ${settings.chapters.length ? '' : 'jp-btn--primary'}`}
            aria-pressed={settings.chapters.length === 0} onClick={() => apply({ chapters: [] })}>
            {hasSyllabus ? 'All chapters' : 'All topics'}
          </button></div>
          {chapters.map((chapter) => <label key={chapter.id} class="jp-mode-check">
            <input type="checkbox" checked={settings.chapters.includes(chapter.id)} onChange={() =>
              apply({ chapters: settings.chapters.includes(chapter.id)
                ? settings.chapters.filter((id) => id !== chapter.id)
                : [...settings.chapters, chapter.id] })} />
            {chapter.title}
          </label>)}
        </fieldset>}
        <fieldset class="jp-revisit">
          <legend class="jp-revisit-title">Number of questions</legend>
          <div class="jp-pills">
            {([5, 10, 'all'] as const).map((value) => <button key={value} type="button"
              class={`jp-btn ${settings.count === value ? 'jp-btn--primary' : ''}`} aria-pressed={settings.count === value}
              onClick={() => apply({ count: value })}>{value === 'all' ? 'All' : value}</button>)}
          </div>
        </fieldset>
        <fieldset class="jp-revisit">
          <legend class="jp-revisit-title">Timer</legend>
          <div class="jp-pills">
            {([0, 10, 20, 30] as const).map((value) => <button key={value} type="button"
              class={`jp-btn ${settings.minutes === value ? 'jp-btn--primary' : ''}`} aria-pressed={settings.minutes === value}
              onClick={() => apply({ minutes: value })}>{value ? value + ' min' : 'Off'}</button>)}
          </div>
        </fieldset>
        {getAttempt('practice') && <a class="jp-link-btn" href="#/practice/run">Resume current practice</a>}
        <button class="jp-btn jp-btn--primary" disabled={!count} onClick={start}>
          Start {count}-question practice
        </button>
      </>}
    </Panel>
  )
}
