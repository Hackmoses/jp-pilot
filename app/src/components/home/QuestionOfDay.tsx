import { useEffect, useState } from 'preact/hooks'
import { ACCOUNTS_ENABLED } from '../../lib/config'
import { addDays, lagosDate, saveAnswer, savedAnswer, streak, type QotdFile, type QotdOption } from '../../lib/qotd'
import { getSubject } from '../../lib/subjects'

// Shows x^{2} and H_{2}O as superscripts and subscripts without loading the full maths renderer.
export function SimpleText({ text }: { text: string }) {
  const parts = text.split(/(\^\{[^}]*\}|_\{[^}]*\}|\^-?\d+)/g)
  return <>{parts.map((part, i) => part.startsWith('^{') ? <sup key={i}>{part.slice(2, -1)}</sup>
    : part.startsWith('_{') ? <sub key={i}>{part.slice(2, -1)}</sub>
    : part.startsWith('^') ? <sup key={i}>{part.slice(1)}</sup> : part)}</>
}

const base = import.meta.env.BASE_URL + 'data/qotd/'

async function fetchJson<T>(url: string, ms: number, signal: AbortSignal): Promise<T | null> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), ms)
  signal.addEventListener('abort', () => controller.abort())
  try {
    const res = await fetch(url, { signal: controller.signal })
    return res.ok ? await res.json() as T : null
  } catch { return null } finally { clearTimeout(timer) }
}

function lightConnection() {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection
  return Boolean(connection?.saveData || connection?.effectiveType?.includes('2g'))
}

// Fetch the next week's files when the page is quiet. The offline worker keeps them, so the
// question still works on days without signal.
function prefetchWeek(date: string) {
  if (lightConnection()) return
  const run = () => { for (let i = 1; i <= 7; i++) void fetch(base + addDays(date, i) + '.json').catch(() => {}) }
  if ('requestIdleCallback' in window) window.requestIdleCallback(run, { timeout: 8000 })
  else setTimeout(run, 4000)
}

type Load = { state: 'loading' } | { state: 'today'; day: QotdFile } | { state: 'backup'; day: QotdFile }

// Built into the page, so even a first visit with no network still gets a question to answer.
const EMBEDDED: QotdFile = {
  date: 'backup', subject: 'physics', id: 'phys-jamb-2006-045', year: '2006',
  stem: 'A drop of petrol makes a finger colder than a drop of water would because',
  options: [
    { id: 'a', text: 'petrol takes its latent heat of fusion from the finger' },
    { id: 'b', text: 'petrol takes its latent heat of vaporization from the finger' },
    { id: 'c', text: 'water has higher surface tension' },
    { id: 'd', text: 'water is more viscous than petrol' },
  ],
  answerId: 'b',
  explanation: 'Petrol evaporates much faster than water. Evaporating takes latent heat of vaporization, and the petrol takes that heat from the finger, so the finger feels colder.',
  hasSolution: false,
} as QotdFile

export function QuestionOfDay({ showStreak = false }: { showStreak?: boolean }) {
  const date = lagosDate()
  const [load, setLoad] = useState<Load>({ state: 'loading' })
  const [attempt, setAttempt] = useState(0)
  const [picked, setPicked] = useState<QotdOption['id'] | null>(null)
  const [count, setCount] = useState(() => streak(date))

  useEffect(() => {
    const controller = new AbortController()
    setLoad({ state: 'loading' })
    void (async () => {
      const today = await fetchJson<QotdFile>(base + date + '.json', 6000, controller.signal)
      if (controller.signal.aborted) return
      if (today && today.date === date) {
        setLoad({ state: 'today', day: today })
        setPicked(savedAnswer(date, today.id))
        prefetchWeek(date)
        return
      }
      const backup = await fetchJson<QotdFile[]>(base + 'backup.json', 4000, controller.signal)
      if (controller.signal.aborted) return
      if (backup?.length) {
        const pick = backup[Math.abs(Math.floor(Date.parse(date) / 86_400_000)) % backup.length]
        setLoad({ state: 'backup', day: pick })
        setPicked(null)
      } else setLoad({ state: 'backup', day: EMBEDDED })
    })()
    return () => controller.abort()
  }, [date, attempt])

  if (load.state === 'loading') return (
    <section class="home-card home-qotd home-qotd--loading" aria-busy="true" aria-label="Question of the day is loading">
      <p class="home-eyebrow home-eyebrow--hint">Question of the day</p>
      <span class="home-skeleton home-skeleton--short" />
      <span class="home-skeleton" />
      <span class="home-skeleton" />
      <div class="home-qotd-options">{[0, 1, 2, 3].map((i) => <span key={i} class="home-skeleton home-skeleton--option" />)}</div>
    </section>
  )

  const { day } = load
  const offline = load.state === 'backup'
  const answered = picked !== null
  const correct = picked === day.answerId
  const pick = (id: QotdOption['id']) => {
    if (answered) return
    setPicked(id)
    if (!offline) setCount(saveAnswer(date, day.id, id))
  }

  return (
    <section class="home-card home-qotd" aria-labelledby="home-qotd-title">
      <div class="home-qotd-head">
        <h2 id="home-qotd-title" class="home-eyebrow home-eyebrow--hint">{offline ? 'Offline question' : 'Question of the day'}</h2>
        {showStreak && !offline && count > 0 && <span class="home-streak">{count}-day streak</span>}
      </div>
      <p class="home-qotd-source">{getSubject(day.subject)?.name ?? day.subject} · JAMB {day.year}</p>
      <p class="home-qotd-stem"><SimpleText text={day.stem} /></p>
      <div class="home-qotd-options" role="group" aria-label="Options">
        {day.options.map((option, i) => {
          const state = !answered ? '' : option.id === day.answerId ? 'correct' : option.id === picked ? 'wrong' : 'dim'
          return <button key={option.id} type="button" class="home-qotd-option" data-state={state}
            aria-pressed={picked === option.id} disabled={answered && state === 'dim'} onClick={() => pick(option.id)}>
            <b>{String.fromCharCode(65 + i)}</b> <SimpleText text={option.text} />
          </button>
        })}
      </div>
      {answered && <div class="home-qotd-result" role="status">
        <p class="home-qotd-verdict" data-correct={correct}>{correct ? 'Correct.' : 'Not quite.'}</p>
        <p class="home-qotd-why"><SimpleText text={day.explanation} /></p>
        <a class="home-link" href={'#/q?id=' + encodeURIComponent(day.id)}>
          {day.hasSolution ? 'Watch it explained →' : 'Open the full question →'}
        </a>
      </div>}
      {offline
        ? <p class="home-note">Today’s question could not load, so here is one saved on your phone. It doesn’t count toward your streak. <button type="button" class="home-text-btn" onClick={() => setAttempt((n) => n + 1)}>Try again</button></p>
        : !answered && <p class="home-note">{ACCOUNTS_ENABLED
          ? 'Free for everyone · doesn’t count toward your 4 free questions · new one at midnight'
          : 'Same question for every student today · new one at midnight'}</p>}
    </section>
  )
}
