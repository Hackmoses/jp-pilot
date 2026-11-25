import { useEffect, useRef, useState } from 'preact/hooks'
import { getQuestionSourceLabel, makeOptionSeed } from '../components/question/logic'
import { QuestionCard } from '../components/question/QuestionCard'
import { COMPLETE_QUESTIONS_ONLY, getQuestion, getQuestionsBySubject, loadManifest, loadSubject } from '../lib/data'
import {
  EXAM_MINUTES, chapterName, finishAttempt, formatTime, getAttempt, getExamHistory, getExamSubjects,
  getPracticeResult, saveAttempt, saveExamSubjects, scoreAttempt, startAttempt, studyLink,
  type Attempt, type TestMode,
} from '../lib/modes'
import { shuffleOptions } from '../lib/shuffle'
import { SUBJECTS, getSubject } from '../lib/subjects'
import type { OptionId } from '../lib/types'
import { Countdown } from './Countdown'
import { ModeCard, Panel, useSubjects } from './Modes'
import { Session } from './Session'

export function ExamSetup({ rules = false }: { rules?: boolean }) {
  const [available, setAvailable] = useState<string[] | null>(null)
  const [failed, setFailed] = useState(false)
  const [selected, setSelected] = useState(getExamSubjects)

  useEffect(() => {
    let active = true
    void loadManifest().then(async (manifest) => {
      const candidates = SUBJECTS.filter(({ id }) => manifest[id]?.count &&
        (!COMPLETE_QUESTIONS_ONLY || manifest[id]?.hasAnimations))
      const loaded = await Promise.all(candidates.map(({ id }) => loadSubject(id)))
      if (!active) return
      setFailed(candidates.length === 0 || loaded.includes(false))
      setAvailable(candidates.filter(({ id }) => getQuestionsBySubject(id).length).map(({ id }) => id))
    })
    return () => { active = false }
  }, [])

  const pilot = !failed && available?.length === 1 && available[0] === 'chemistry'
  const subjects = pilot ? ['chemistry'] : selected.filter((id) => available?.includes(id))
  const ready = !failed && (pilot || (subjects.length === 4 && subjects.includes('english')))
  const choose = (id: string) => {
    const next = selected.includes(id) ? selected.filter((subject) => subject !== id) : [...selected, id]
    setSelected(next)
    saveExamSubjects(next)
  }

  if (rules && ready) {
    const minutes = pilot ? EXAM_MINUTES.pilot : EXAM_MINUTES.full
    const queue = subjects.flatMap((id) => getQuestionsBySubject(id).map(({ id }) => ({ id })))
    return (
      <Panel title="Exam rules" back="#/exam">
        <ul class="jp-revisit-list">
          <li>{queue.length} questions in {minutes} minutes.</li>
          <li>Move between questions and flag any you want to revisit.</li>
          <li>The timer keeps running if you leave. At zero, your answers are submitted automatically.</li>
          <li>Scores and explanations appear after submission.</li>
        </ul>
        <button class="jp-btn jp-btn--primary" onClick={() => {
          startAttempt('exam', subjects, queue, minutes)
          window.location.hash = '#/exam/run'
        }}>Start exam</button>
      </Panel>
    )
  }

  return (
    <Panel title="Exam setup">
      <p class="jp-summary-sub">
        {pilot ? 'Chemistry-only pilot. The other subjects have no complete questions yet.'
          : 'Choose three subjects alongside English Language.'}
      </p>
      {available === null ? <p class="jp-summary-sub">Checking available subjects…</p> : <>
        <fieldset class="jp-revisit">
          <legend class="jp-revisit-title">Subjects</legend>
          {SUBJECTS.filter(({ id }) => id === 'english' || available.includes(id)).map(({ id, name }) => {
            const english = id === 'english'
            const enabled = available.includes(id)
            const checked = english || (pilot && id === 'chemistry') || (enabled && selected.includes(id))
            return <label class="jp-mode-check" key={id}>
              <input type="checkbox" checked={checked}
                disabled={english || pilot || !enabled || (!checked && subjects.length >= 4)}
                onChange={() => choose(id)} />
              <span>{name}{!enabled && <span class="jp-summary-sub"> · Coming soon</span>}</span>
            </label>
          })}
        </fieldset>
        {failed && <p class="jp-summary-sub">Could not check all exam subjects.</p>}
        {ready && <a href="#/exam/rules" class="jp-btn jp-btn--primary">Read exam rules</a>}
      </>}
      {getAttempt('exam') && <a href="#/exam/run" class="jp-link-btn">Resume current exam</a>}
      {getExamHistory().length > 0 && <section class="jp-options">
        <h2 class="jp-revisit-title">Recent exams</h2>
        {getExamHistory().map((exam) => <ModeCard key={exam.id} href={'#/exam/results?id=' + exam.id}
          title={new Date(exam.finishedAt).toLocaleString()}>
          {exam.subjects.map((id) => getSubject(id)?.name ?? id).join(', ')}
        </ModeCard>)}
      </section>}
    </Panel>
  )
}

export function Run({ mode }: { mode: TestMode }) {
  const [attempt] = useState(() => getAttempt(mode))
  const status = useSubjects(attempt?.subjects ?? [])
  if (!attempt || status !== 'ready') return <Panel title={
    !attempt ? 'No session to resume' : status === 'loading' ? 'Loading questions…' : 'Could not load questions'
  } back={mode === 'exam' ? '#/exam' : '#/subjects?mode=practice'} />
  if (!attempt.ids.every((id) => getQuestion(id))) return <Panel title="Some questions are no longer available" />
  return mode === 'practice' ? <Session attempt={attempt} /> : <Exam attempt={attempt} />
}

function Exam({ attempt }: { attempt: Attempt }) {
  const [, redraw] = useState(0)
  const dialog = useRef<HTMLDialogElement>(null)
  const enteredAt = useRef(document.hidden ? null : Date.now())
  const question = getQuestion(attempt.ids[attempt.index])!
  const options = shuffleOptions(question, makeOptionSeed(question.id, attempt.startedAt))
  const remaining = attempt.ids.filter((id) => !attempt.answers[id]).length
  const deadline = attempt.deadline!

  function checkpoint(now = Date.now()) {
    if (enteredAt.current === null) return
    const id = attempt.ids[attempt.index]
    attempt.time[id] = (attempt.time[id] ?? 0) + Math.max(0, Math.min(now, deadline) - enteredAt.current)
    enteredAt.current = null
  }

  useEffect(() => {
    const persist = () => {
      checkpoint()
      if (getAttempt('exam')?.id === attempt.id) saveAttempt(attempt)
    }
    const visibility = () => {
      if (document.hidden) persist()
      else if (enteredAt.current === null) enteredAt.current = Date.now()
    }
    document.addEventListener('visibilitychange', visibility)
    window.addEventListener('pagehide', persist)
    return () => {
      document.removeEventListener('visibilitychange', visibility)
      window.removeEventListener('pagehide', persist)
      persist()
    }
  }, [attempt])

  const finish = () => {
    checkpoint()
    if (dialog.current?.open) dialog.current.close()
    finishAttempt(attempt, Date.now())
  }
  const change = (action: () => void) => {
    const now = Date.now()
    if (now >= deadline) { finish(); return }
    checkpoint(now)
    action()
    enteredAt.current = now
    saveAttempt(attempt)
    redraw((value) => value + 1)
  }
  const go = (index: number) => change(() => { attempt.index = index })
  const pick = (id: OptionId) => change(() => { attempt.answers[question.id] = id })

  return (
    <main class="jp-screen jp-screen--session" data-answered="false">
      <header class="jp-topbar jp-exam-topbar">
        <div class="jp-topbar-inner">
          <a class="jp-logo" href="#/modes" aria-label="JP modes">JP</a>
          <span class="jp-counter">{getSubject(question.subject)?.name} · {attempt.index + 1} of {attempt.ids.length}</span>
          <Countdown deadline={deadline} onExpire={finish} />
          <button class="jp-btn" onClick={() => dialog.current?.showModal()}>Submit</button>
        </div>
      </header>
      <div class="jp-session-layout">
        <div class="jp-left-col">
          <QuestionCard exam question={question} review={false} options={options}
            pickedId={attempt.answers[question.id] ?? null} onPick={pick} />
          <div class="jp-mode-action-row">
            <button class="jp-btn" disabled={attempt.index === 0} onClick={() => go(attempt.index - 1)}>Previous</button>
            <button class="jp-btn" aria-pressed={Boolean(attempt.flagged[question.id])}
              onClick={() => change(() => { attempt.flagged[question.id] = !attempt.flagged[question.id] })}>
              {attempt.flagged[question.id] ? 'Unflag' : 'Flag'}
            </button>
            <button class="jp-btn jp-btn--primary" disabled={attempt.index + 1 === attempt.ids.length}
              onClick={() => go(attempt.index + 1)}>Next</button>
          </div>
          <section class="jp-revisit" aria-label="Question palette">
            <h2 class="jp-revisit-title">Question palette</h2>
            <p class="jp-summary-sub">✓ Answered · ○ Unanswered · ⚑ Flagged</p>
            <div class="jp-exam-palette">
              {attempt.ids.map((id, index) => {
                const answered = Boolean(attempt.answers[id])
                const flagged = Boolean(attempt.flagged[id])
                return <button key={id} type="button" class="jp-btn"
                  aria-label={`Question ${index + 1}, ${answered ? 'answered' : 'unanswered'}${flagged ? ', flagged' : ''}`}
                  aria-current={index === attempt.index ? 'step' : undefined} onClick={() => go(index)}>
                  {index + 1}{flagged ? ' ⚑' : answered ? ' ✓' : ' ○'}
                </button>
              })}
            </div>
          </section>
        </div>
      </div>
      <dialog class="jp-subjects-dialog" ref={dialog} aria-labelledby="jp-exam-submit-title">
        <h2 id="jp-exam-submit-title">Submit exam?</h2>
        <p>{remaining} {remaining === 1 ? 'question' : 'questions'} unanswered.</p>
        <div class="jp-subjects-dialog-actions">
          <button class="jp-btn" onClick={() => dialog.current?.close()}>Keep working</button>
          <button class="jp-btn jp-btn--primary" onClick={finish}>Submit exam</button>
        </div>
      </dialog>
    </main>
  )
}

export function Results({ mode, params }: { mode: TestMode; params: URLSearchParams }) {
  const id = params.get('id')
  const reviewId = params.get('review')
  const result = mode === 'exam' ? getExamHistory().find((result) => result.id === id) : getPracticeResult()
  const status = useSubjects(result?.subjects ?? [])
  const isExam = mode === 'exam'
  const title = isExam ? 'Exam results' : 'Practice summary'
  const back = isExam ? '#/exam' : '#/practice?subject=' + encodeURIComponent(result?.subjects[0] ?? 'chemistry')
  if (!result || (id && result.id !== id) || status !== 'ready') return <Panel title={title} back={back}>
    <p class="jp-summary-sub">{status === 'loading' ? 'Loading questions…'
      : status === 'error' ? 'Could not load questions.' : 'No saved result found.'}</p>
  </Panel>
  const href = '#/' + mode + '/results?id=' + result.id
  const questions = result.ids.flatMap((id) => getQuestion(id) ?? [])
  if (isExam && reviewId && questions.some((question) => question.id === reviewId)) {
    return <Session review={{ id: reviewId, result, href }} />
  }
  const score = scoreAttempt(questions, result.answers)
  const strong = score.chapters.filter((row) => row.correct / row.total >= 0.7)
  const needsStudy = isExam ? score.chapters.filter((row) => !strong.includes(row)) : score.chapters.filter((row) => row.mistakes)
  return (
    <Panel title={title} back={back}>
      <section class="jp-summary-card" aria-label="Score">
        <strong class="jp-summary-score">{score.correct} of {score.total}{isExam && ` · ${score.percent}%`}</strong>
        <p class="jp-summary-sub">{score.answered} answered · {formatTime(result.finishedAt - result.startedAt)} taken</p>
      </section>
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
            {row.chapter && <a href={studyLink(row.subject, row.chapter)} class="jp-btn"
              aria-label={'Study this: ' + chapterName(row.subject, row.chapter)}>Study this</a>}
          </div>
        )) : <p class="jp-summary-sub">{isExam ? 'Every chapter reached 70%.' : 'No incorrect answers.'}</p>}
      </section>
      {isExam && <section class="jp-options">
        <h2 class="jp-revisit-title">Review questions</h2>
        {questions.map((question, index) => <ModeCard key={question.id}
          href={href + '&review=' + encodeURIComponent(question.id)} title={`Review question ${index + 1}`}
          pill={getQuestionSourceLabel(question)}>
          {result.answers[question.id] === question.answerId ? 'Correct' : result.answers[question.id] ? 'Incorrect' : 'Unanswered'}
          {' · ' + formatTime(result.time[question.id] ?? 0)}
        </ModeCard>)}
      </section>}
    </Panel>
  )
}
