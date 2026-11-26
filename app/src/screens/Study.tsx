import { useEffect } from 'preact/hooks'
import { EnglishFoundations, foundationsHref } from '../components/lessons/EnglishFoundations'
import { LessonList } from '../components/lessons/LessonList'
import { TryItCard, studyInteractives } from '../components/try-it/TryItCard'
import cardIndex from '../lib/card-index.json'
import { cardReviews } from '../lib/leitner'
import { lazyView } from '../lib/lazyView'
import { conceptLessonTopic, ENGLISH_CARD_TOPICS, STUDY_TOPICS, syllabusSections } from '../lib/sections'
import { chapterName, hasStudied, remember, studyLink } from '../lib/modes'
import { getSubject } from '../lib/subjects'
import { ModeCard, Panel } from './Modes'

const cardViewer = lazyView(() => import('../components/cards/CardViewer').then(({ CardViewer }) => CardViewer))

function EnglishCards({ deck, back, open }: { deck: string; back: string; open: boolean }) {
  const { View, failed } = cardViewer.useView(open)
  const entry = cardIndex.find(({ id }) => id === deck)
  if (!entry) return <Panel title="Word cards" back={back}><p class="jp-mode-lead">This deck is unavailable.</p></Panel>
  const { title, count } = entry
  const known = Math.min(count, Object.values(cardReviews(deck)).filter(({ box }) => box > 1).length)

  if (open && View) return <View deck={deck} title={title} back={back} />
  return <Panel title={title} subtitle="English Language" back={open ? back : '#/study?subject=english'}>
    {open ? <p class="jp-mode-lead" role="status">
      {failed ? 'Could not open word cards. Reload the page to try again.' : 'Loading…'}
    </p> : <ModeCard href={back + '&cards=1'} title={`Word cards · ${count} cards`}>
      {known} known · {count - known} to review
    </ModeCard>}
  </Panel>
}

// Study uses lessons, Try it and word cards.
export function Study({ params }: { params: URLSearchParams }) {
  const subject = params.get('subject') ?? 'chemistry'
  const chapter = params.get('chapter')
  const tryIt = params.get('try')
  const deck = subject === 'english' && chapter ? ENGLISH_CARD_TOPICS[chapter] : undefined
  const sectionsForSubject = syllabusSections(subject, true)
  const subjectName = getSubject(subject)?.name ?? subject
  const topics = new Set(STUDY_TOPICS[subject] ?? [])
  const subjectHref = '#/study?subject=' + encodeURIComponent(subject)
  const practiceHref = (id?: string) => '#/practice?' + new URLSearchParams(id ? { subject, chapter: id } : { subject })

  useEffect(() => {
    if (chapter && topics.has(chapter)) {
      const title = sectionsForSubject.flatMap(({ chapters }) => chapters).find(({ id }) => id === chapter)?.title
      remember(studyLink(subject, chapter), 'Study · ' + (title ?? chapterName(subject, chapter)))
    }
    if (tryIt === 'gas-laws') document.getElementById(tryIt)?.scrollIntoView({ block: 'start' })
  }, [subject, chapter, tryIt])

  if (subject === 'english' && params.has('foundations')) {
    return <EnglishFoundations unit={params.get('unit')} />
  }

  if (chapter && deck) {
    return <EnglishCards deck={deck} back={studyLink(subject, chapter)} open={params.has('cards')} />
  }

  if (chapter && subject !== 'english') {
    const file = conceptLessonTopic(subject, chapter)
    const interactives = studyInteractives(subject, chapter)
    return (
      <Panel title={chapterName(subject, chapter)} subtitle={subjectName} back={subjectHref}>
        <div class="jp-mode-list">
          <h2 class="jp-revisit-title">Concept lessons</h2>
          {file ? <LessonList key={file} file={file} subject={subject} chapter={chapter} />
            : <p class="jp-mode-lead">Short animated lessons for this topic are coming soon.</p>}
          {interactives.length > 0 && <>
            <h2 class="jp-revisit-title">{file ? 'Try it after the lesson' : 'Try it yourself'}</h2>
            {interactives.map((interactive) => <TryItCard key={interactive.id ?? interactive.title}
              interactive={interactive} subject={subject} chapter={chapter} />)}
          </>}
          <a class="jp-btn jp-btn--primary jp-btn--full" href={practiceHref(chapter)}>Practise this topic →</a>
        </div>
      </Panel>
    )
  }

  const sections = sectionsForSubject.map((section) => ({
    ...section, chapters: section.chapters.filter((entry) => topics.has(entry.id)),
  })).filter((section) => section.chapters.length)
  const studiedTopic = (id: string) => subject === 'english'
    ? Object.keys(cardReviews(ENGLISH_CARD_TOPICS[id])).length > 0
    : hasStudied(subject, id)
  const total = sections.reduce((sum, section) => sum + section.chapters.length, 0)
  const studied = sections.reduce((sum, section) =>
    sum + section.chapters.filter((entry) => studiedTopic(entry.id)).length, 0)

  return (
    <Panel title={subjectName + ' study'} back="#/subjects?mode=study">
      {subject === 'english' && <ModeCard href={foundationsHref} title="Spelling and Sounds">
        10 concept lessons with Try it activities
      </ModeCard>}
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
          const done = section.chapters.filter((entry) => studiedTopic(entry.id)).length
          return <details class="jp-card jp-study-section" key={section.id} open={subject === 'english' ? true : undefined}>
            <summary>
              <span class="jp-mode-card-title">{section.title}</span>
              <span class="jp-summary-sub">{section.chapters.length} {section.chapters.length === 1 ? 'topic' : 'topics'}{done ? ` · ${done} studied` : ''}</span>
            </summary>
            <div class="jp-mode-list">
              {section.chapters.map((entry) => <ModeCard key={entry.id} href={studyLink(subject, entry.id)}
                title={subject === 'english' ? entry.title : `${entry.number}. ${entry.title}`}>
                {studiedTopic(entry.id) && <span class="jp-mode-studied" aria-label="Studied">✓ Studied</span>}
              </ModeCard>)}
            </div>
          </details>
        })}
      </>}
    </Panel>
  )
}
