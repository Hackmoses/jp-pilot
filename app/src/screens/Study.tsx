import { useEffect } from 'preact/hooks'
import { foundationSection } from '../components/lessons/foundations-topics'
import cardIndex from '../lib/card-index.json'
import { cardReviews } from '../lib/leitner'
import { lazyView } from '../lib/lazyView'
import { conceptLessonTopic, ENGLISH_CARD_TOPICS, STUDY_TOPICS, STUDY_TRY_IDS, syllabusSections } from '../lib/sections'
import { chapterName, hasCompletedConceptLesson, hasCompletedInteractive, hasStartedConceptLesson, hasStartedConceptTopic, hasStudied, remember, studyLink } from '../lib/modes'
import { getSubject } from '../lib/subjects'
import { ConceptLessonList } from '../components/lessons/ConceptLessonList'
import { useLessonIndex } from '../lib/lessonIndex'
import { ModeCard, Panel } from './Modes'

const foundationTopic = lazyView(() => import('../components/lessons/FoundationTopic').then(({ FoundationTopic }) => FoundationTopic))
const chapterStudy = lazyView(() => import('./ChapterStudy').then(({ ChapterStudy }) => ChapterStudy))
const cardViewer = lazyView(() => import('../components/cards/CardViewer').then(({ CardViewer }) => CardViewer))

function EnglishCards({ deck, back, open }: { deck: string; back: string; open: boolean }) {
  const { View, failed } = cardViewer.useView(open)
  const entry = cardIndex.find(({ id }) => id === deck)
  if (!entry) return <Panel title="Word cards" back={back}><p class="jp-mode-lead">This deck is unavailable.</p></Panel>
  const { title, count } = entry
  const known = Math.min(count, Object.values(cardReviews(deck)).filter(({ box }) => box > 1).length)

  if (open && View) return <View deck={deck} title={title} back={back} />
  return <Panel title={title} subtitle="English Language" back={open ? back : '#/study?subject=english'} backLabel={open ? title : 'English Language study'}>
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
  const chapter = params.get('chapter') ?? (subject === 'english' ? params.get('unit') : null)
  const tryIt = params.get('try')
  const deck = subject === 'english' && chapter ? ENGLISH_CARD_TOPICS[chapter] : undefined
  const foundation = subject === 'english' ? foundationSection.chapters.find(({ id }) => id === chapter) : undefined
  const { View: Foundation, failed: foundationFailed } = foundationTopic.useView(Boolean(foundation))
  const { View: Chapter, failed: chapterFailed } = chapterStudy.useView(Boolean(chapter && (subject !== 'english' || conceptLessonTopic(subject, chapter))))
  const sectionsForSubject = syllabusSections(subject, true)
  const subjectName = getSubject(subject)?.name ?? subject
  const topics = new Set(STUDY_TOPICS[subject] ?? [])
  const subjectHref = '#/study?subject=' + encodeURIComponent(subject)
  const practiceHref = '#/practice?' + new URLSearchParams({ subject })

  // Subjects with key concept lessons lead with them; the syllabus topic lessons follow under Other lessons.
  const hasKeyConcepts = useLessonIndex()?.some((lesson) => lesson.subject === subject) ?? false

  useEffect(() => {
    if (chapter && topics.has(chapter)) {
      const title = sectionsForSubject.flatMap(({ chapters }) => chapters).find(({ id }) => id === chapter)?.title
      remember(studyLink(subject, chapter), 'Study · ' + (title ?? chapterName(subject, chapter)))
    }
  }, [subject, chapter])

  if (foundation) return <Panel title={foundation.title} subtitle={foundationSection.title} back={subjectHref} backLabel={subjectName + ' study'}>
    {Foundation ? <Foundation chapter={foundation.id} title={foundation.title} />
      : <p class="jp-mode-lead" role="status">{foundationFailed ? 'Could not open this topic. Reload to try again.' : 'Loading topic…'}</p>}
  </Panel>

  if (chapter && deck) {
    return <EnglishCards deck={deck} back={studyLink(subject, chapter)} open={params.has('cards')} />
  }

  if (chapter && (subject !== 'english' || conceptLessonTopic(subject, chapter))) return <Panel title={sectionsForSubject.flatMap(({ chapters }) => chapters).find(({ id }) => id === chapter)?.title ?? chapterName(subject, chapter)} subtitle={subjectName} back={subjectHref} backLabel={subjectName + ' study'}>
    {Chapter ? <Chapter subject={subject} chapter={chapter} tryIt={tryIt} />
      : <p class="jp-mode-lead" role="status">{chapterFailed ? 'Could not open this topic. Reload to try again.' : 'Loading topic…'}</p>}
  </Panel>

  const sections = sectionsForSubject.map((section) => ({
    ...section, chapters: section.chapters.filter((entry) => topics.has(entry.id)),
  })).filter((section) => section.chapters.length)
  if (subject === 'english') sections.unshift(foundationSection)
  const foundationIds = new Set(foundationSection.chapters.map(({ id }) => id))
  // Completed only when everything in the topic is done; anything less that has begun is in progress.
  const progressOf = (id: string): 'none' | 'progress' | 'done' => {
    if (subject === 'english' && foundationIds.has(id)) {
      const lesson = hasCompletedConceptLesson(id)
      const tryIt = hasCompletedInteractive(subject, id)
      if (lesson && tryIt) return 'done'
      return lesson || tryIt || hasStartedConceptLesson(id) ? 'progress' : 'none'
    }
    if (subject === 'english' && ENGLISH_CARD_TOPICS[id]) {
      const deck = ENGLISH_CARD_TOPICS[id]
      const reviews = Object.values(cardReviews(deck))
      if (!reviews.length) return 'none'
      const entry = cardIndex.find((item) => item.id === deck) as { count: number; available?: number } | undefined
      const needed = entry?.available ?? entry?.count ?? Infinity
      return reviews.filter(({ box }) => box > 1).length >= needed ? 'done' : 'progress'
    }
    const tries = STUDY_TRY_IDS[subject]?.[id] ?? []
    const triesDone = tries.filter((tryId) => hasCompletedInteractive(subject, id, tryId ?? undefined)).length
    const hasLessons = Boolean(conceptLessonTopic(subject, id))
    const lessonsDone = !hasLessons || hasStudied(subject, id)
    if (lessonsDone && triesDone === tries.length && (hasLessons || tries.length > 0)) return 'done'
    return triesDone > 0 || (hasLessons && hasStartedConceptTopic(subject, id)) ? 'progress' : 'none'
  }
  const studiedTopic = (id: string) => progressOf(id) === 'done'
  const total = sections.reduce((sum, section) => sum + section.chapters.length, 0)
  const studied = sections.reduce((sum, section) =>
    sum + section.chapters.filter((entry) => studiedTopic(entry.id)).length, 0)

  return (
    <Panel title={subjectName + ' study'} back="#/subjects?mode=study" backLabel="Subjects">
      <ConceptLessonList subject={subject} />
      {total === 0 ? <>
        {!hasKeyConcepts && <p class="jp-mode-lead">Lessons for {subjectName} are coming soon.</p>}
        <a class="jp-btn jp-btn--primary jp-btn--full" href={practiceHref}>Practise {subjectName} →</a>
      </> : <>
        {hasKeyConcepts && <div class="jp-study-others">
          <h2 class="jp-mode-card-title">Other lessons</h2>
          <p class="jp-mode-lead">More topic lessons and Try it activities from the syllabus. Open any of them when you want extra practice.</p>
        </div>}
        <section class="jp-card" aria-label="Study progress">
          <p class="jp-summary-sub">{studied} of {total} topics completed</p>
          <div class="jp-progress-track" aria-hidden="true" style={{ marginTop: '8px' }}>
            <div class="jp-progress-fill" style={{ width: studied * 100 / total + '%' }} />
          </div>
        </section>
        {sections.map((section) => {
          const done = section.chapters.filter((entry) => studiedTopic(entry.id)).length
          const going = section.chapters.filter((entry) => progressOf(entry.id) === 'progress').length
          return <details class="jp-card jp-study-section" key={section.id}>
            <summary>
              <span class="jp-mode-card-title">{section.title}</span>
              <span class="jp-summary-sub">{section.chapters.length} {section.chapters.length === 1 ? 'topic' : 'topics'}{done ? ` · ${done} completed` : ''}{going ? ` · ${going} in progress` : ''}</span>
            </summary>
            <div class="jp-mode-list">
              {section.chapters.map((entry) => <ModeCard key={entry.id} href={studyLink(subject, entry.id)}
                title={subject === 'english' ? entry.title : `${entry.number}. ${entry.title}`}>
                {progressOf(entry.id) === 'done' && <span class="jp-mode-studied" aria-label="Completed">✓ Completed</span>}
                {progressOf(entry.id) === 'progress' && <span class="jp-mode-ongoing" aria-label="In progress">In progress</span>}
              </ModeCard>)}
            </div>
          </details>
        })}
      </>}
    </Panel>
  )
}
