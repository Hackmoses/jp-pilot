import { useEffect, useState } from 'preact/hooks'
import { getQuestionsBySubject, loadManifest, loadSubject, manifestPoolCount } from '../lib/data'
import {
  EXAM_MINUTES, continueExam, getAttempt, getAttemptQuestions, getExamHistory, getExamSubjects,
  saveExamSubjects, scoreAttempt, startAttempt,
} from '../lib/modes'
import { SUBJECTS, getSubject } from '../lib/subjects'
import { prepareExam } from './examModules'
import { ModeCard, Panel } from './Modes'

export function ExamSetup({ rules = false }: { rules?: boolean }) {
  const [available, setAvailable] = useState<string[] | null>(null)
  const [failed, setFailed] = useState(false)
  const [selected, setSelected] = useState(getExamSubjects)
  const [modules, setModules] = useState<'loading' | 'ready' | 'error'>('loading')
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let active = true
    void prepareExam().then(
      () => { if (active) setModules('ready') },
      () => { if (active) setModules('error') },
    )
    return () => { active = false }
  }, [])

  // Availability comes from the manifest. Only the chosen subjects are downloaded, when the rules open.
  useEffect(() => {
    let active = true
    void loadManifest().then((manifest) => {
      if (!active) return
      const ids = SUBJECTS.filter(({ id }) => manifestPoolCount(id, 'practice') > 0).map(({ id }) => id)
      setFailed(Object.keys(manifest).length === 0)
      setAvailable(ids)
    })
    return () => { active = false }
  }, [])

  const pilot = !failed && available?.length === 1 && available[0] === 'chemistry'
  const subjects = pilot ? ['chemistry'] : selected.filter((id) => available?.includes(id))
  const ready = !failed && (pilot || (subjects.length === 4 && subjects.includes('english')))
  const history = getExamHistory().map((exam) => ({
    exam, score: scoreAttempt(getAttemptQuestions(exam), exam.answers),
  }))
  const latest = history[0]?.score
  const subjectKey = subjects.join(',')
  useEffect(() => {
    if (!rules || !ready) return
    let active = true
    setLoaded(false)
    void Promise.all(subjects.map((id) => loadSubject(id))).then((results) => {
      if (!active) return
      if (results.includes(false)) setFailed(true)
      setLoaded(true)
    })
    return () => { active = false }
  }, [rules, ready, subjectKey])
  const previous = history[1]?.score
  const change = latest?.total && previous?.total ? latest.percent - previous.percent : null
  const choose = (id: string) => {
    const next = selected.includes(id) ? selected.filter((subject) => subject !== id) : [...selected, id]
    setSelected(next)
    saveExamSubjects(next)
  }

  if (rules && ready && !loaded) {
    return <Panel title="Exam rules" back="#/exam"><p class="jp-mode-lead" role="status">Loading questions…</p></Panel>
  }

  if (rules && ready) {
    const minutes = pilot ? EXAM_MINUTES.pilot : EXAM_MINUTES.full
    const queue = subjects.flatMap((id) => getQuestionsBySubject(id, 'practice').map(({ id }) => ({ id })))
    return (
      <Panel title="Exam rules" back="#/exam">
        <section class="jp-card">
          <ul class="jp-revisit-list">
            <li>{queue.length} questions in {minutes} minutes.</li>
            <li>Move between questions and flag any you want to revisit.</li>
            <li>The timer keeps running if you leave. At zero, your answers are submitted automatically.</li>
            <li>Scores and explanations appear after submission.</li>
          </ul>
        </section>
        {modules !== 'ready' && <p class="jp-mode-lead" role="status">{modules === 'loading'
          ? 'Preparing the exam for offline use…' : 'Could not prepare the exam. Reconnect and reload the page.'}</p>}
        <button class="jp-btn jp-btn--primary jp-btn--full" disabled={modules !== 'ready'} onClick={() => {
          startAttempt('exam', subjects, queue, minutes)
          continueExam()
        }}>Start exam</button>
      </Panel>
    )
  }

  const subtitle = pilot
    ? 'Chemistry-only pilot. The other subjects have no practice questions yet.'
    : 'Choose three subjects alongside English Language.'

  return (
    <Panel title="Exam setup" subtitle={subtitle}>
      {getAttempt('exam') && <button class="jp-btn jp-btn--primary jp-btn--full" onClick={continueExam}>Continue your exam</button>}
      {available === null ? <p class="jp-mode-lead">Checking available subjects…</p> : <>
        <fieldset class="jp-mode-section">
          <legend class="jp-revisit-title">Subjects</legend>
          <div class="jp-mode-section-body">
            <div class="jp-mode-checks">
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
            </div>
          </div>
        </fieldset>
        {failed && <p class="jp-mode-lead">Could not check all exam subjects.</p>}
        {ready && <a href="#/exam/rules" class="jp-btn jp-btn--primary jp-btn--full">Read exam rules</a>}
      </>}
      {history.length > 0 && <section class="jp-mode-list">
        <h2 class="jp-revisit-title">Recent exams</h2>
        {change !== null && <p class="jp-mode-lead">{change === 0 ? 'Latest score unchanged' :
          `Latest score ${change > 0 ? 'up' : 'down'} ${Math.abs(change)} percentage points`}</p>}
        {history.map(({ exam, score }) => <ModeCard key={exam.id} href={'#/exam/results?id=' + exam.id}
          title={new Date(exam.finishedAt).toLocaleString()}>
          {exam.subjects.map((id) => getSubject(id)?.name ?? id).join(', ')}
          {score.total > 0 && ` · ${score.correct}/${score.total} (${score.percent}%)`}
        </ModeCard>)}
      </section>}
    </Panel>
  )
}
