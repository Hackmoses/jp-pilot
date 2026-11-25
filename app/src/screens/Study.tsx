import { useEffect, useState } from 'preact/hooks'
import { TryItCard, studyInteractives } from '../components/try-it/TryItCard'
import { getQuestionsBySubject } from '../lib/data'
import { chapterName, getChapters, getQuestionChapter, getSections, hasStudied, remember, studyLink } from '../lib/modes'
import { getSubject } from '../lib/subjects'
import { ModeCard, Panel, useSubjects } from './Modes'
import { Session } from './Session'

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
    const interactives = concept ? [] : studyInteractives(subject, chapter)
    return (
      <Panel title={concept ?? chapterName(subject, chapter)} back={chaptersHref}>
        {chapterQuestions.length ? <div class="jp-mode-list">
          {interactives.length > 0 && <>
            <h2 class="jp-revisit-title">Interactive</h2>
            {interactives.map((interactive) => <TryItCard key={interactive.id ?? interactive.title}
              interactive={interactive} subject={subject} chapter={chapter} />)}
            <h2 class="jp-revisit-title">Questions</h2>
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
