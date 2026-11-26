import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks'
import { cardReviews, rateCard, saveCardReview, selectCards } from '../../lib/leitner'
import { Panel } from '../../screens/Modes'
import './card-viewer.css'

type Card = {
  id: string; front: string; meaning: string; example: string
  synonym?: string; antonym?: string; trap?: string
  rule?: { text: string; right: string; wrong: string }
  jamb?: { year: number; number: number }
}

export function CardViewer({ deck, title, back }: { deck: string; title: string; back: string }) {
  const [cards, setCards] = useState<Card[]>()
  const [session, setSession] = useState<Card[]>([])
  const [position, setPosition] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const touch = useRef<{ x: number; y: number }>()
  const button = useRef<HTMLButtonElement>(null)
  const nextCard = useRef(false)
  const card = session[position]

  const start = (available: Card[]) => {
    setSession(selectCards(available, cardReviews(deck), Date.now()))
    setPosition(0)
    setFlipped(false)
  }

  useEffect(() => {
    const controller = new AbortController()
    fetch(import.meta.env.BASE_URL + 'cards/' + deck + '.json', { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('Could not load cards')
        return response.json() as Promise<{ cards: Card[] }>
      })
      .then(({ cards }) => {
        if (controller.signal.aborted) return
        setCards(cards)
        start(cards)
      })
      .catch(() => { if (!controller.signal.aborted) setFailed(true) })
    return () => controller.abort()
  }, [deck, attempt])

  const rate = (knew: boolean) => {
    if (!card || !flipped) return
    const now = Date.now()
    saveCardReview(deck, card.id, rateCard(cardReviews(deck)[card.id], knew, now))
    nextCard.current = true
    setPosition(position + 1)
    setFlipped(false)
  }

  useLayoutEffect(() => {
    if (!nextCard.current) return
    nextCard.current = false
    button.current?.focus({ preventScroll: true })
  }, [position])

  useLayoutEffect(() => {
    if (!card) return
    const keyDown = (event: KeyboardEvent) => {
      if (event.repeat || event.altKey || event.ctrlKey || event.metaKey) return
      const target = event.target
      if (target instanceof HTMLElement && target.closest('input, textarea, select, [contenteditable]')) return
      if (event.code === 'Space' && !(target instanceof HTMLElement && target.closest('button, a'))) {
        event.preventDefault()
        setFlipped(!flipped)
      }
      if (event.key === '1' || event.key === '2') rate(event.key === '2')
    }
    window.addEventListener('keydown', keyDown)
    return () => window.removeEventListener('keydown', keyDown)
  }, [card, flipped])

  return <Panel title={title} subtitle="Word cards" back={back}>
    {failed ? <div class="jp-mode-list">
      <p class="jp-mode-lead" role="status">Could not load this deck.</p>
      <button class="jp-btn" onClick={() => { setFailed(false); setAttempt(attempt + 1) }}>Try again</button>
    </div> : !cards ? <p class="jp-mode-lead" role="status">Loading cards…</p> : card ? (
      <div class="jp-mode-list">
        <p class="jp-summary-sub" role="status">Card {position + 1} of {session.length}</p>
        <div class="jp-progress-track" aria-hidden="true">
          <div class="jp-progress-fill" style={{ width: position * 100 / session.length + '%' }} />
        </div>
        <button ref={button} type="button" class="jp-card jp-word-card" aria-expanded={flipped}
          onClick={() => setFlipped(!flipped)}
          onTouchStart={(event) => {
            const finger = event.touches[0]
            touch.current = event.touches.length === 1 ? { x: finger.clientX, y: finger.clientY } : undefined
          }}
          onTouchCancel={() => { touch.current = undefined }}
          onTouchEnd={(event) => {
            const start = touch.current
            touch.current = undefined
            if (!start) return
            const finger = event.changedTouches[0]
            const dx = finger.clientX - start.x
            const dy = finger.clientY - start.y
            if (Math.abs(dx) >= 50 && Math.abs(dx) > Math.abs(dy)) {
              if (event.cancelable) event.preventDefault()
              rate(dx > 0)
            } else if (event.cancelable && Math.abs(dx) <= 10 && Math.abs(dy) <= 10) {
              event.preventDefault()
              setFlipped(!flipped)
            }
          }}>
          <span class="jp-word-card-face" key={card.id + flipped}>
            <strong class="jp-mode-card-title">{card.front}</strong>
            {flipped ? <>
              <span>{card.meaning}</span>
              {card.synonym && <span>Synonym · {card.synonym}</span>}
              {card.antonym && <span>Antonym · {card.antonym}</span>}
              <span>{card.example}</span>
              {card.jamb && <span class="jp-summary-sub">JAMB {card.jamb.year} · Question {card.jamb.number}</span>}
              {card.trap && <span><strong>Common mistake</strong> · {card.trap}</span>}
              {card.rule && <>
                <span>{card.rule.text}</span>
                <span>Right · {card.rule.right}</span>
                <span>Wrong · {card.rule.wrong}</span>
              </>}
            </> : <span class="jp-summary-sub">Tap or press Space to flip</span>}
          </span>
        </button>
        {flipped && <div class="jp-pills">
          <button class="jp-btn" type="button" onClick={() => rate(false)}>Again</button>
          <button class="jp-btn jp-btn--primary" type="button" onClick={() => rate(true)}>I knew it</button>
        </div>}
      </div>
    ) : <div class="jp-mode-list">
      <p class="jp-mode-lead" role="status">{session.length ? 'Session complete.' : 'You’re caught up. Come back when cards are due.'}</p>
      {session.length > 0 && selectCards(cards, cardReviews(deck), Date.now()).length > 0 &&
        <button class="jp-btn jp-btn--primary" onClick={() => start(cards)}>Start another session</button>}
      <a class="jp-btn" href={back}>Back to topic</a>
    </div>}
  </Panel>
}
