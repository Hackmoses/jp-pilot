import { useEffect, useState } from 'preact/hooks'
import { ACCOUNTS_ENABLED } from '../../lib/config'
import { lagosDate, saveAnswer, savedAnswer, streak, type QotdFile, type QotdOption } from '../../lib/qotd'
import { getSubject } from '../../lib/subjects'

// Shows x^{2} and H_{2}O as superscripts and subscripts without loading the full maths renderer.
export function SimpleText({ text }: { text: string }) {
  const parts = text.split(/(\^\{[^}]*\}|_\{[^}]*\}|\^-?\d+)/g)
  return <>{parts.map((part, i) => part.startsWith('^{') ? <sup key={i}>{part.slice(2, -1)}</sup>
    : part.startsWith('_{') ? <sub key={i}>{part.slice(2, -1)}</sub>
    : part.startsWith('^') ? <sup key={i}>{part.slice(1)}</sup> : part)}</>
}

export function QuestionOfDay() {
  const date = lagosDate()
  const [day, setDay] = useState<QotdFile | null>(null)
  const [picked, setPicked] = useState<QotdOption['id'] | null>(null)
  const [count, setCount] = useState(() => streak(date))

  useEffect(() => {
    const controller = new AbortController()
    fetch(`${import.meta.env.BASE_URL}data/qotd/${date}.json`, { signal: controller.signal })
      .then((res) => res.ok ? res.json() as Promise<QotdFile> : null)
      .then((file) => {
        if (!file || file.date !== date) return
        setDay(file)
        setPicked(savedAnswer(date, file.id))
      })
      .catch(() => { /* Offline and not cached. The card stays hidden. */ })
    return () => controller.abort()
  }, [date])

  if (!day) return null
  const answered = picked !== null
  const correct = picked === day.answerId
  const pick = (id: QotdOption['id']) => {
    if (answered) return
    setPicked(id)
    setCount(saveAnswer(date, day.id, id))
  }

  return (
    <section class="home-card home-qotd" aria-labelledby="home-qotd-title">
      <div class="home-qotd-head">
        <h2 id="home-qotd-title" class="home-eyebrow home-eyebrow--hint">Question of the day</h2>
        {count > 0 && <span class="home-streak">{count}-day streak</span>}
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
      {answered ? <div class="home-qotd-result" role="status">
        <p class="home-qotd-verdict" data-correct={correct}>{correct ? 'Correct.' : 'Not quite.'}</p>
        <p class="home-qotd-why"><SimpleText text={day.explanation} /></p>
        <a class="home-link" href={'#/q?id=' + encodeURIComponent(day.id)}>
          {day.hasSolution ? 'Watch it explained →' : 'Open the full question →'}
        </a>
      </div> : <p class="home-note">{ACCOUNTS_ENABLED
        ? 'Free for everyone · doesn’t count toward your 4 free questions · new one at midnight'
        : 'Same question for every student today · new one at midnight'}</p>}
    </section>
  )
}
