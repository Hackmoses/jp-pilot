import { useEffect, useState } from 'preact/hooks'
import { lazyView } from '../../lib/lazyView'
import { completeConceptLesson, hasCompletedConceptLesson, formatTime } from '../../lib/modes'
import { fallbackMs, lessonScenes } from './lesson'
import type { Topic } from './lesson'

const Player = lazyView(() => import('./LessonPlayer').then(({ LessonPlayer }) => LessonPlayer))
export function LessonList({ file, subject, chapter }: { file: string; subject: string; chapter: string }) {
  const [topic, setTopic] = useState<Topic>()
  const [retry, setRetry] = useState(0)
  const [failed, setFailed] = useState(false)
  const [open, setOpen] = useState<string>()
  const { View, failed: playerFailed } = Player.useView(Boolean(open))
  const [, update] = useState(0)
  useEffect(() => {
    const request = new AbortController()
    setFailed(false)
    fetch(import.meta.env.BASE_URL + 'lessons/' + file + '.json', { signal: request.signal })
      .then((response) => {
        if (!response.ok) throw new Error('Lesson download failed')
        return response.json()
      }).then((data: Topic) => { if (!request.signal.aborted) setTopic(data) })
      .catch(() => { if (!request.signal.aborted) setFailed(true) })
    return () => request.abort()
  }, [file, retry])
  if (!topic) return failed
    ? <button type="button" class="jp-btn" onClick={() => setRetry(retry + 1)}>Retry loading lessons</button>
    : <p class="jp-mode-lead" role="status">Loading lessons…</p>
  return <>{topic.lessons.map((lesson) => {
    const duration = lessonScenes(lesson).reduce((total, scene) => total + (topic.clips?.[scene.id]?.durationMs ?? fallbackMs(scene)), 0)
    return <section class="jp-card jp-try-card" key={lesson.id}>
      <div class="jp-try-header">
        <h3 class="jp-mode-card-title">{lesson.title}</h3>
        <span class="jp-summary-sub">{formatTime(duration)}{hasCompletedConceptLesson(lesson.id) ? ' · Completed' : ''}</span>
        <button type="button" class="jp-btn" aria-label={(open === lesson.id ? 'Close' : 'Open') + ' · ' + lesson.title}
          aria-expanded={open === lesson.id} onClick={() => setOpen(open === lesson.id ? undefined : lesson.id)}>
          {open === lesson.id ? 'Close' : 'Open'}
        </button>
      </div>
      {open === lesson.id && (View ? <View lesson={lesson} file={file} clips={topic.clips} onComplete={() => {
        completeConceptLesson(subject, chapter, lesson.id, topic.lessons.map(({ id }) => id))
        update((count) => count + 1)
      }} /> : <p role="status">{playerFailed ? 'Could not load the player. Reload the page to retry.' : 'Loading player…'}</p>)}
    </section>
  })}</>
}
