import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks'
import '../components/question/question.css'
import { AskPanel, AskSheet } from '../components/ask/AskSheet'
import { SolutionPlayer } from '../components/player/SolutionPlayer'
import { QuestionCard } from '../components/question/QuestionCard'
import { ReadAloudButton } from '../components/share/ReadAloudButton'
import { ReportButton } from '../components/share/ReportButton'
import { ShareButton } from '../components/share/ShareButton'
import {
  OPTION_LETTERS,
  buildSessionQueue,
  getNextRemovalId,
  makeOptionSeed,
  parseQuestionIdFromHash,
  summarizeSession,
} from '../components/question/logic'
import {
  type SessionRecord,
  setLastSessionSummary,
} from '../components/question/sessionState'
import { shuffleOptions } from '../lib/shuffle'
import { getProgress, logEvent, recordAnswer } from '../lib/store'
import type { OptionId } from '../lib/types'

interface SessionInit {
  queue: ReturnType<typeof buildSessionQueue>
  startedAt: number
}

function startSession(requestedId: string | null): SessionInit {
  const queue = buildSessionQueue(requestedId, 10)
  logEvent('session_start', {
    count: queue.length,
    questionIds: queue.map(({ question }) => question.id).join(','),
  })
  return { queue, startedAt: Date.now() }
}

export function Session() {
  const [{ queue, startedAt }, setSession] = useState<SessionInit>(
    () => startSession(parseQuestionIdFromHash(window.location.hash)),
  )
  const [index, setIndex] = useState(0)
  const [records, setRecords] = useState<SessionRecord[]>([])
  const [pickedId, setPickedId] = useState<OptionId | null>(null)
  const [removedIds, setRemovedIds] = useState<OptionId[]>([])
  const [hintOpen, setHintOpen] = useState(false)
  const [hintLoggedFor, setHintLoggedFor] = useState<string | null>(null)
  const [calcOpen, setCalcOpen] = useState(false)
  const [playSignal, setPlaySignal] = useState(0)
  const [askOpen, setAskOpen] = useState(false)
  const [desktopAskOpen, setDesktopAskOpen] = useState(true)
  const [isWide, setIsWide] = useState(() =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(min-width: 761px)').matches
      : false,
  )
  const [progress, setProgress] = useState(() => getProgress())
  const askTriggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    const mq = window.matchMedia('(min-width: 761px)')
    const update = () => {
      setIsWide(mq.matches)
      if (mq.matches) setAskOpen(false)
    }
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    const onHashChange = () => {
      const requestedId = parseQuestionIdFromHash(window.location.hash)
      if (!requestedId) return
      const current = queue[index]?.question
      if (current && current.id === requestedId) return

      setSession(startSession(requestedId))
      setIndex(0)
      setRecords([])
      setPickedId(null)
      setRemovedIds([])
      setHintOpen(false)
      setHintLoggedFor(null)
      setCalcOpen(false)
      setPlaySignal(0)
      setAskOpen(false)
    }

    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [queue, index])

  const entry = queue[index]
  const question = entry?.question

  const options = useMemo(() => {
    if (!question) return []
    return shuffleOptions(question, makeOptionSeed(question.id, startedAt))
  }, [question, startedAt])

  const answered = pickedId !== null

  const handlePick = useCallback(
    (optionId: OptionId) => {
      if (!question || pickedId !== null || removedIds.includes(optionId)) return
      const correct = optionId === question.answerId
      const removedCount = removedIds.length
      const at = Date.now()

      setPickedId(optionId)
      recordAnswer({
        questionId: question.id,
        pickedId: optionId,
        correct,
        removedCount,
        at,
      })
      logEvent('answer', {
        questionId: question.id,
        pickedId: optionId,
        correct,
        removedCount,
      })
      setProgress(getProgress())
    },
    [question, pickedId, removedIds],
  )

  const handleToggleHint = useCallback(() => {
    if (!question) return
    const nextOpen = !hintOpen
    setHintOpen(nextOpen)
    if (nextOpen && hintLoggedFor !== question.id) {
      logEvent('hint_open', { questionId: question.id })
      setHintLoggedFor(question.id)
    }
  }, [question, hintOpen, hintLoggedFor])

  const advance = useCallback(() => {
    if (!question) return
    const skipped = pickedId === null
    const nextRecord: SessionRecord = {
      questionId: question.id,
      topic: question.topic,
      correct: !skipped && pickedId === question.answerId,
      skipped,
      removedCount: removedIds.length,
    }
    const nextRecords = [...records, nextRecord]

    if (index + 1 >= queue.length) {
      const summary = summarizeSession(nextRecords)
      setLastSessionSummary(summary)
      logEvent('session_end', {
        answered: summary.answered,
        correct: summary.correct,
        total: summary.total,
      })
      window.location.hash = '#/done'
      return
    }

    setRecords(nextRecords)
    setIndex(index + 1)
    setPickedId(null)
    setRemovedIds([])
    setHintOpen(false)
    setHintLoggedFor(null)
    setCalcOpen(false)
    setPlaySignal(0)
    setAskOpen(false)
    if (typeof window.scrollTo === 'function') {
      window.scrollTo({ top: 0 })
    }
  }, [question, pickedId, removedIds.length, records, index, queue.length])

  useEffect(() => {
    if (!question) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      if (document.querySelector('dialog[open]')) return
      const target = event.target
      if (
        target instanceof HTMLElement &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return
      }

      const key = event.key.toLowerCase()
      if (!answered) {
        const idx =
          key === '1' || key === 'a'
            ? 0
            : key === '2' || key === 'b'
              ? 1
              : key === '3' || key === 'c'
                ? 2
                : key === '4' || key === 'd'
                  ? 3
                  : -1
        if (idx >= 0) {
          const option = options[idx]
          if (option && !removedIds.includes(option.id)) {
            event.preventDefault()
            handlePick(option.id)
          }
          return
        }
        if (key === 'h') {
          event.preventDefault()
          handleToggleHint()
        }
        return
      }

      const interactive =
        target instanceof HTMLElement &&
        Boolean(target.closest('button, a, summary, input, textarea'))
      if (interactive) return

      if (event.key === 'Enter') {
        event.preventDefault()
        advance()
      } else if ((event.code === 'Space' || event.key === ' ') && question.animationId) {
        event.preventDefault()
        setCalcOpen(true)
        setPlaySignal((prev) => prev + 1)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [question, answered, options, removedIds, handlePick, handleToggleHint, advance])

  if (!question) {
    return (
      <main class="jp-screen">
        <div class="jp-home">
          <h1 class="jp-app-title">No questions found</h1>
          <p class="jp-pitch">Please return home to start a new practice session.</p>
          <a class="jp-btn jp-btn--primary jp-btn--full" href="#/">
            Back home
          </a>
        </div>
      </main>
    )
  }

  const sessionAnswered =
    records.filter((record) => !record.skipped).length + (answered ? 1 : 0)
  const sessionCorrect =
    records.filter((record) => !record.skipped && record.correct).length +
    (answered && pickedId === question.answerId ? 1 : 0)
  const removalsLeft = Math.max(0, question.removeOrder.length - removedIds.length)
  const progressPercent = Math.round(((index + 1) / queue.length) * 100)
  const showRightCol = answered && (Boolean(question.animationId) || (isWide && desktopAskOpen))

  const handleRemoveOption = () => {
    if (pickedId !== null) return
    const nextId = getNextRemovalId(question, removedIds)
    if (!nextId) return
    const nextRemoved = [...removedIds, nextId]
    setRemovedIds(nextRemoved)
    logEvent('remove_option', {
      questionId: question.id,
      removedId: nextId,
      removedCount: nextRemoved.length,
    })
  }

  const handleAskButton = () => {
    if (!answered) {
      if (!hintOpen) handleToggleHint()
      setAskOpen(true)
      return
    }
    if (isWide) {
      setDesktopAskOpen(true)
    } else {
      setAskOpen(true)
    }
  }

  const handleCloseDesktopAsk = () => {
    setDesktopAskOpen(false)
    requestAnimationFrame(() => askTriggerRef.current?.focus())
  }

  const handleCloseSheet = () => {
    setAskOpen(false)
    requestAnimationFrame(() => askTriggerRef.current?.focus())
  }

  const letterFor = (optionId: OptionId): string => {
    const pos = options.findIndex((option) => option.id === optionId)
    return pos >= 0 ? OPTION_LETTERS[pos] : optionId.toUpperCase()
  }

  return (
    <main class="jp-screen jp-screen--session" data-answered={answered ? 'true' : 'false'}>
      <header class="jp-topbar">
        <div class="jp-topbar-inner">
          <div class="jp-brand-group">
            <span class="jp-logo" aria-hidden="true">JP</span>
            <span class="jp-topic jp-hide-sm">Chemistry · {question.topic}</span>
          </div>
          <div class="jp-progress-group">
            <span class="jp-counter">
              {index + 1} of {queue.length}
            </span>
            <div class="jp-progress-track" aria-hidden="true">
              <div class="jp-progress-fill" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
          <span class="jp-pill jp-pill--practice jp-hide-sm">Practice</span>
          <span class="jp-pill jp-pill--score" aria-live="polite">
            Score {sessionCorrect}/{sessionAnswered}
          </span>
          {progress.streakDays > 0 && (
            <span class="jp-pill jp-pill--streak">
              {progress.streakDays}-day streak
            </span>
          )}
        </div>
      </header>

      <div class="jp-session-layout">
        <div class="jp-left-col">
          <QuestionCard
            question={question}
            review={entry.review}
            options={options}
            pickedId={pickedId}
            removedIds={removedIds}
            hintOpen={hintOpen}
            onPick={handlePick}
            onToggleHint={handleToggleHint}
            onRemoveOption={handleRemoveOption}
            removalsLeft={removalsLeft}
            showRemoveButton={true}
          />
        </div>

        {showRightCol && (
          <div class="jp-right-col">
            {question.animationId && (
              <SolutionPlayer
                animationId={question.animationId}
                open={calcOpen}
                onToggleOpen={() => setCalcOpen((prev) => !prev)}
                playSignal={playSignal}
              />
            )}
            {isWide && desktopAskOpen && (
              <AskPanel
                questionId={question.id}
                answered={answered}
                letterFor={letterFor}
                onClose={handleCloseDesktopAsk}
              />
            )}
          </div>
        )}
      </div>

      <footer class="jp-footer-bar">
        <div class="jp-footer-inner">
          {!answered ? (
            <>
              <ReadAloudButton questionId={question.id} target="question" options={options} />
              <button
                ref={askTriggerRef}
                type="button"
                class="jp-ask-icon-btn"
                aria-label="Ask for a hint"
                onClick={handleAskButton}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />
                </svg>
              </button>
              <div class="jp-footer-right">
                <span class="jp-kbd-hints jp-hide-sm">1–4 to answer · H hint</span>
                <button type="button" class="jp-btn jp-skip-btn" onClick={advance}>
                  Skip
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                ref={askTriggerRef}
                type="button"
                class="jp-ask-icon-btn"
                aria-label="Ask about this question"
                aria-expanded={isWide ? desktopAskOpen : askOpen}
                onClick={handleAskButton}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />
                </svg>
              </button>
              <ShareButton questionId={question.id} correct={pickedId === question.answerId} />
              <ReportButton questionId={question.id} />
              <div class="jp-footer-right">
                <span class="jp-kbd-hints jp-hide-sm">
                  {question.animationId
                    ? '1–4 to answer · H hint · Space play'
                    : '1–4 to answer · H hint'}
                </span>
                <button
                  type="button"
                  class="jp-btn jp-btn--primary jp-next-btn"
                  onClick={advance}
                >
                  {index + 1 >= queue.length ? 'See summary' : 'Next question'}
                  <span class="jp-kbd jp-hide-sm" aria-hidden="true">Enter</span>
                </button>
              </div>
            </>
          )}
        </div>
      </footer>

      {askOpen && (!isWide || !answered) && (
        <AskSheet
          questionId={question.id}
          answered={answered}
          letterFor={letterFor}
          onClose={handleCloseSheet}
        />
      )}
    </main>
  )
}
