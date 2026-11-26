import { useEffect } from 'preact/hooks'
import { LessonList } from '../components/lessons/LessonList'
import { TryItCard, studyInteractives } from '../components/try-it/TryItCard'
import { conceptLessonIds, conceptLessonTopic } from '../lib/sections'

export function ChapterStudy({ subject, chapter, tryIt }: { subject: string; chapter: string; tryIt: string | null }) {
  const file = conceptLessonTopic(subject, chapter)
  const interactives = studyInteractives(subject, chapter)
  useEffect(() => {
    if (tryIt === 'gas-laws') document.getElementById(tryIt)?.scrollIntoView({ block: 'start' })
  }, [tryIt])
  return <div class="jp-mode-list">
    <h2 class="jp-revisit-title">Concept lessons</h2>
    {file ? <LessonList key={file + chapter} file={file} subject={subject} chapter={chapter} lessonIds={conceptLessonIds(subject, chapter)} />
      : <p class="jp-mode-lead">Short animated lessons for this topic are coming soon.</p>}
    {interactives.length > 0 && <>
      <h2 class="jp-revisit-title">{file ? 'Try it after the lesson' : 'Try it yourself'}</h2>
      {interactives.map((interactive) => <TryItCard key={interactive.id ?? interactive.title}
        interactive={interactive} subject={subject} chapter={chapter} />)}
    </>}
    <a class="jp-btn jp-btn--primary jp-btn--full" href={'#/practice?' + new URLSearchParams(subject === 'english' ? { subject } : { subject, chapter })}>Practise this topic →</a>
  </div>
}
