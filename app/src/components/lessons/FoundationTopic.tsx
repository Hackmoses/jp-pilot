import { useEffect } from 'preact/hooks'
import { remember, studyLink } from '../../lib/modes'
import { TryItCard } from '../try-it/TryItCard'
import { LessonList } from './LessonList'

const activities = [
  ['Sound counter', () => import('../try-it/english/sound-counter')],
  ['Syllable splitter', () => import('../try-it/english/syllable-splitter')],
  ['Sound sorter', () => import('../try-it/english/sound-sorter')],
  ['Silent letter hunter', () => import('../try-it/english/silent-letter-hunter')],
  ['Word builder', () => import('../try-it/english/word-builder')],
  ['Rule machine', () => import('../try-it/english/rule-machine')],
  ['Ending chooser', () => import('../try-it/english/ending-chooser')],
  ['Sentence fixer', () => import('../try-it/english/sentence-fixer')],
  ['Spot the difference', () => import('../try-it/english/spot-the-difference')],
  ['Stress tapper', () => import('../try-it/english/stress-tapper')],
] as const

export function FoundationTopic({ chapter, title }: { chapter: string; title: string }) {
  const anchor = chapter + '-try'
  const [name, load] = activities[Number(chapter.split('-')[2]) - 1]
  useEffect(() => remember(studyLink('english', chapter), 'Study · ' + title), [chapter, title])
  return <div class="jp-mode-list">
    <h2 class="jp-revisit-title">Concept lesson</h2>
    <LessonList subject="english" chapter={chapter} file="english-foundations" only={chapter} tryItAnchor={anchor}
      after={(lesson, topic) => <div key={chapter} class="jp-mode-list">
        {lesson.roots && <details class="jp-card jp-study-section">
          <summary>Common roots</summary>
          <dl class="jp-try-text">{lesson.roots.map(([root, meaning]) =>
            <div key={root}><dt><strong>{root}</strong></dt><dd>{meaning}</dd></div>)}</dl>
        </details>}
        {topic.words && typeof lesson.tryIt === 'object' && lesson.tryIt &&
          <TryItCard subject="english" chapter={chapter} interactive={{ chapter, anchor, title: name, load }}
            english={{ explain: lesson.tryIt, words: topic.words }} />}
      </div>} />
  </div>
}
