import type { ComponentChildren } from 'preact'
import { useEffect, useState } from 'preact/hooks'
import { Feedback } from '../components/share/Feedback'
import { TryItCard, studyInteractive } from '../components/try-it/TryItCard'
import { getQuestion, getQuestionsBySubject, isSubjectLoaded, loadSubject } from '../lib/data'
import {
  MAX_CUSTOM_MINUTES, chapterName, continueExam, getAttempt, getChapters, getPracticeSettings,
  getQuestionChapter, getRecent, getSections, hasStudied, parseCustomWholeNumber, practicePool,
  practiceQueue, remember, savePracticeSettings, startAttempt, studyLink, type PracticeSettings,
} from '../lib/modes'
import { logEvent } from '../lib/store'
import { getSubject } from '../lib/subjects'
import { Session } from './Session'
import '../styles/modes.css'

type ModeAccent = 'study' | 'practice' | 'exam' | 'resume'

const MODE_ICON_PATHS: Record<ModeAccent, string> = {
  study: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z',
  practice: 'M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11',
  exam: 'M12 8v4l3 2M12 22a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM9 2h6',
  resume: 'M5 12h14M13 5l7 7-7 7',
}

function ModeIcon({ accent }: { accent: ModeAccent }) {
  return (
    <span class={`jp-mode-icon jp-mode-icon--${accent}`} aria-hidden="true">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d={MODE_ICON_PATHS[accent]} />
      </svg>
    </span>
  )
}

export function Panel({ title, subtitle, back = '#/modes', children }: {
  title: string; subtitle?: string; back?: string; children?: ComponentChildren
}) {
  return (
    <div class="jp-mode-page">
      <header class="jp-mode-header">
        <div class="jp-mode-header-inner">
          <div class="jp-mode-brand">
            <a class="jp-mode-back" href={back} aria-label="Back">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </a>
            <a class="jp-logo" href="#/modes" aria-label="JP modes">JP</a>
            <a class="jp-mode-wordmark" href="#/">JAMB Practice</a>
          </div>
        </div>
      </header>
      <main class="jp-mode-main">
        <div class="jp-mode-hero">
          <h1 class="jp-mode-title">{title}</h1>
          {subtitle && <p class="jp-mode-lead">{subtitle}</p>}
        </div>
        {children}
      </main>
    </div>
  )
}

export function ModeCard({ href, title, pill, accent, children }: {
  href: string; title: string; pill?: string | null; accent?: ModeAccent; children?: ComponentChildren
}) {
  return (
    <a class="jp-mode-card" href={href}>
      {accent && <ModeIcon accent={accent} />}
      <div class="jp-mode-card-body">
        {pill && <span class="jp-pill jp-pill--practice jp-pill--review">{pill}</span>}
        <strong class="jp-mode-card-title">{title}</strong>
        {children && <span class="jp-mode-card-sub">{children}</span>}
      </div>
      <svg class="jp-mode-card-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="m9 18 6-6-6-6" />
      </svg>
    </a>
  )
}

export function ModeHome() {
  const recent = getRecent()
  return (
    <Panel title="How do you want to learn?" subtitle="Choose a study path built for JAMB UTME." back="#/">
      <div class="jp-mode-grid">
        <ModeCard href="#/subjects?mode=study" title="Study" accent="study">Learn it chapter by chapter</ModeCard>
        <ModeCard href="#/subjects?mode=practice" title="Practice" accent="practice">Drill questions your way</ModeCard>
        <ModeCard href="#/exam" title="Exam" accent="exam">Sit a timed JAMB-style test</ModeCard>
      </div>
      {getAttempt('exam') && <button class="jp-btn jp-btn--primary jp-btn--full" onClick={continueExam}>Continue your exam</button>}
      {recent && recent.href !== '#/exam/run' &&
        <ModeCard href={recent.href} title="Continue where you stopped" accent="resume">{recent.label}</ModeCard>}
      <div class="jp-mode-footer-links">
        <Feedback screen="Mode selection" />
      </div>
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
    const mirrorQuestion = subject === 'physics' ? getQuestion('phys-jamb-0018') : undefined
    const interactive = !concept && studyInteractive(subject, chapter, mirrorQuestion && getQuestionChapter(mirrorQuestion))
    return (
      <Panel title={concept ?? chapterName(subject, chapter)} back={chaptersHref}>
        {chapterQuestions.length ? <div class="jp-mode-list">
          {interactive && <>
            <h2 class="jp-revisit-title">Questions</h2>
            <TryItCard interactive={interactive} practiceHref={'#/practice?' + new URLSearchParams({ subject, chapter })} />
          </>}
          {chapterQuestions.map((question, index) => (
            <ModeCard key={question.id} href={studyLink(subject, chapter, concept ?? undefined) + '&id=' + encodeURIComponent(question.id)}
              title={`Question ${index + 1}`}>{question.concept ?? question.topic}</ModeCard>
          ))}
        </div> : <p class="jp-mode-lead">This chapter has no available questions.</p>}
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
      <section class="jp-card" aria-label="Study progress">
        <p class="jp-summary-sub">{studied} of {chapters.length} chapters studied</p>
        <div class="jp-progress-track" aria-hidden="true" style={{ marginTop: '8px' }}>
          <div class="jp-progress-fill" style={{ width: chapters.length ? studied * 100 / chapters.length + '%' : '0%' }} />
        </div>
      </section>
      {sections.length === 0 && topicChapters.length === 0 ? (
        <p class="jp-mode-lead">No study chapters are available for this subject yet.</p>
      ) : sections.length === 0 ? (
        <section class="jp-mode-list" aria-label="Topics">
          <h2 class="jp-revisit-title">Topics</h2>
          {topicChapters.map((entry) => (
            <ModeCard key={entry.id} href={studyLink(subject, entry.id)} title={entry.title}>
              {hasStudied(subject, entry.id) && <span class="jp-mode-studied" aria-label="Studied">✓ Studied</span>}
            </ModeCard>
          ))}
        </section>
      ) : <>
        <div class="jp-pills" role="group" aria-label="Study view">
          <button class={`jp-btn ${conceptView ? '' : 'jp-btn--primary'}`} aria-pressed={!conceptView} onClick={() => setConceptView(false)}>Chapters</button>
          <button class={`jp-btn ${conceptView ? 'jp-btn--primary' : ''}`} aria-pressed={conceptView} onClick={() => setConceptView(true)}>Concepts</button>
        </div>
        {conceptView ? <div class="jp-mode-list">
          {sections.flatMap((section) => section.chapters.flatMap((entry) => entry.concepts
            .filter((concept) => questions.some((question) => question.chapter === entry.id && question.concept === concept))
            .map((concept) => <ModeCard key={entry.id + concept} href={studyLink(subject, entry.id, concept)} title={concept}>{entry.title}</ModeCard>)))}
        </div> : sections.map((section) => <section class="jp-mode-list" key={section.id}>
          <h2 class="jp-revisit-title">{section.id} · {section.title}</h2>
          {section.chapters.map((entry) => <ModeCard key={entry.id} href={studyLink(subject, entry.id)}
            title={`${entry.number}. ${entry.title}`}>
            {hasStudied(subject, entry.id) && <span class="jp-mode-studied" aria-label="Studied">✓ Studied</span>}
          </ModeCard>)}
        </section>)}
      </>}
    </Panel>
  )
}

export function PracticeSetup({ subject, chapter }: { subject: string; chapter: string | null }) {
  const status = useSubjects([subject])
  const [settings, setSettings] = useState(() => {
    const saved = getPracticeSettings(subject)
    return chapter ? { ...saved, chapters: [chapter] } : saved
  })
  const questions = getQuestionsBySubject(subject)
  const hasSyllabus = getSections(subject).length > 0
  const chapters = getChapters(subject, questions)
  const eligible = practicePool(questions, settings).length
  const isCustomCount =
    settings.countMode === 'custom' ||
    (settings.count !== 5 && settings.count !== 10 && settings.count !== 'all')
  const isCustomMinutes =
    settings.minutesMode === 'custom' ||
    (settings.minutes !== 0 && settings.minutes !== 10 && settings.minutes !== 20 && settings.minutes !== 30)
  const countText = settings.customCount ?? (isCustomCount ? String(settings.count) : '')
  const minutesText = settings.customMinutes ?? (isCustomMinutes ? String(settings.minutes) : '')
  const parsedCount = isCustomCount
    ? parseCustomWholeNumber(countText, 1, eligible, 'questions')
    : { value: Math.min(eligible, settings.count === 'all' ? eligible : settings.count), error: null }
  const parsedMinutes = isCustomMinutes
    ? parseCustomWholeNumber(minutesText, 1, MAX_CUSTOM_MINUTES, 'minutes')
    : { value: settings.minutes, error: null }
  const count = parsedCount.value ?? 0
  const startDisabled = eligible === 0 || parsedCount.value === null || parsedMinutes.value === null
  const apply = (patch: Partial<PracticeSettings>) => {
    const next = { ...settings, ...patch }
    setSettings(next)
    savePracticeSettings(subject, next)
  }
  const start = () => {
    if (startDisabled || parsedCount.value === null || parsedMinutes.value === null) return
    const runSettings: PracticeSettings = { ...settings, count: parsedCount.value, minutes: parsedMinutes.value }
    const queue = practiceQueue(subject, questions, runSettings)
    if (!queue.length) return
    logEvent('session_start', { count: queue.length, questionIds: queue.map(({ id }) => id).join(',') })
    startAttempt('practice', [subject], queue, parsedMinutes.value)
    window.location.hash = '#/practice/run'
  }
  return (
    <Panel title={(getSubject(subject)?.name ?? subject) + ' practice'} back="#/subjects?mode=practice">
      {status !== 'ready' || !questions.length ? <p class="jp-mode-lead">
        {status === 'loading' ? 'Loading questions…' : status === 'error' ? 'Could not load questions.' : 'No complete questions are available yet.'}
      </p> : <>
        {chapters.length > 0 && <fieldset class="jp-mode-section">
          <legend class="jp-revisit-title">{hasSyllabus ? 'Chapters' : 'Topics'}</legend>
          <div class="jp-mode-section-body">
            <div><button class={`jp-btn ${settings.chapters.length ? '' : 'jp-btn--primary'}`}
              aria-pressed={settings.chapters.length === 0} onClick={() => apply({ chapters: [] })}>
              {hasSyllabus ? 'All chapters' : 'All topics'}
            </button></div>
            <div class="jp-mode-checks">
              {chapters.map((chapter) => <label key={chapter.id} class="jp-mode-check">
                <input type="checkbox" checked={settings.chapters.includes(chapter.id)} onChange={() =>
                  apply({ chapters: settings.chapters.includes(chapter.id)
                    ? settings.chapters.filter((id) => id !== chapter.id)
                    : [...settings.chapters, chapter.id] })} />
                <span>{chapter.title}</span>
              </label>)}
            </div>
          </div>
        </fieldset>}
        <fieldset class="jp-mode-section">
          <legend class="jp-revisit-title">Number of questions</legend>
          <div class="jp-mode-section-body">
            <div class="jp-pills">
              {([5, 10, 'all'] as const).map((value) => {
                const active = !isCustomCount && settings.count === value
                return <button key={value} type="button"
                  class={`jp-btn ${active ? 'jp-btn--primary' : ''}`} aria-pressed={active}
                  onClick={() => apply({ count: value, countMode: undefined })}>{value === 'all' ? 'All' : value}</button>
              })}
              <button type="button"
                class={`jp-btn ${isCustomCount ? 'jp-btn--primary' : ''}`} aria-pressed={isCustomCount}
                onClick={() => {
                  const parsed = parseCustomWholeNumber(countText, 1, eligible, 'questions')
                  apply({
                    countMode: 'custom',
                    customCount: countText,
                    count: parsed.value ?? settings.count,
                  })
                }}>Custom</button>
            </div>
            {isCustomCount && (
              <>
                <div class="jp-mode-custom">
                  <input
                    type="text"
                    inputmode="numeric"
                    pattern="[0-9]*"
                    class="jp-mode-custom-input"
                    aria-label="Custom number of questions"
                    aria-invalid={parsedCount.error ? 'true' : undefined}
                    placeholder={eligible > 0 ? `1–${eligible}` : '0'}
                    value={countText}
                    onInput={(event) => {
                      const raw = event.currentTarget.value
                      const parsed = parseCustomWholeNumber(raw, 1, eligible, 'questions')
                      apply({
                        countMode: 'custom',
                        customCount: raw,
                        count: parsed.value ?? settings.count,
                      })
                    }}
                  />
                  <span class="jp-mode-custom-hint">{eligible} available</span>
                </div>
                {parsedCount.error && <p class="jp-mode-error" role="alert">{parsedCount.error}</p>}
              </>
            )}
          </div>
        </fieldset>
        <fieldset class="jp-mode-section">
          <legend class="jp-revisit-title">Timer</legend>
          <div class="jp-mode-section-body">
            <div class="jp-pills">
              {([0, 10, 20, 30] as const).map((value) => {
                const active = !isCustomMinutes && settings.minutes === value
                return <button key={value} type="button"
                  class={`jp-btn ${active ? 'jp-btn--primary' : ''}`} aria-pressed={active}
                  onClick={() => apply({ minutes: value, minutesMode: undefined })}>{value ? value + ' min' : 'Off'}</button>
              })}
              <button type="button"
                class={`jp-btn ${isCustomMinutes ? 'jp-btn--primary' : ''}`} aria-pressed={isCustomMinutes}
                onClick={() => {
                  const parsed = parseCustomWholeNumber(minutesText, 1, MAX_CUSTOM_MINUTES, 'minutes')
                  apply({
                    minutesMode: 'custom',
                    customMinutes: minutesText,
                    minutes: parsed.value ?? settings.minutes,
                  })
                }}>Custom</button>
            </div>
            {isCustomMinutes && (
              <>
                <div class="jp-mode-custom">
                  <input
                    type="text"
                    inputmode="numeric"
                    pattern="[0-9]*"
                    class="jp-mode-custom-input"
                    aria-label="Custom timer in minutes"
                    aria-invalid={parsedMinutes.error ? 'true' : undefined}
                    placeholder="1–180"
                    value={minutesText}
                    onInput={(event) => {
                      const raw = event.currentTarget.value
                      const parsed = parseCustomWholeNumber(raw, 1, MAX_CUSTOM_MINUTES, 'minutes')
                      apply({
                        minutesMode: 'custom',
                        customMinutes: raw,
                        minutes: parsed.value ?? settings.minutes,
                      })
                    }}
                  />
                  <span class="jp-mode-custom-hint">minutes (1–{MAX_CUSTOM_MINUTES})</span>
                </div>
                {parsedMinutes.error && <p class="jp-mode-error" role="alert">{parsedMinutes.error}</p>}
              </>
            )}
          </div>
        </fieldset>
        {getAttempt('practice') && <div class="jp-mode-footer-links"><a class="jp-link-btn" href="#/practice/run">Resume current practice</a></div>}
        <button class="jp-btn jp-btn--primary jp-btn--full" disabled={startDisabled} onClick={start}>
          {startDisabled ? 'Start practice' : `Start ${count}-question practice`}
        </button>
      </>}
    </Panel>
  )
}
