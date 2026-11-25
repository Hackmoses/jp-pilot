import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'preact/hooks'
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
  makeOptionSeed,
  parseQuestionIdFromHash,
  parseSubjectFromHash,
  shortcutKey,
  summarizeSession,
} from '../components/question/logic'
import {
  setLastSessionSummary,
} from '../components/question/sessionState'
import { getAnimation, getQuestion, isSubjectLoaded, loadSubject } from '../lib/data'
import { finishAttempt, getAttemptQuestions, getStudyAnswer, markStudied, remember, saveAttempt, studyLink, type Attempt, type TestResult } from '../lib/modes'
import { shuffleOptions } from '../lib/shuffle'
import { getProgress, logEvent, recordAnswer } from '../lib/store'
import { getSubject, getSubjectByQuestionId, isSubjectAvailable } from '../lib/subjects'
import type { OptionId } from '../lib/types'
import { Countdown } from './Countdown'

interface SessionProps {
  attempt?: Attempt
  study?: { id: string; subject: string; chapter: string; concept?: string }
  review?: { id: string; result: TestResult; href: string }
}

interface SessionInit {
  queue: ReturnType<typeof buildSessionQueue>
  requestedSubject: string | null
  startedAt: number
  loading: boolean
}

function resolveTargetSubject(requestedId: string | null, requestedSubject: string | null): string {
  if (requestedId) {
    return getSubjectByQuestionId(requestedId)?.id ?? requestedSubject ?? 'chemistry'
  }
  return requestedSubject ?? 'chemistry'
}

function startSession(requestedId: string | null, requestedSubject: string | null): SessionInit {
  const targetSubject = resolveTargetSubject(requestedId, requestedSubject)
  if (!isSubjectLoaded(targetSubject)) {
    return { queue: [], requestedSubject, startedAt: Date.now(), loading: true }
  }
  const queue = buildSessionQueue(requestedId, 10, requestedSubject)
  if (queue.length > 0) {
    logEvent('session_start', {
      count: queue.length,
      questionIds: queue.map(({ question }) => question.id).join(','),
    })
  }
  return { queue, requestedSubject, startedAt: Date.now(), loading: false }
}

export function Session({ attempt, study, review }: SessionProps) {
  const [{ queue, requestedSubject, startedAt, loading }, setSession] = useState<SessionInit>(
    () => {
      const id = study?.id ?? review?.id
      if (attempt || id) {
        const questions = attempt ? getAttemptQuestions(attempt)
          : review ? getAttemptQuestions(review.result).filter((question) => question.id === review.id)
            : id ? [getQuestion(id)] : []
        return {
          queue: questions.flatMap((question) => question
            ? [{ question, review: attempt?.reviewIds.includes(question.id) ?? false }] : []),
          requestedSubject: attempt?.subjects[0] ?? study?.subject ?? null,
          startedAt: attempt?.startedAt ?? review?.result.startedAt ?? Date.now(),
          loading: false,
        }
      }
      return startSession(
        parseQuestionIdFromHash(window.location.hash),
        parseSubjectFromHash(window.location.hash),
      )
    },
  )
  const savedAttempt = useRef(attempt)
  const [index, setIndex] = useState(attempt?.index ?? 0)
  const [picks, setPicks] = useState<Attempt['answers']>(() =>
    attempt?.answers ?? review?.result.answers ?? (study ? { [study.id]: getStudyAnswer(study.id) } : {}))
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
    if (!loading) return
    let cancelled = false
    const requestedId = parseQuestionIdFromHash(window.location.hash)
    const nextSubject = parseSubjectFromHash(window.location.hash)
    const targetSubject = resolveTargetSubject(requestedId, nextSubject)

    void loadSubject(targetSubject).then(() => {
      if (cancelled) return
      const nextQueue = buildSessionQueue(requestedId, 10, nextSubject)
      if (nextQueue.length > 0) {
        logEvent('session_start', {
          count: nextQueue.length,
          questionIds: nextQueue.map(({ question }) => question.id).join(','),
        })
      }
      setSession({
        queue: nextQueue,
        requestedSubject: nextSubject,
        startedAt: Date.now(),
        loading: false,
      })
    })

    return () => {
      cancelled = true
    }
  }, [loading])

  const entry = queue[index]
  const question = entry?.question
  const pickedId = question ? picks[question.id] ?? null : null

  const options = useMemo(() => {
    if (!question) return []
    return shuffleOptions(question, makeOptionSeed(question.id, startedAt))
  }, [question, startedAt])

  const answered = pickedId !== null || Boolean(review)
  const back = study ? studyLink(study.subject, study.chapter, study.concept) : review?.href

  useEffect(() => {
    if (question && !attempt && !review) {
      remember(study ? window.location.hash : '#/q?id=' + encodeURIComponent(question.id),
        study ? 'Study · ' + (question.concept ?? question.topic) : 'Practice · ' + question.topic)
    }
  }, [question, attempt, review, study])

  const handlePick = useCallback(
    (optionId: OptionId) => {
      if (!question || pickedId !== null || review) return
      const correct = optionId === question.answerId
      const at = Date.now()
      const run = savedAttempt.current
      if (run?.deadline && at >= run.deadline) {
        finishAttempt(run, at)
        return
      }
      const nextPicks = { ...picks, [question.id]: optionId }
      if (run) {
        run.answers = nextPicks
        saveAttempt(run)
      }
      if (study) markStudied(study.subject, study.chapter, question.id, optionId)

      setPicks(nextPicks)
      recordAnswer({
        questionId: question.id,
        pickedId: optionId,
        correct,
        at,
      })
      logEvent('answer', {
        questionId: question.id,
        pickedId: optionId,
        correct,
      })
      setProgress(getProgress())
    },
    [question, pickedId, picks, review, study],
  )

  const move = useCallback((next: number) => {
    const run = savedAttempt.current
    if (run) {
      run.index = next
      saveAttempt(run)
    }
    setIndex(next)
    setCalcOpen(false)
    setPlaySignal(0)
    setAskOpen(false)
    window.scrollTo({ top: 0 })
  }, [])

  const advance = useCallback(() => {
    if (!question) return
    if (back) {
      window.location.hash = back
      return
    }
    const run = savedAttempt.current
    const now = Date.now()
    if (run && (index + 1 >= queue.length || (run.deadline !== null && now >= run.deadline))) {
      finishAttempt(run, now)
      return
    }
    if (index + 1 >= queue.length) {
      const summary = summarizeSession(queue.map(({ question }) => ({
        questionId: question.id,
        topic: question.topic,
        correct: picks[question.id] === question.answerId,
        skipped: !picks[question.id],
      })))
      summary.subject = question.subject
      summary.elapsedMs = now - startedAt
      summary.missedQuestions = queue.flatMap(({ question }) =>
        picks[question.id] && picks[question.id] !== question.answerId ? [question] : [])
      summary.missedQuestionIds = summary.missedQuestions.map(({ id }) => id)
      summary.animations = summary.missedQuestions.flatMap(({ animationId }) =>
        animationId ? getAnimation(animationId) ?? [] : [])
      setLastSessionSummary(summary)
      remember('#/done', 'Practice summary')
      logEvent('session_end', {
        answered: summary.answered,
        correct: summary.correct,
        total: summary.total,
      })
      window.location.hash = '#/done'
      return
    }

    move(index + 1)
  }, [question, picks, index, queue, back, startedAt, move])

  useLayoutEffect(() => {
    if (!question) return

    const onKeyDown = (event: KeyboardEvent) => {
      const key = shortcutKey(event)
      if (!key) return
      if (!back && (key === 'n' || (key === 'p' && index > 0))) {
        event.preventDefault()
        if (key === 'n') advance()
        else move(index - 1)
        return
      }
      const target = event.target
      if (!answered) {
        const idx = key.length === 1 ? Math.max('abcd'.indexOf(key), '1234'.indexOf(key)) : -1
        const option = options[idx]
        if (option) {
          event.preventDefault()
          handlePick(option.id)
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
  }, [question, answered, options, handlePick, advance, back, index, move])

  if (loading) {
    return (
      <main class="jp-screen">
        <div class="jp-home">
          <h1 class="jp-app-title">Loading questions…</h1>
          <p class="jp-pitch">Getting your practice session ready.</p>
        </div>
      </main>
    )
  }

  if (!question) {
    const blockedSubject = requestedSubject ? getSubject(requestedSubject) : undefined
    const isComingSoon = Boolean(blockedSubject && !isSubjectAvailable(blockedSubject.id))
    return (
      <main class="jp-screen">
        <div class="jp-home">
          <h1 class="jp-app-title">
            {isComingSoon ? `${blockedSubject!.name} is coming soon` : 'No questions found'}
          </h1>
          <p class="jp-pitch">
            {isComingSoon
              ? 'This subject is coming soon. Chemistry is ready now.'
              : 'Pick an open subject to start a 10-question practice session.'}
          </p>
          <a class="jp-btn jp-btn--primary jp-btn--full" href="#/q?subject=chemistry">
            Start Chemistry
          </a>
          <a class="jp-link-btn" href="#/subjects">
            Choose a subject
          </a>
        </div>
      </main>
    )
  }

  const subjectName = getSubject(question.subject)?.name ?? 'Chemistry'
  const sessionAnswered = Object.keys(picks).length
  const sessionCorrect = queue.filter(({ question }) => picks[question.id] === question.answerId).length
  const progressPercent = Math.round(((index + 1) / queue.length) * 100)
  const animationKind = question.animationId ? getAnimation(question.animationId)?.kind : undefined
  const isConceptAnimation = animationKind === 'concept'
  const showRightCol = answered && isWide && (Boolean(question.animationId) || desktopAskOpen)
  const calculationPlayer = question.animationId ? (
    <SolutionPlayer
      animationId={question.animationId}
      open={calcOpen}
      onToggleOpen={() => setCalcOpen((prev) => !prev)}
      playSignal={playSignal}
      isCorrect={answered ? pickedId === question.answerId : undefined}
    />
  ) : null

  const handleAskButton = () => {
    if (!answered) {
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
            <a class="jp-logo" href="#/" aria-label="JP home">JP</a>
            <span class="jp-topic jp-hide-sm">{subjectName} · {question.topic}</span>
          </div>
          <div class="jp-progress-group">
            <span class="jp-counter">
              {index + 1} of {queue.length}
            </span>
            <div class="jp-progress-track" aria-hidden="true">
              <div class="jp-progress-fill" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
          <span class="jp-pill jp-pill--practice jp-hide-sm">{study ? 'Study' : review ? 'Exam review' : 'Practice'}</span>
          {attempt?.deadline && <Countdown deadline={attempt.deadline}
            onExpire={() => finishAttempt(savedAttempt.current!, Date.now())} />}
          {!study && !review && <span class="jp-pill jp-pill--score" aria-live="polite">
            Score {sessionCorrect}/{sessionAnswered}
          </span>}
          {!attempt?.deadline && !study && !review && progress.streakDays > 0 && (
            <span class="jp-pill jp-pill--streak">
              {progress.streakDays}-day streak
            </span>
          )}
        </div>
      </header>

      <div class="jp-session-layout">
        <div class="jp-left-col">
          {review && pickedId === null && <p class="jp-summary-sub">Unanswered</p>}
          <QuestionCard
            question={question}
            review={entry.review}
            options={options}
            pickedId={pickedId}
            reveal={Boolean(review)}
            onPick={handlePick}
            calculationSlot={!isWide && !isConceptAnimation ? calculationPlayer : undefined}
            conceptSlot={!isWide && isConceptAnimation ? calculationPlayer : undefined}
          />
        </div>

        {showRightCol && (
          <div class="jp-right-col">
            {isWide && calculationPlayer}
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
              <div class="jp-footer-right">
                {!back && <span class="jp-kbd-hints jp-hide-sm">Shortcuts · A–D choose · N next · P previous</span>}
                <button type="button" class="jp-btn jp-skip-btn" onClick={advance}>
                  {study ? 'Back to chapter' : 'Skip'}
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
                  {!back ? 'Shortcuts · A–D choose · N next · P previous' : question.animationId
                    ? 'Enter next · Space play'
                    : 'Enter next'}
                </span>
                <button
                  type="button"
                  class="jp-btn jp-btn--primary jp-next-btn"
                  onClick={advance}
                >
                  {study ? 'Back to chapter' : review ? 'Back to results' : index + 1 >= queue.length ? 'See summary' : 'Next question'}
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
