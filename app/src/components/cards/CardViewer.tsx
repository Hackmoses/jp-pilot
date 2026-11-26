import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'preact/hooks'
import {
  answerCardReview,
  blankWordInSentence,
  cardReviews,
  letterBank,
  rateCard,
  saveCardReview,
  seededOrder,
  selectCards,
  spellingMode,
  type Review,
} from '../../lib/leitner'
import { Panel } from '../../screens/Modes'
import './card-viewer.css'

const LETTERS = ['A', 'B', 'C', 'D'] as const

type QuestionData = {
  stem: string
  options: readonly [string, string, string, string]
  answer: (typeof LETTERS)[number]
  year: number
  number: number
}

type Card = {
  id: string
  front: string
  meaning: string
  example: string
  check?: boolean
  synonym?: string
  antonym?: string
  trap?: string
  rule?: { text: string; right: string; wrong: string }
  jamb?: { year: number; number: number }
  question?: QuestionData
  misspellings?: readonly [string, string, string]
  gap?: readonly [number, number]
}

function CardBackDetails({
  card,
  showExample = true,
  highlightGap = false,
}: {
  card: Card
  showExample?: boolean
  highlightGap?: boolean
}) {
  const [gs, ge] = card.gap ?? [0, 0]
  return (
    <>
      <span class="jp-word-meaning">{card.meaning}</span>
      {(card.synonym || card.antonym) && (
        <span class="jp-word-relations">
          {card.synonym && (
            <span class="jp-word-rel jp-word-rel--syn">
              <strong>Synonym</strong> {card.synonym}
            </span>
          )}
          {card.antonym && (
            <span class="jp-word-rel jp-word-rel--ant">
              <strong>Antonym</strong> {card.antonym}
            </span>
          )}
        </span>
      )}
      {highlightGap && card.gap ? (
        <span class="jp-word-spelling-answer">
          {card.front.slice(0, gs)}
          <mark class="jp-word-gap-hit">{card.front.slice(gs, ge)}</mark>
          {card.front.slice(ge)}
        </span>
      ) : null}
      {showExample && <span class="jp-word-example">{card.example}</span>}
      {card.rule && (
        <span class="jp-word-rule">
          <span class="jp-word-rule-text">{card.rule.text}</span>
          <span class="jp-word-compare">
            <span class="jp-word-right">
              <strong>✓ Right</strong> {card.rule.right}
            </span>
            <span class="jp-word-wrong">
              <strong>✕ Avoid</strong> {card.rule.wrong}
            </span>
          </span>
        </span>
      )}
      {card.trap && (
        <span class="jp-word-trap">
          <strong>Common mistake</strong> {card.trap}
        </span>
      )}
    </>
  )
}

function OptionButtons({
  options,
  pickedIndex,
  correctIndex,
  onPick,
}: {
  options: readonly string[]
  pickedIndex: number | null
  correctIndex: number
  onPick: (idx: number) => void
}) {
  const answered = pickedIndex !== null
  return (
    <div class="jp-options" role="group" aria-label="Answer options">
      {options.map((text, idx) => {
        let cls = 'jp-option'
        if (answered) {
          if (idx === correctIndex) cls += ' jp-option--correct'
          else if (idx === pickedIndex) cls += ' jp-option--wrong'
          else cls += ' jp-option--neutral'
        }
        return (
          <button
            key={LETTERS[idx]}
            type="button"
            class={cls}
            disabled={answered}
            aria-pressed={pickedIndex === idx}
            onClick={() => onPick(idx)}
          >
            <span class="jp-option-main">
              <span class="jp-badge">{LETTERS[idx]}</span>
              <span class="jp-option-text">{text}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}

export function CardViewer({ deck, title, back }: { deck: string; title: string; back: string }) {
  const [cards, setCards] = useState<Card[]>()
  const [session, setSession] = useState<Card[]>([])
  const [position, setPosition] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [pickedIndex, setPickedIndex] = useState<number | null>(null)
  const [gapInput, setGapInput] = useState('')
  const [gapSubmitted, setGapSubmitted] = useState<boolean | null>(null)
  const [initialReview, setInitialReview] = useState<Review | undefined>()
  const [sessionSeed, setSessionSeed] = useState('init')
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const touch = useRef<{ x: number; y: number }>()
  const button = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLElement>(null)
  const nextCard = useRef(false)
  const card = session[position]

  const hasQuestion = Boolean(card?.question && card.question.options.length === 4)
  const isSpelling = Boolean(card && !hasQuestion && card.misspellings?.length === 3 && card.gap?.length === 2)
  const modeForSpelling = isSpelling ? spellingMode(initialReview) : null

  const spellingChoices = useMemo(() => {
    if (!card || !isSpelling || modeForSpelling !== 'choice' || !card.misspellings) return null
    const list = seededOrder([card.front, ...card.misspellings], `${card.id}:${sessionSeed}`)
    const correctIndex = list.indexOf(card.front)
    return { list, correctIndex }
  }, [card, isSpelling, modeForSpelling, sessionSeed])

  const tiles = useMemo(() => {
    if (!card || !isSpelling || modeForSpelling !== 'gap' || !card.gap || !card.misspellings) return []
    const [gs, ge] = card.gap
    return letterBank(card.front.slice(gs, ge), card.misspellings, `${card.id}:${sessionSeed}:tiles`)
  }, [card, isSpelling, modeForSpelling, sessionSeed])

  const start = (available: Card[]) => {
    const reviews = cardReviews(deck)
    const nextSession = selectCards(available, reviews, Date.now())
    setSessionSeed(`${deck}:${Date.now()}:${attempt}`)
    setSession(nextSession)
    setPosition(0)
    setFlipped(false)
    setPickedIndex(null)
    setGapInput('')
    setGapSubmitted(null)
    setInitialReview(nextSession[0] ? reviews[nextSession[0].id] : undefined)
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
      .catch(() => {
        if (!controller.signal.aborted) setFailed(true)
      })
    return () => controller.abort()
  }, [deck, attempt])

  const advanceToNext = () => {
    const nextPos = position + 1
    const next = session[nextPos]
    nextCard.current = true
    setPosition(nextPos)
    setFlipped(false)
    setPickedIndex(null)
    setGapInput('')
    setGapSubmitted(null)
    setInitialReview(next ? cardReviews(deck)[next.id] : undefined)
  }

  const rateFlip = (knew: boolean) => {
    if (!card || !flipped || hasQuestion || isSpelling) return
    saveCardReview(deck, card.id, rateCard(cardReviews(deck)[card.id], knew, Date.now()))
    advanceToNext()
  }

  const answerQuestionOption = (idx: number) => {
    if (!card?.question || flipped) return
    const correct = LETTERS[idx] === card.question.answer
    saveCardReview(deck, card.id, answerCardReview(cardReviews(deck)[card.id], correct, Date.now()))
    setPickedIndex(idx)
    setFlipped(true)
  }

  const answerSpellingOption = (idx: number) => {
    if (!card || !spellingChoices || flipped) return
    const correct = idx === spellingChoices.correctIndex
    saveCardReview(deck, card.id, answerCardReview(cardReviews(deck)[card.id], correct, Date.now()))
    setPickedIndex(idx)
    setFlipped(true)
  }

  const submitSpellingGap = () => {
    if (!card || !card.gap || flipped) return
    const [gs, ge] = card.gap
    const expected = card.front.slice(gs, ge).toLowerCase()
    const trimmed = gapInput.trim().toLowerCase()
    if (!trimmed) return
    const correct = trimmed === expected
    saveCardReview(deck, card.id, answerCardReview(cardReviews(deck)[card.id], correct, Date.now()))
    setGapSubmitted(correct)
    setFlipped(true)
  }

  useLayoutEffect(() => {
    if (!nextCard.current) return
    nextCard.current = false
    if (button.current) button.current.focus({ preventScroll: true })
    else panelRef.current?.focus({ preventScroll: true })
  }, [position])

  useLayoutEffect(() => {
    if (!card) return
    const keyDown = (event: KeyboardEvent) => {
      if (event.repeat || event.altKey || event.ctrlKey || event.metaKey) return
      const target = event.target
      if (target instanceof HTMLElement && target.closest('input, textarea, select, [contenteditable]')) return

      if (hasQuestion || (isSpelling && modeForSpelling === 'choice')) {
        if (!flipped) {
          const k = event.key.toUpperCase()
          const idx = '1234'.includes(k) ? Number(k) - 1 : LETTERS.indexOf(k as (typeof LETTERS)[number])
          if (idx >= 0 && idx < 4) {
            event.preventDefault()
            if (hasQuestion) answerQuestionOption(idx)
            else answerSpellingOption(idx)
          }
        } else if (event.key === 'Enter' && !(target instanceof HTMLElement && target.closest('a'))) {
          event.preventDefault()
          advanceToNext()
        }
        return
      }

      if (isSpelling && modeForSpelling === 'gap') {
        if (flipped && event.key === 'Enter' && !(target instanceof HTMLElement && target.closest('a'))) {
          event.preventDefault()
          advanceToNext()
        }
        return
      }

      if (event.code === 'Space' && !(target instanceof HTMLElement && target.closest('button, a'))) {
        event.preventDefault()
        setFlipped(!flipped)
      }
      if (event.key === '1' || event.key === '2') rateFlip(event.key === '2')
    }
    window.addEventListener('keydown', keyDown)
    return () => window.removeEventListener('keydown', keyDown)
  }, [card, flipped, hasQuestion, isSpelling, modeForSpelling, pickedIndex, position, session])

  const hintText = hasQuestion
    ? flipped
      ? 'Press Enter or Next card'
      : 'Keys 1–4 or A–D to answer'
    : isSpelling
      ? flipped
        ? 'Press Enter or Next card'
        : modeForSpelling === 'gap'
          ? 'Type or tap the missing letters'
          : 'Pick the correct spelling (1–4 or A–D)'
      : flipped
        ? 'Rate how well you knew it'
        : 'Space or tap to flip'

  return (
    <Panel title={title} subtitle={hasQuestion ? 'Past question' : 'Word cards'} back={back} backLabel={title}>
      {failed ? (
        <div class="jp-mode-list">
          <p class="jp-mode-lead" role="status">Could not load this deck.</p>
          <button class="jp-btn" onClick={() => { setFailed(false); setAttempt(attempt + 1) }}>Try again</button>
        </div>
      ) : !cards ? (
        <p class="jp-mode-lead" role="status">Loading cards…</p>
      ) : card ? (
        <div class="jp-mode-list">
          <div class="jp-word-progress">
            <div class="jp-word-progress-row">
              <p class="jp-summary-sub jp-word-counter" role="status">
                Card {position + 1} of {session.length}
              </p>
              <span class="jp-word-hint">{hintText}</span>
            </div>
            <div class="jp-progress-track" aria-hidden="true">
              <div class="jp-progress-fill" style={{ width: (position * 100) / session.length + '%' }} />
            </div>
          </div>

          {hasQuestion && card.question ? (
            <>
              <section
                ref={panelRef}
                tabIndex={-1}
                class="jp-card jp-word-card jp-word-card--interactive"
                data-flipped={flipped ? 'true' : 'false'}
              >
                <div class="jp-word-card-head">
                  <span class="jp-try-kicker">{title}</span>
                  <span class="jp-word-jamb jp-jamb-badge">JAMB {card.question.year} · Q{card.question.number}</span>
                </div>
                <p class="jp-word-q-stem">{card.question.stem}</p>
                <OptionButtons
                  options={card.question.options}
                  pickedIndex={pickedIndex}
                  correctIndex={LETTERS.indexOf(card.question.answer)}
                  onPick={answerQuestionOption}
                />
                {flipped && (
                  <div class="jp-word-reveal">
                    <div class="jp-word-reveal-head">
                      <strong class="jp-word-back-term">{card.front}</strong>
                    </div>
                    <CardBackDetails card={card} />
                  </div>
                )}
              </section>
              {flipped && (
                <button type="button" class="jp-btn jp-btn--primary jp-btn--full" onClick={advanceToNext}>
                  <span>Next card</span>
                  <kbd class="jp-word-kbd jp-word-kbd--primary">Enter</kbd>
                </button>
              )}
            </>
          ) : isSpelling && card.gap ? (
            <>
              <section
                ref={panelRef}
                tabIndex={-1}
                class="jp-card jp-word-card jp-word-card--interactive"
                data-flipped={flipped ? 'true' : 'false'}
              >
                <div class="jp-word-card-head">
                  <span class="jp-try-kicker">{title}</span>
                  {card.jamb && <span class="jp-word-jamb jp-jamb-badge">JAMB {card.jamb.year} · Q{card.jamb.number}</span>}
                </div>
                {!flipped ? (
                  <>
                    <span class="jp-word-meaning">{card.meaning}</span>
                    <span class="jp-word-example">{blankWordInSentence(card.example, card.front)}</span>
                    {modeForSpelling === 'choice' && spellingChoices ? (
                      <OptionButtons
                        options={spellingChoices.list}
                        pickedIndex={pickedIndex}
                        correctIndex={spellingChoices.correctIndex}
                        onPick={answerSpellingOption}
                      />
                    ) : (
                      <div class="jp-word-gap-box">
                        <p class="jp-word-gap-display" aria-label={`Word with ${card.gap[1] - card.gap[0]} missing letters`}>
                          <span>{card.front.slice(0, card.gap[0])}</span>
                          <span class="jp-word-gap-slots">
                            {Array.from({ length: card.gap[1] - card.gap[0] }, (_, idx) => (
                              <span key={idx} class="jp-word-gap-slot" data-filled={gapInput[idx] ? 'true' : 'false'}>
                                {gapInput[idx] ?? '_'}
                              </span>
                            ))}
                          </span>
                          <span>{card.front.slice(card.gap[1])}</span>
                        </p>
                        <form
                          class="jp-word-gap-form"
                          onSubmit={(event) => {
                            event.preventDefault()
                            submitSpellingGap()
                          }}
                        >
                          <input
                            type="text"
                            class="jp-word-gap-input"
                            aria-label="Type the missing letters"
                            placeholder={`${card.gap[1] - card.gap[0]} letters`}
                            maxLength={card.gap[1] - card.gap[0]}
                            autoComplete="off"
                            autoCapitalize="off"
                            spellcheck={false}
                            value={gapInput}
                            onInput={(event) => {
                              const len = card.gap![1] - card.gap![0]
                              setGapInput(event.currentTarget.value.replace(/[^a-zA-Z]/g, '').slice(0, len))
                            }}
                          />
                          <button type="submit" class="jp-btn jp-btn--primary" disabled={!gapInput.trim()}>
                            Check
                          </button>
                        </form>
                        <div class="jp-word-tiles" role="group" aria-label="Tap missing letters">
                          {tiles.map((letter, idx) => (
                            <button
                              key={`${idx}-${letter}`}
                              type="button"
                              class="jp-btn jp-word-tile"
                              disabled={gapInput.length >= card.gap![1] - card.gap![0]}
                              onClick={() => {
                                const len = card.gap![1] - card.gap![0]
                                setGapInput((prev) => (prev.length < len ? prev + letter : prev))
                              }}
                            >
                              {letter}
                            </button>
                          ))}
                          <button
                            type="button"
                            class="jp-btn jp-word-tile"
                            aria-label="Delete last letter"
                            disabled={!gapInput.length}
                            onClick={() => setGapInput((prev) => prev.slice(0, -1))}
                          >
                            ⌫
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div class="jp-word-card-face jp-word-card-back" key={card.id + 'sp-back'}>
                    {modeForSpelling === 'choice' && spellingChoices ? (
                      <OptionButtons
                        options={spellingChoices.list}
                        pickedIndex={pickedIndex}
                        correctIndex={spellingChoices.correctIndex}
                        onPick={() => {}}
                      />
                    ) : (
                      <p
                        class={
                          'jp-try-outcome ' +
                          (gapSubmitted ? 'jp-try-outcome--good' : 'jp-word-wrong')
                        }
                        role="status"
                      >
                        {gapSubmitted
                          ? '✓ Correct spelling.'
                          : `✕ You typed “${gapInput}”. Compare carefully below.`}
                      </p>
                    )}
                    <CardBackDetails card={card} highlightGap />
                  </div>
                )}
              </section>
              {flipped && (
                <button type="button" class="jp-btn jp-btn--primary jp-btn--full" onClick={advanceToNext}>
                  <span>Next card</span>
                  <kbd class="jp-word-kbd jp-word-kbd--primary">Enter</kbd>
                </button>
              )}
            </>
          ) : (
            <>
              <button
                ref={button}
                type="button"
                class="jp-card jp-word-card"
                data-flipped={flipped ? 'true' : 'false'}
                aria-expanded={flipped}
                onClick={() => setFlipped(!flipped)}
                onTouchStart={(event) => {
                  const finger = event.touches[0]
                  touch.current = event.touches.length === 1 ? { x: finger.clientX, y: finger.clientY } : undefined
                }}
                onTouchCancel={() => {
                  touch.current = undefined
                }}
                onTouchEnd={(event) => {
                  const startPos = touch.current
                  touch.current = undefined
                  if (!startPos) return
                  const finger = event.changedTouches[0]
                  const dx = finger.clientX - startPos.x
                  const dy = finger.clientY - startPos.y
                  if (Math.abs(dx) >= 50 && Math.abs(dx) > Math.abs(dy)) {
                    if (event.cancelable) event.preventDefault()
                    rateFlip(dx > 0)
                  } else if (event.cancelable && Math.abs(dx) <= 10 && Math.abs(dy) <= 10) {
                    event.preventDefault()
                    setFlipped(!flipped)
                  }
                }}
              >
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
                      {card.jamb && <span class="jp-word-jamb jp-jamb-badge">JAMB {card.jamb.year} · Q{card.jamb.number}</span>}
                    </span>
                    <CardBackDetails card={card} />
                  </span>
                )}
              </button>
              {flipped && (
                <div class="jp-word-actions">
                  <button class="jp-btn jp-word-btn-again" type="button" onClick={() => rateFlip(false)}>
                    <span>Again</span>
                    <kbd class="jp-word-kbd">1</kbd>
                  </button>
                  <button class="jp-btn jp-btn--primary jp-word-btn-knew" type="button" onClick={() => rateFlip(true)}>
                    <span>I knew it</span>
                    <kbd class="jp-word-kbd jp-word-kbd--primary">2</kbd>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <section class="jp-card jp-word-done">
          <h2 class="jp-mode-card-title">{session.length ? 'Session complete' : 'All caught up'}</h2>
          <p class="jp-mode-lead" role="status">
            {session.length ? 'Session complete.' : 'You’re caught up. Come back when cards are due.'}
          </p>
          <div class="jp-pills">
            {session.length > 0 && selectCards(cards, cardReviews(deck), Date.now()).length > 0 && (
              <button class="jp-btn jp-btn--primary" type="button" onClick={() => start(cards)}>
                Start another session
              </button>
            )}
            <a class="jp-btn" href={back}>Back to topic</a>
          </div>
        </section>
      )}
    </Panel>
  )
}
