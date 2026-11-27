import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks'
import { makeOptionSeed, shortcutKey } from '../components/question/logic'
import { QuestionCard } from '../components/question/QuestionCard'
import { finishAttempt, getAttempt, getAttemptQuestions, saveAttempt, takeExamEntry, type Attempt } from '../lib/modes'
import { shuffleOptions } from '../lib/shuffle'
import { getSubject } from '../lib/subjects'
import type { OptionId } from '../lib/types'
import { AttemptRun } from './AttemptRun'
import { Countdown } from './Countdown'
import { calculator as calculatorModule } from './examModules'
import { Panel } from './Modes'

export function ExamRun() {
  const [entered, setEntered] = useState(takeExamEntry)
  return <AttemptRun mode="exam">{(attempt) => entered ? <Exam attempt={attempt} /> :
    <Panel title="Continue your exam" back="#/exam">
      <div class="jp-pills">
        {attempt.deadline !== null && <Countdown deadline={attempt.deadline} onExpire={() => finishAttempt(attempt, Date.now())} />}
      </div>
      <button class="jp-btn jp-btn--primary jp-btn--full" onClick={() => setEntered(true)}>Continue your exam</button>
    </Panel>
  }</AttemptRun>
}

function Exam({ attempt }: { attempt: Attempt }) {
  const [, redraw] = useState(0)
  const dialog = useRef<HTMLDialogElement>(null)
  const calculator = useRef<HTMLDialogElement>(null)
  const [calculatorUsed, setCalculatorUsed] = useState(false)
  const { View: Calculator, failed: calculatorFailed } = calculatorModule.useView(calculatorUsed)
  const enteredAt = useRef(document.hidden ? null : Date.now())
  const question = getAttemptQuestions(attempt)[attempt.index]
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
  const flag = () => change(() => { attempt.flagged[question.id] = !attempt.flagged[question.id] })
  const submit = () => dialog.current?.showModal()

  useLayoutEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      const key = shortcutKey(event)
      const option = key.length === 1 ? options['abcd'.indexOf(key)] : undefined
      if (option) pick(option.id)
      else if (key === 'n' && attempt.index + 1 < attempt.ids.length) go(attempt.index + 1)
      else if (key === 'p' && attempt.index > 0) go(attempt.index - 1)
      else if (key === 'f') flag()
      else if (key === 's') submit()
      else return
      event.preventDefault()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  })

  return (
    <main class="jp-screen jp-screen--session" data-answered="false">
      <header class="jp-topbar jp-exam-topbar">
        <div class="jp-topbar-inner">
          <div class="jp-brand-group">
            <a class="jp-logo" href="#/" aria-label="JP home">JP</a>
            <span class="jp-counter">{getSubject(question.subject)?.name} · {attempt.index + 1} of {attempt.ids.length}</span>
          </div>
          <div class="jp-exam-topbar-right">
            <Countdown deadline={deadline} onExpire={finish} />
            <button type="button" class="jp-btn" onClick={submit}>Submit</button>
          </div>
        </div>
      </header>
      <div class="jp-session-layout">
        <div class="jp-left-col">
          <QuestionCard exam question={question} review={false} options={options}
            pickedId={attempt.answers[question.id] ?? null} onPick={pick} />
          <span class="jp-kbd-hints jp-hide-sm">Shortcuts · A–D choose · N next · P previous · F flag · S submit</span>
          <section class="jp-revisit" aria-label="Question palette">
            <h2 class="jp-revisit-title">Question palette</h2>
            <p class="jp-summary-sub">✓ Answered · ○ Unanswered · ⚑ Flagged</p>
            <div class="jp-exam-palette">
              {attempt.ids.map((id, index) => {
                const answered = Boolean(attempt.answers[id])
                const flagged = Boolean(attempt.flagged[id])
                const state = flagged ? 'flagged' : answered ? 'answered' : 'unanswered'
                return <button key={id} type="button" class="jp-btn"
                  data-state={state}
                  aria-label={`Question ${index + 1}, ${answered ? 'answered' : 'unanswered'}${flagged ? ', flagged' : ''}`}
                  aria-current={index === attempt.index ? 'step' : undefined} onClick={() => go(index)}>
                  {index + 1}{flagged ? ' ⚑' : answered ? ' ✓' : ' ○'}
                </button>
              })}
            </div>
          </section>
        </div>
      </div>
      <footer class="jp-footer-bar jp-exam-footer">
        <div class="jp-footer-inner">
          <div class="jp-exam-footer-actions">
            <button type="button" class="jp-btn" disabled={attempt.index === 0} onClick={() => go(attempt.index - 1)}>Previous</button>
            <button type="button" class="jp-btn jp-exam-flag" aria-pressed={Boolean(attempt.flagged[question.id])}
              onClick={flag}>
              {attempt.flagged[question.id] ? 'Unflag' : 'Flag'}
            </button>
            <button type="button" class="jp-btn" onClick={() => {
              setCalculatorUsed(true)
              calculator.current?.showModal()
            }}>Calculator</button>
            <div class="jp-exam-footer-nav">
              <button type="button" class="jp-btn jp-btn--primary" disabled={attempt.index + 1 === attempt.ids.length}
                onClick={() => go(attempt.index + 1)}>Next</button>
            </div>
          </div>
        </div>
      </footer>
      <dialog class="jp-dialog jp-calc-dialog" ref={calculator} aria-labelledby="jp-calculator-title">
        <h2 id="jp-calculator-title">Calculator</h2>
        {calculatorUsed && (Calculator ? <Calculator close={() => calculator.current?.close()} /> : <>
          <p class="jp-mode-lead" role="status">{calculatorFailed ? 'Could not open the calculator.' : 'Loading…'}</p>
          <div class="jp-dialog-actions">
            <button type="button" class="jp-btn" onClick={() => calculator.current?.close()}>Close</button>
          </div>
        </>)}
      </dialog>
      <dialog class="jp-dialog" ref={dialog} aria-labelledby="jp-exam-submit-title">
        <h2 id="jp-exam-submit-title">Submit exam?</h2>
        <p>{remaining} {remaining === 1 ? 'question' : 'questions'} unanswered.</p>
        <div class="jp-dialog-actions">
          <button type="button" class="jp-btn" onClick={() => dialog.current?.close()}>Keep working</button>
          <button type="button" class="jp-btn jp-btn--primary" onClick={finish}>Submit exam</button>
        </div>
      </dialog>
    </main>
  )
}
