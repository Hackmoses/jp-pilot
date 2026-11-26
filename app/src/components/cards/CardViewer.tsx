import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks'
import { cardReviews, rateCard, saveCardReview, selectCards } from '../../lib/leitner'
import { Panel } from '../../screens/Modes'
import './card-viewer.css'

type Card = {
  id: string; front: string; meaning: string; example: string
  check?: boolean
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
        <div class="jp-word-progress">
          <div class="jp-word-progress-row">
            <p class="jp-summary-sub jp-word-counter" role="status">Card {position + 1} of {session.length}</p>
            <span class="jp-word-hint">{flipped ? 'Rate how well you knew it' : 'Space or tap to flip'}</span>
          </div>
          <div class="jp-progress-track" aria-hidden="true">
            <div class="jp-progress-fill" style={{ width: position * 100 / session.length + '%' }} />
          </div>
        </div>
        <button ref={button} type="button" class="jp-card jp-word-card" data-flipped={flipped ? 'true' : 'false'} aria-expanded={flipped}
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
          {!flipped ? (
            <span class="jp-word-card-face jp-word-card-front" key={card.id + 'front'}>
              <span class="jp-try-kicker">{title}</span>
              <strong class="jp-word-front-term">{card.front}</strong>
              <span class="jp-word-flip-cue">Tap or press Space to flip</span>
            </span>
          ) : (
            <span class="jp-word-card-face jp-word-card-back" key={card.id + 'back'}>
              <span class="jp-word-card-head">
                <strong class="jp-word-back-term">{card.front}</strong>
                {card.jamb && <span class="jp-word-jamb">JAMB {card.jamb.year} · Q{card.jamb.number}</span>}
              </span>
              <span class="jp-word-meaning">{card.meaning}</span>
              {(card.synonym || card.antonym) && (
                <span class="jp-word-relations">
                  {card.synonym && <span class="jp-word-rel jp-word-rel--syn"><strong>Synonym</strong> {card.synonym}</span>}
                  {card.antonym && <span class="jp-word-rel jp-word-rel--ant"><strong>Antonym</strong> {card.antonym}</span>}
                </span>
              )}
              <span class="jp-word-example">{card.example}</span>
              {card.rule && (
                <span class="jp-word-rule">
                  <span class="jp-word-rule-text">{card.rule.text}</span>
                  <span class="jp-word-compare">
                    <span class="jp-word-right"><strong>✓ Right</strong> {card.rule.right}</span>
                    <span class="jp-word-wrong"><strong>✕ Wrong</strong> {card.rule.wrong}</span>
                  </span>
                </span>
              )}
              {card.trap && <span class="jp-word-trap"><strong>Common mistake</strong> {card.trap}</span>}
            </span>
          )}
        </button>
        {flipped && <div class="jp-word-actions">
          <button class="jp-btn jp-word-btn-again" type="button" onClick={() => rate(false)}>
            <span>Again</span><kbd class="jp-word-kbd">1</kbd>
          </button>
          <button class="jp-btn jp-btn--primary jp-word-btn-knew" type="button" onClick={() => rate(true)}>
            <span>I knew it</span><kbd class="jp-word-kbd jp-word-kbd--primary">2</kbd>
          </button>
        </div>}
      </div>
    ) : <section class="jp-card jp-word-done">
      <h2 class="jp-mode-card-title">{session.length ? 'Session complete' : 'All caught up'}</h2>
      <p class="jp-mode-lead" role="status">{session.length ? 'Session complete.' : 'You’re caught up. Come back when cards are due.'}</p>
      <div class="jp-pills">
        {session.length > 0 && selectCards(cards, cardReviews(deck), Date.now()).length > 0 &&
          <button class="jp-btn jp-btn--primary" type="button" onClick={() => start(cards)}>Start another session</button>}
        <a class="jp-btn" href={back}>Back to topic</a>
      </div>
    </section>}
  </Panel>
}
