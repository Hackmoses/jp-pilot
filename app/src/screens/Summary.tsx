import '../components/question/question.css'
import { getLastSessionSummary } from '../components/question/sessionState'
import { ShareButton } from '../components/share/ShareButton'
import { getProgress } from '../lib/store'

export function Summary() {
  const summary = getLastSessionSummary()
  const progress = getProgress()

  return (
    <main class="jp-screen">
      <div class="jp-summary">
        <div class="jp-summary-brand">
          <a class="jp-logo" href="#/" aria-label="JP home">JP</a>
          <span class="jp-topic">JAMB Chemistry</span>
        </div>
        <div class="jp-pills">
          <span class="jp-pill jp-pill--practice">Session complete</span>
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
              </p>
            </section>

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

            <ShareButton score={{ correct: summary.correct, total: summary.total }} />
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

        <a class="jp-btn jp-btn--primary jp-btn--full" href="#/q">
          {summary ? 'Practice again' : 'Start practice'}
        </a>

        <a class="jp-link-btn" href="#/">
          Back home
        </a>
      </div>
    </main>
  )
}
