import { useEffect, useMemo, useState } from 'preact/hooks'
import '../components/question/question.css'
import { AskSheet } from '../components/ask/AskSheet'
import { QuestionCard } from '../components/question/QuestionCard'
import { ReadAloudButton } from '../components/share/ReadAloudButton'
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
  const [askOpen, setAskOpen] = useState(false)
  const [progress, setProgress] = useState(() => getProgress())

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

  const answered = pickedId !== null
  const sessionAnswered =
    records.filter((record) => !record.skipped).length + (answered ? 1 : 0)
  const sessionCorrect =
    records.filter((record) => !record.skipped && record.correct).length +
    (answered && pickedId === question.answerId ? 1 : 0)
  const removalsLeft = Math.max(0, question.removeOrder.length - removedIds.length)
  const progressPercent = Math.round(((index + 1) / queue.length) * 100)

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

  const handlePick = (optionId: OptionId) => {
    if (pickedId !== null || removedIds.includes(optionId)) return
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
  }

  const handleToggleHint = () => {
    const nextOpen = !hintOpen
    setHintOpen(nextOpen)
    if (nextOpen && hintLoggedFor !== question.id) {
      logEvent('hint_open', { questionId: question.id })
      setHintLoggedFor(question.id)
    }
  }

  const handleAskForHint = () => {
    if (!hintOpen) {
      setHintOpen(true)
      if (hintLoggedFor !== question.id) {
        logEvent('hint_open', { questionId: question.id })
        setHintLoggedFor(question.id)
      }
    }
  }

  const letterFor = (optionId: OptionId): string => {
    const pos = options.findIndex((option) => option.id === optionId)
    return pos >= 0 ? OPTION_LETTERS[pos] : optionId.toUpperCase()
  }

  const advance = () => {
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
    setAskOpen(false)
    if (typeof window.scrollTo === 'function') {
      window.scrollTo({ top: 0 })
    }
  }

  return (
    <main class="jp-screen jp-screen--session" data-answered={answered ? 'true' : 'false'}>
      <header class="jp-topbar">
        <div class="jp-topbar-inner">
          <div class="jp-topbar-row">
            <div class="jp-meta">
              <span class="jp-topic">Chemistry · {question.topic}</span>
              <span class="jp-counter">
                Question {index + 1} of {queue.length}
              </span>
            </div>
            <div class="jp-pills">
              <span class="jp-pill jp-pill--practice">Practice</span>
              <span class="jp-pill jp-pill--score" aria-live="polite">
                Score {sessionCorrect}/{sessionAnswered}
              </span>
              {progress.streakDays > 0 && (
                <span class="jp-pill jp-pill--streak">
                  {progress.streakDays}-day streak
                </span>
              )}
            </div>
          </div>
          <div class="jp-progress-track" aria-hidden="true">
            <div class="jp-progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      </header>

      <div class="jp-session-layout">
        <div class="jp-session-primary">
          <div class="jp-body">
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

          <footer class="jp-footer">
            {!answered ? (
              <>
                <ReadAloudButton questionId={question.id} target="question" options={options} />
                <button
                  type="button"
                  class="jp-btn jp-btn--ask"
                  data-slot="ask-hint-trigger"
                  onClick={() => {
                    handleAskForHint()
                    setAskOpen(true)
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />
                  </svg>
                  Ask for a hint
                </button>
                <button type="button" class="jp-btn" onClick={advance}>
                  Skip
                </button>
              </>
            ) : (
              <>
                <div class="jp-footer-group">
                  <button
                    type="button"
                    class="jp-btn jp-btn--ask"
                    data-slot="ask-trigger"
                    onClick={() => setAskOpen(true)}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />
                    </svg>
                    Ask
                  </button>
                  <ShareButton questionId={question.id} correct={pickedId === question.answerId} />
                </div>
                <button
                  type="button"
                  class="jp-btn jp-btn--primary jp-footer-grow"
                  onClick={advance}
                >
                  {index + 1 >= queue.length ? 'See summary' : 'Next question'}
                </button>
              </>
            )}
          </footer>
        </div>
      </div>
      {askOpen && (
        <AskSheet
          questionId={question.id}
          answered={answered}
          letterFor={letterFor}
          onClose={() => setAskOpen(false)}
        />
      )}
    </main>
  )
}
