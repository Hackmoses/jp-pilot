import { continueExam, getAttempt, remainingTime, type Attempt } from '../../lib/modes'
import { getSubject } from '../../lib/subjects'

function describe(attempt: Attempt) {
  const answered = attempt.ids.filter((id) => attempt.answers[id]).length
  const left = remainingTime(attempt)
  const subject = attempt.subjects.length === 1 ? getSubject(attempt.subjects[0])?.name ?? attempt.subjects[0] : `${attempt.subjects.length} subjects`
  return {
    title: `${subject} ${attempt.mode === 'exam' ? 'exam' : 'practice'} · Question ${attempt.index + 1} of ${attempt.ids.length}`,
    progress: attempt.ids.length ? answered / attempt.ids.length : 0,
    detail: [`${answered} answered`, left !== null ? `${Math.ceil(left / 60_000)} min left` : null].filter(Boolean).join(' · '),
  }
}

// The unfinished exam comes first, because its timer keeps running.
export function unfinishedAttempt() {
  const exam = getAttempt('exam')
  if (exam && remainingTime(exam) !== 0) return exam
  const practice = getAttempt('practice')
  if (practice && !practice.passageId && practice.ids.some((id) => !practice.answers[id])) return practice
  return null
}

export function ContinueCard({ attempt }: { attempt: Attempt }) {
  const info = describe(attempt)
  const body = <>
    <span class="home-continue-eyebrow">Continue where you stopped</span>
    <span class="home-continue-title">{info.title}</span>
    <span class="home-continue-bar" aria-hidden="true"><span style={{ width: `${Math.round(info.progress * 100)}%` }} /></span>
    <span class="home-continue-meta"><span>{info.detail}</span><b>Resume →</b></span>
  </>
  return attempt.mode === 'exam'
    ? <button type="button" class="home-continue" onClick={continueExam}>{body}</button>
    : <a class="home-continue" href="#/practice/run">{body}</a>
}
