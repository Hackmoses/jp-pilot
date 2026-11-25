import { useEffect } from 'preact/hooks'
import { TryItCard, studyInteractives } from '../components/try-it/TryItCard'
import { STUDY_TOPICS, syllabusSections } from '../lib/sections'
import { chapterName, hasStudied, remember, studyLink } from '../lib/modes'
import { getSubject } from '../lib/subjects'
import { ModeCard, Panel } from './Modes'

// Study is concept lessons and Try it. It shows no questions and downloads no question files.
export function Study({ params }: { params: URLSearchParams }) {
  const subject = params.get('subject') ?? 'chemistry'
  const chapter = params.get('chapter')
  const subjectName = getSubject(subject)?.name ?? subject
  const topics = new Set(STUDY_TOPICS[subject] ?? [])
  const subjectHref = '#/study?subject=' + encodeURIComponent(subject)
  const practiceHref = (id?: string) => '#/practice?' + new URLSearchParams(id ? { subject, chapter: id } : { subject })

  useEffect(() => {
    if (chapter && topics.has(chapter)) remember(studyLink(subject, chapter), 'Study · ' + chapterName(subject, chapter))
  }, [subject, chapter])

  if (chapter) {
    const interactives = studyInteractives(subject, chapter)
    return (
      <Panel title={chapterName(subject, chapter)} subtitle={subjectName} back={subjectHref}>
        <div class="jp-mode-list">
          <h2 class="jp-revisit-title">Concept lessons</h2>
          <p class="jp-mode-lead">Short animated lessons for this topic are coming soon.</p>
          {interactives.length > 0 && <>
            <h2 class="jp-revisit-title">Try it yourself</h2>
            {interactives.map((interactive) => <TryItCard key={interactive.id ?? interactive.title}
              interactive={interactive} subject={subject} chapter={chapter} />)}
          </>}
          <a class="jp-btn jp-btn--primary jp-btn--full" href={practiceHref(chapter)}>Practise this topic →</a>
        </div>
      </Panel>
    )
  }

  const sections = syllabusSections(subject).map((section) => ({
    ...section, chapters: section.chapters.filter((entry) => topics.has(entry.id)),
  })).filter((section) => section.chapters.length)
  const total = sections.reduce((sum, section) => sum + section.chapters.length, 0)
  const studied = sections.reduce((sum, section) =>
    sum + section.chapters.filter((entry) => hasStudied(subject, entry.id)).length, 0)

  return (
    <Panel title={subjectName + ' study'} back="#/subjects?mode=study">
      {total === 0 ? <>
        <p class="jp-mode-lead">Lessons for {subjectName} are coming soon.</p>
        <a class="jp-btn jp-btn--primary jp-btn--full" href={practiceHref()}>Practise {subjectName} →</a>
      </> : <>
        <section class="jp-card" aria-label="Study progress">
          <p class="jp-summary-sub">{studied} of {total} topics studied</p>
          <div class="jp-progress-track" aria-hidden="true" style={{ marginTop: '8px' }}>
            <div class="jp-progress-fill" style={{ width: studied * 100 / total + '%' }} />
          </div>
        </section>
        {sections.map((section) => {
          const done = section.chapters.filter((entry) => hasStudied(subject, entry.id)).length
          return <details class="jp-card jp-study-section" key={section.id}>
            <summary>
              <span class="jp-mode-card-title">{section.title}</span>
              <span class="jp-summary-sub">{section.chapters.length} {section.chapters.length === 1 ? 'topic' : 'topics'}{done ? ` · ${done} studied` : ''}</span>
            </summary>
            <div class="jp-mode-list">
              {section.chapters.map((entry) => <ModeCard key={entry.id} href={studyLink(subject, entry.id)}
                title={`${entry.number}. ${entry.title}`}>
                {hasStudied(subject, entry.id) && <span class="jp-mode-studied" aria-label="Studied">✓ Studied</span>}
              </ModeCard>)}
            </div>
          </details>
        })}
      </>}
    </Panel>
  )
}
