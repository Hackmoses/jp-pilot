import { STUDY_TOPICS } from '../lib/sections'
import { useState } from 'preact/hooks'
import { getQuestionSourceLabel } from '../components/question/logic'
import { Feedback } from '../components/share/Feedback'
import {
  chapterName, formatTime, getAttemptQuestions, getExamHistory, getPracticeResult, mistakeIds,
  restoreAttemptQuestions, retryMistakes, scoreAttempt, studyLink, type TestMode,
} from '../lib/modes'
import { ModeCard, Panel, useSubjects } from './Modes'
import { Session } from './Session'

export function Results({ mode, params }: { mode: TestMode; params: URLSearchParams }) {
  const id = params.get('id')
  const reviewId = params.get('review')
  const result = mode === 'exam' ? getExamHistory().find((result) => result.id === id) : getPracticeResult()
  const [offline] = useState(() => restoreAttemptQuestions(result))
  const status = useSubjects(offline ? [] : result?.subjects ?? [])
  const isExam = mode === 'exam'
  const title = isExam ? 'Exam results' : 'Practice summary'
  const back = isExam ? '#/exam' : '#/practice?subject=' + encodeURIComponent(result?.subjects[0] ?? 'chemistry')
  if (!result || (id && result.id !== id) || status !== 'ready') return <Panel title={title} back={back}>
    <p class="jp-mode-lead">{status === 'loading' ? 'Loading questions…'
      : status === 'error' ? 'Could not load questions.' : 'No saved result found.'}</p>
  </Panel>
  const href = '#/' + mode + '/results?id=' + result.id
  const questions = getAttemptQuestions(result)
  if (isExam && reviewId && questions.some((question) => question.id === reviewId)) {
    return <Session review={{ id: reviewId, result, href }} />
  }
  const score = scoreAttempt(questions, result.answers)
  const mistakes = mistakeIds(questions, result.answers)
  const strong = score.chapters.filter((row) => row.correct / row.total >= 0.7)
  const needsStudy = isExam ? score.chapters.filter((row) => !strong.includes(row)) : score.chapters.filter((row) => row.mistakes)
  return (
    <Panel title={title} back={back}>
      <section class="jp-summary-card" aria-label="Score">
        <strong class="jp-summary-score">{score.correct} of {score.total}{isExam && ` · ${score.percent}%`}</strong>
        <p class="jp-summary-sub">{score.answered} answered · {formatTime(result.finishedAt - result.startedAt)} taken</p>
      </section>
      {mistakes.length > 0 && <button class="jp-btn jp-btn--primary jp-btn--full" onClick={() => retryMistakes(mistakes)}>
        Retry my mistakes
      </button>}
      {isExam && <section class="jp-revisit">
        <h2 class="jp-revisit-title">Strong chapters</h2>
        {strong.length ? <ul class="jp-revisit-list">{strong.map((row) => (
          <li key={row.subject + row.chapter}>{chapterName(row.subject, row.chapter)} · {row.correct}/{row.total}</li>
        ))}</ul> : <p class="jp-summary-sub">No chapters reached 70%.</p>}
      </section>}
      <section class="jp-revisit">
        <h2 class="jp-revisit-title">{isExam ? 'Weak chapters' : 'Chapters with mistakes'}</h2>
        {needsStudy.length ? needsStudy.map((row) => (
          <div class="jp-mode-action-row" key={row.subject + row.chapter}>
            <span>{chapterName(row.subject, row.chapter)} · {isExam ? `${row.correct}/${row.total}` : `${row.mistakes} missed`}</span>
            {row.chapter && STUDY_TOPICS[row.subject]?.includes(row.chapter) && <a href={studyLink(row.subject, row.chapter)} class="jp-btn"
              aria-label={'Study this: ' + chapterName(row.subject, row.chapter)}>Study this</a>}
          </div>
        )) : <p class="jp-summary-sub">{isExam ? 'Every chapter reached 70%.' : 'No incorrect answers.'}</p>}
      </section>
      {isExam && <section class="jp-mode-list">
        <h2 class="jp-revisit-title">Review questions</h2>
        {questions.map((question, index) => <ModeCard key={question.id}
          href={href + '&review=' + encodeURIComponent(question.id)} title={`Review question ${index + 1}`}
          pill={getQuestionSourceLabel(question)}>
          {result.answers[question.id] === question.answerId ? 'Correct' : result.answers[question.id] ? 'Incorrect' : 'Unanswered'}
          {' · ' + formatTime(result.time[question.id] ?? 0)}
        </ModeCard>)}
      </section>}
      <div class="jp-mode-footer-links">
        <Feedback screen={title} />
      </div>
    </Panel>
  )
}
