import { useState } from 'preact/hooks'
import { getQuestion, loadSubject } from '../../../lib/data'
import { getAttempt, startAttempt } from '../../../lib/modes'
import type { ExplainQuestion } from '../lesson'
import { followUpIds } from './mapping'

export function QuickCheck({ check, clipId, currentId }: {
  check: ExplainQuestion; clipId: string; currentId?: string
}) {
  const [picked, setPicked] = useState<number>()
  const [launch, setLaunch] = useState<'idle' | 'loading' | 'failed'>('idle')

  async function practise() {
    setLaunch('loading')
    try {
      await loadSubject('biology')
      const ids = followUpIds(clipId, currentId).filter((id) => getQuestion(id)?.subject === 'biology')
      if (ids.length > 0) {
        startAttempt('practice', ['biology'], ids.map((id) => ({ id })), 0)
        window.location.hash = '#/practice/run?run=' + getAttempt('practice')!.id
        return
      }
    } catch {
      // Keep the check visible so students can retry loading practice.
    }
    setLaunch('failed')
  }

  return <section class="jp-biology-check" aria-label="Quick check">
    <span class="jp-pill">Quick check</span>
    <h3>{check.prompt}</h3>
    <div role="group" aria-label="Choose an answer" class="jp-biology-options">
      {check.options.map((option, i) => <button key={option} type="button" class="jp-btn"
        aria-pressed={picked === i} data-result={picked === i ? (i === check.answerIndex ? 'correct' : 'incorrect') : undefined}
        onClick={() => setPicked(i)}>{option}</button>)}
    </div>
    <p class="jp-biology-feedback" role="status">{picked !== undefined &&
      (picked === check.answerIndex ? 'Correct. ' : 'Try again. ') + check.feedback}</p>
    <button type="button" class="jp-btn jp-btn--primary" disabled={launch === 'loading'}
      onClick={() => void practise()}>{launch === 'loading' ? 'Loading practice…' : 'Practise more on this topic'}</button>
    {launch === 'failed' && <p role="status">Could not load practice. Tap to try again.</p>}
  </section>
}
