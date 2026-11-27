import { useLessonIndex } from '../../lib/lessonIndex'
import '../../styles/lesson.css'

// The concept lessons for a subject, shown at the top of its Study page.
export function ConceptLessonList({ subject }: { subject: string }) {
  const lessons = useLessonIndex()?.filter((lesson) => lesson.subject === subject) ?? []
  if (!lessons.length) return null
  return (
    <section class="jp-lesson-list-wrap" aria-labelledby="jp-concept-lessons-title">
      <h2 id="jp-concept-lessons-title" class="jp-mode-card-title">Key concept lessons</h2>
      <p class="jp-mode-lead">Short voiced lessons: the idea simply, the rules, two worked examples and the traps.</p>
      <div class="jp-lesson-list">
        {lessons.map((lesson) => <LessonCard key={lesson.id} id={lesson.id} title={lesson.title} minutes={lesson.minutes} />)}
      </div>
    </section>
  )
}

export function LessonCard({ id, title, minutes, prefix }: { id: string; title: string; minutes: number; prefix?: string }) {
  return (
    <a class="jp-lesson-card" href={'#/lesson?id=' + encodeURIComponent(id)}>
      <span class="jp-lesson-card-icon" aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
      </span>
      <span><strong>{prefix ? prefix + ' ' : ''}{title}</strong><span>About {minutes} minutes</span></span>
    </a>
  )
}
