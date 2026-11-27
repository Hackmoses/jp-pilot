import { useEffect, useRef, useState } from 'preact/hooks'
import { QuestionCard } from '../components/question/QuestionCard'
import { shortcutKey } from '../components/question/logic'
import { registerSavedQuestions } from '../lib/data'
import {
  finishAttempt, getAttempt, getPracticeResult, mistakeIds, saveAttempt, startAttempt, type Attempt,
} from '../lib/modes'
import index from '../lib/passage-index.json'
import { logEvent, recordAnswer } from '../lib/store'
import type { OptionId, Question } from '../lib/types'
import { ModeCard, Panel } from './Modes'
import { PassageText, type GapAnswer } from './PassagePanel'
import { passageNames, toPracticeQuestion, type PassageSet, type PassageType } from './passageData'
import '../components/question/question.css'
import './passage.css'

const setup = '#/practice?subject=english'
const list = '#/practice/passages'
const metadata = index as { id: string; type: PassageType; year: number; count: number }[]

function PassageRun({ set, questions, initial }: { set: PassageSet; questions: Question[]; initial: Attempt }) {
  const [attempt, setAttempt] = useState(initial)
  const [open, setOpen] = useState(() => !window.matchMedia('(max-width: 600px)').matches)
  const [full, setFull] = useState(false)
  const firstProof = useRef<HTMLLIElement>(null)
  const panel = useRef<HTMLElement>(null)
  const enteredAt = useRef(Date.now())
  const question = questions[attempt.index]
  const item = set.questions.find(({ number }) => number === (question.source as { id: number }).id)!
  const picked = attempt.answers[question.id] ?? null
  const proof = picked ? item.proof : []
  const gaps = new Map<number, GapAnswer>()
  if (set.type === 'cloze') {
    for (const entry of questions) {
      const answer = entry.options.find(({ id }) => id === attempt.answers[entry.id])
      if (answer) gaps.set((entry.source as { id: number }).id, {
        text: answer.text, correct: answer.id === entry.answerId,
      })
    }
  }

  useEffect(() => {
    if (!picked || !open || !firstProof.current || !panel.current) return
    const line = firstProof.current
    const scroller = line.parentElement!
    scroller.scrollTop += line.getBoundingClientRect().top - scroller.getBoundingClientRect().top
    panel.current.scrollIntoView({ block: 'nearest' })
  }, [picked, open, question.id])

  function save(next: Attempt) {
    saveAttempt(next)
    setAttempt(next)
  }

  function choose(id: OptionId) {
    if (picked) return
    const correct = id === question.answerId
    recordAnswer({ questionId: question.id, pickedId: id, correct, at: Date.now() })
    logEvent('answer', { questionId: question.id, pickedId: id, correct })
    setOpen(true)
    save({ ...attempt, answers: { ...attempt.answers, [question.id]: id } })
  }

  function move(delta: number) {
    const now = Date.now()
    const next = { ...attempt, index: attempt.index + delta, time: {
      ...attempt.time, [question.id]: (attempt.time[question.id] ?? 0) + now - enteredAt.current,
    } }
    if (next.index >= questions.length) {
      finishAttempt({ ...next, index: attempt.index }, now)
      return
    }
    if (next.index < 0) return
    setFull(false)
    enteredAt.current = now
    if (window.matchMedia('(max-width: 600px)').matches) setOpen(Boolean(next.answers[questions[next.index].id]))
    save(next)
    window.scrollTo({ top: 0 })
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const key = shortcutKey(event)
      if (key === 'p' && attempt.index > 0) { event.preventDefault(); move(-1) }
      if (key === 'n' || (key === 'enter' && picked && event.target === document.body)) {
        event.preventDefault(); move(1)
      }
      if (!picked && /^[abcd]$/.test(key)) { event.preventDefault(); choose(key as OptionId) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const last = attempt.index + 1 === questions.length
  return <main class="jp-screen jp-screen--session" data-answered={picked ? 'true' : 'false'}>
    <header class="jp-topbar"><div class="jp-topbar-inner">
      <div class="jp-brand-group">
        <a class="jp-session-back" href={list} aria-label="Back. Your place is saved">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
        </a>
        <a class="jp-logo" href="#/" aria-label="JP home">JP</a>
      </div>
      <div class="jp-topbar-actions">
        <a class="jp-btn jp-menu-btn" href="#/" aria-label="Home">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z" /></svg>
          <span>Menu</span>
        </a>
      </div>
    </div></header>
    <div class="jp-session-bar">
      <div class="jp-session-bar-inner">
        <span class="jp-session-topic">English · {passageNames[set.type]}</span>
        <div class="jp-session-meta">
          <div class="jp-progress-group"><span class="jp-counter">{attempt.index + 1} of {questions.length}</span>
            <div class="jp-progress-track" aria-hidden="true"><div class="jp-progress-fill" style={{ width: (attempt.index + 1) * 100 / questions.length + '%' }} /></div>
          </div>
        </div>
      </div>
    </div>
    <div class="jp-session-layout"><div class="jp-left-col">
    <section ref={panel} class="jp-card jp-passage-panel" aria-label={set.title}>
      <button type="button" class="jp-btn" aria-expanded={open} aria-controls="jp-reading-panel"
        onClick={() => setOpen(!open)}>{open ? 'Hide passage' : 'Show passage'}</button>
      <div id="jp-reading-panel" hidden={!open}>
        <PassageText passage={set.passage} proof={proof} gaps={gaps} firstProof={firstProof} />
      </div>
    </section>
    <QuestionCard question={question} review={attempt.reviewIds.includes(question.id)}
      options={question.options} pickedId={picked} onPick={choose}
      compact full={full} onFull={() => setFull(!full)} verdictReason={question.explanation}
      sourceLabel={`JAMB ${set.year} Q${item.number}`} />
    </div></div>
    <footer class="jp-footer-bar"><div class="jp-footer-inner"><div class="jp-footer-right">
      {attempt.index > 0 && <button type="button" class="jp-btn" onClick={() => move(-1)}>Previous</button>}
      <button type="button" class={picked ? 'jp-btn jp-btn--primary' : 'jp-btn'} onClick={() => move(1)}>
        {picked ? last ? 'See summary' : 'Next question' : 'Skip'}
      </button>
    </div></div></footer>
  </main>
}

export function ReadingPassages({ setId, retry }: { setId: string | null; retry: boolean }) {
  const [run, setRun] = useState<{ set: PassageSet; questions: Question[]; attempt: Attempt }>()
  const [failed, setFailed] = useState(false)
  const known = metadata.some(({ id }) => id === setId)
  useEffect(() => {
    if (!setId || !known) return
    const controller = new AbortController()
    void fetch(import.meta.env.BASE_URL + 'passages/' + setId + '.json', { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('Could not load passage')
        return response.json() as Promise<PassageSet>
      }).then((set) => {
        if (controller.signal.aborted) return
        if (set.id !== setId) throw new Error('Unexpected passage')
        const questions = set.questions.map((item) => toPracticeQuestion(set, item))
        registerSavedQuestions(questions, [])
        let attempt = getAttempt('practice')
        if (attempt?.passageId !== setId) {
          const result = getPracticeResult()
          const ids = retry && result?.passageId === setId ? mistakeIds(questions, result.answers) : []
          if (retry && !ids.length) throw new Error('No mistakes to retry')
          const queue = retry ? ids.map((id) => ({ id, review: true })) : questions.map(({ id }) => ({ id }))
          startAttempt('practice', ['english'], queue, 0, setId)
          attempt = getAttempt('practice')
          logEvent('session_start', { count: queue.length, questionIds: queue.map(({ id }) => id).join(',') })
        }
        const ordered = attempt!.ids.flatMap((id) => questions.find((question) => question.id === id) ?? [])
        if (!ordered.length || ordered.length !== attempt!.ids.length) throw new Error('Questions have changed')
        setRun({ set, questions: ordered, attempt: attempt! })
      }).catch(() => { if (!controller.signal.aborted) setFailed(true) })
    return () => controller.abort()
  }, [setId, known, retry])

  if (run) return <PassageRun set={run.set} questions={run.questions} initial={run.attempt} />
  if (setId) return <Panel title="Reading passages" back={list} backLabel="Reading passages">
    <p class="jp-mode-lead" role="status">{failed || !known ? 'Could not open this passage.' : 'Loading passage…'}</p>
  </Panel>

  const current = getAttempt('practice')?.passageId
  return <Panel title="Reading passages" back={setup} backLabel="English practice">
    <div class="jp-mode-list">{metadata.map(({ id, type, year, count }) =>
      <ModeCard key={id} href={list + '?set=' + id} title={passageNames[type]} pill={'JAMB ' + year}>
        {count} questions{current === id ? ' · Resume' : ''}
      </ModeCard>)}</div>
  </Panel>
}
