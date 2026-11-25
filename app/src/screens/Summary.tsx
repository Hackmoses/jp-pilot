import { STUDY_TOPICS } from '../lib/sections'
import '../components/question/question.css'
import { getLastSessionSummary } from '../components/question/sessionState'
import { ShareButton } from '../components/share/ShareButton'
import { Feedback } from '../components/share/Feedback'
import { getQuestion, registerSavedQuestions } from '../lib/data'
import { chapterName, formatTime, getQuestionChapter, retryMistakes, studyLink } from '../lib/modes'
import { getProgress } from '../lib/store'
import { Panel } from './Modes'

export function Summary() {
  const summary = getLastSessionSummary()
  const progress = getProgress()
  if (summary?.missedQuestions) registerSavedQuestions(summary.missedQuestions, summary.animations ?? [])
  const mistakes = summary?.missedQuestionIds ?? []
  const canRetry = mistakes.length > 0 && mistakes.every((id) => getQuestion(id))
  const chapters = new Map<string, { subject: string; chapter: string }>()
  for (const id of mistakes) {
    const question = getQuestion(id)
    if (question) {
      const chapter = getQuestionChapter(question)
      chapters.set(question.subject + '/' + chapter, { subject: question.subject, chapter })
    }
  }

  return (
    <Panel title={summary ? 'Session complete' : 'Progress summary'} back="#/modes">
      <div class="jp-pills">
        <span class="jp-pill jp-pill--practice">{summary ? 'Session complete' : 'Overall progress'}</span>
        {progress.streakDays > 0 && (
          <span class="jp-pill jp-pill--streak">
            {progress.streakDays}-day streak
          </span>
        )}
        {summary && (
          <span class="jp-pill jp-pill--practice">
            {progress.answered} {progress.answered === 1 ? 'question' : 'questions'} answered overall
          </span>
        )}
      </div>

      {summary ? (
        <>
          <section class="jp-summary-card" aria-label="Session score">
            <span class="jp-summary-score">
              {summary.correct} of {summary.total}
            </span>
            <p class="jp-summary-sub">
              {summary.answered} answered
              {summary.skipped > 0 ? ` · ${summary.skipped} skipped` : ''}
              {summary.elapsedMs !== undefined && ` · ${formatTime(summary.elapsedMs)} taken`}
            </p>
          </section>

          {chapters.size > 0 && <section class="jp-revisit" aria-label="Chapters with mistakes">
            <h2 class="jp-revisit-title">Chapters with mistakes</h2>
            {[...chapters.values()].map(({ subject, chapter }) => (
              <div key={subject + chapter} class="jp-mode-action-row">
                <span>{chapterName(subject, chapter)}</span>
                {STUDY_TOPICS[subject]?.includes(chapter) && <a class="jp-btn" href={studyLink(subject, chapter)}>Study this</a>}
              </div>
            ))}
          </section>}

          <section class="jp-revisit" aria-label="Topics to revisit">
            <h2 class="jp-revisit-title">Topics to revisit</h2>
            {summary.missedTopics.length > 0 ? (
              <ul class="jp-revisit-list">
                {summary.missedTopics.map((item) => (
                  <li key={item.topic}>
                    {item.topic}
                    {item.count > 1 ? ` (${item.count} missed)` : ''}
                  </li>
                ))}
              </ul>
            ) : (
              <p class="jp-summary-sub">
                {summary.answered > 0
                  ? 'No missed topics this session.'
                  : 'No questions answered this session.'}
              </p>
            )}
          </section>

          <ShareButton score={{ correct: summary.correct, total: summary.total }} subject={summary.subject} />
        </>
      ) : (
        <section class="jp-summary-card" aria-label="Overall progress">
          <span class="jp-summary-score">
            {progress.correct} of {progress.answered}
          </span>
          <p class="jp-summary-sub">
            Questions answered right overall. Start a new 10-question session anytime.
          </p>
        </section>
      )}

      {canRetry && (
        <button class="jp-btn jp-btn--primary jp-btn--full" onClick={() => retryMistakes(mistakes)}>
          Retry my mistakes
        </button>
      )}
      <a
        class={`jp-btn jp-btn--full ${canRetry ? '' : 'jp-btn--primary'}`.trim()}
        href={summary?.subject ? `#/practice?subject=${encodeURIComponent(summary.subject)}` : '#/subjects?mode=practice'}
      >
        {summary ? 'Practice again' : 'Start practice'}
      </a>

      <div class="jp-mode-footer-links">
        <a class="jp-link-btn" href="#/subjects">Choose a subject</a>
        <a class="jp-link-btn" href="#/">Back home</a>
        <Feedback screen="Practice summary" />
      </div>
    </Panel>
  )
}
