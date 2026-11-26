import '../lessons.css'
import { useState } from 'preact/hooks'
import { completeConceptLesson, startConceptLesson } from '../../../lib/modes'
import { TopicLessonPlayer, useLessonTopic } from '../LessonList'
import { biologyMapping } from './mapping'

const seconds: Record<string, number> = {
  'biology-heart': 46,
  'biology-nephron': 44,
  'biology-inheritance': 45,
}

export function teachMeButton(subject: string, id: string, correct: boolean | undefined) {
  const entry = subject === 'biology' && correct !== undefined ? biologyMapping[id] : undefined
  return entry && {
    ...entry,
    text: 'Teach me · ' + seconds[entry.clipId] + ' sec',
    className: correct ? 'jp-btn' : 'jp-btn jp-btn--primary',
  }
}

function OpenClip({ clipId, id }: { clipId: string; id: string }) {
  const { topic, failed, retry } = useLessonTopic(clipId)
  const lesson = topic?.lessons.find((item) => item.id === clipId)
  if (!topic) return failed
    ? <button type="button" class="jp-btn" onClick={retry}>Retry loading clip</button>
    : <p class="jp-mode-lead" role="status">Loading clip…</p>
  if (!lesson || !topic.topicId) return <p class="jp-mode-lead" role="status">This clip is unavailable.</p>
  const chapter = topic.topicId
  return <TopicLessonPlayer file={clipId} topic={topic} lesson={lesson} currentId={id} onComplete={() =>
    completeConceptLesson('biology', chapter, lesson.id, [lesson.id])} />
}

export function TeachMe({ id, correct }: { id: string; correct: boolean }) {
  const [open, setOpen] = useState(false)
  const button = teachMeButton('biology', id, correct)
  if (!button) return null
  return <section class="jp-biology-teach">
    <button type="button" class={button.className} aria-expanded={open} onClick={() => {
      if (!open) startConceptLesson(button.clipId)
      setOpen(!open)
    }}>{open ? 'Close clip' : button.text}</button>
    {open && <>
      <OpenClip clipId={button.clipId} id={id} />
      <p class="jp-summary-sub">{button.applies}</p>
    </>}
  </section>
}
