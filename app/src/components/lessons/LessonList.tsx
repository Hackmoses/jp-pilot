import type { ComponentChildren } from 'preact'
import { useEffect, useState } from 'preact/hooks'
import { lazyView } from '../../lib/lazyView'
import { completeConceptLesson, hasCompletedConceptLesson, formatTime, startConceptLesson } from '../../lib/modes'
import { fallbackMs, lessonScenes } from './lesson'
import type { Lesson, Topic } from './lesson'

const Player = lazyView(() => import('./LessonPlayer').then(({ LessonPlayer }) => LessonPlayer))
const loadedTopics = new Map<string, Topic>()
export function useLessonTopic(file: string) {
  const [topic, setTopic] = useState<Topic | undefined>(() => loadedTopics.get(file))
  const [retry, setRetry] = useState(0)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    if (loadedTopics.has(file)) return
    const request = new AbortController()
    setFailed(false)
    fetch(import.meta.env.BASE_URL + 'lessons/' + file + '.json', { signal: request.signal })
      .then((response) => {
        if (!response.ok) throw new Error('Lesson download failed')
        return response.json()
      }).then((data: Topic) => {
        if (request.signal.aborted) return
        loadedTopics.set(file, data)
        setTopic(data)
      })
      .catch(() => { if (!request.signal.aborted) setFailed(true) })
    return () => request.abort()
  }, [file, retry])
  return { topic, failed, retry: () => setRetry(retry + 1) }
}

export function TopicLessonPlayer({ file, topic, lesson, currentId, onComplete }: {
  file: string; topic: Topic; lesson: Lesson; currentId?: string; onComplete: () => void
}) {
  const { View, failed } = Player.useView()
  if (!View) return <p class="jp-mode-lead" role="status">{failed ? 'Could not load the player. Reload the page to retry.' : 'Loading player…'}</p>
  return <View lesson={lesson} file={file} clips={topic.clips} pronunciations={topic.words}
    currentId={currentId} onComplete={onComplete} />
}

export function LessonList({ file, subject, chapter, only, lessonIds, tryItAnchor, after }: {
  file: string; subject: string; chapter: string; only?: string; lessonIds?: string[]; tryItAnchor?: string
  after?: (lesson: Lesson, topic: Topic) => ComponentChildren
}) {
  const { topic, failed, retry } = useLessonTopic(file)
  const [open, setOpen] = useState<string>()
  const [, update] = useState(0)
  if (!topic) return failed
    ? <button type="button" class="jp-btn" onClick={retry}>Retry loading lessons</button>
    : <p class="jp-mode-lead" role="status">Loading lessons…</p>
  const selected = only ? topic.lessons.filter(({ id }) => id === only)
    : lessonIds ? topic.lessons.filter(({ id }) => lessonIds.includes(id)) : topic.lessons
  const cards = selected.flatMap((lesson) => lesson.supplement
    ? [lesson, { ...lesson.supplement, id: lesson.id + '-supplement' }]
    : [lesson])
  return <>{cards.map((lesson) => {
    const duration = lessonScenes(lesson).reduce((total, scene) => total + (topic.clips?.[scene.id]?.durationMs ?? fallbackMs(scene)), 0)
    return <section class="jp-card jp-try-card" key={lesson.id} data-open={open === lesson.id ? 'true' : 'false'}>
      <div class="jp-try-header">
        <div class="jp-try-header-copy">
          <h3 class="jp-mode-card-title">{lesson.title}</h3>
          <span class="jp-summary-sub">
            {formatTime(duration)}
            {hasCompletedConceptLesson(lesson.id) && <> · <span class="jp-mode-studied">✓ Completed</span></>}
          </span>
        </div>
        <div class="jp-try-header-actions">
          <button type="button" class="jp-btn" aria-label={(open === lesson.id ? 'Close' : 'Open') + ' · ' + lesson.title}
            aria-expanded={open === lesson.id} onClick={() => {
              if (only === lesson.id || lesson.quickCheck && open !== lesson.id) startConceptLesson(lesson.id)
              setOpen(open === lesson.id ? undefined : lesson.id)
            }}>
            {open === lesson.id ? 'Close' : 'Open'}
          </button>
        </div>
      </div>
      {open === lesson.id && <div class="jp-try-panel">
        <TopicLessonPlayer key={lesson.id} topic={topic} lesson={tryItAnchor ? { ...lesson, tryIt: tryItAnchor } : lesson} file={file} onComplete={() => {
          if (only && lesson.id !== only) return
          completeConceptLesson(subject, chapter, lesson.id, selected.map(({ id }) => id))
          update((count) => count + 1)
        }} />
      </div>}
    </section>
  })}{after && selected.map((lesson) => after(lesson, topic))}</>
}
