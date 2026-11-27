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
import { englishLearnLink } from '../lib/englishLearn'
import { STUDY_TOPICS } from '../lib/sections'
import { arriveAtReturnPoint, finishAttempt, getAttemptQuestions, setReturnPoint, getQuestionChapter, getStudyAnswer, markStudied, remember, saveAttempt, studyLink, type Attempt, type TestResult } from '../lib/modes'
import { shuffleOptions } from '../lib/shuffle'
import { getProgress, logEvent, recordAnswer } from '../lib/store'
import { getSubject, getSubjectByQuestionId, isSubjectAvailable } from '../lib/subjects'
import type { OptionId } from '../lib/types'
import { Countdown } from './Countdown'
import { calculator as calculatorModule } from './examModules'
import { mayAnswer, recordVisitorAnswer } from '../lib/access'
import { lessonFor } from '../lib/conceptLessons'
import { useLessonIndex } from '../lib/lessonIndex'
import { ACCOUNTS_ENABLED, FREE_QUESTIONS } from '../lib/config'
import { lazyView } from '../lib/lazyView'

const teachMe = lazyView(() => import('../components/lessons/biology/TeachMe').then(({ TeachMe }) => TeachMe))

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
  useState(() => arriveAtReturnPoint(attempt, window.location.hash))
  const savedAttempt = useRef(attempt)
  const [index, setIndex] = useState(attempt?.index ?? 0)
  const [picks, setPicks] = useState<Attempt['answers']>(() =>
    attempt?.answers ?? review?.result.answers ?? (study ? { [study.id]: getStudyAnswer(study.id) } : {}))
  const [calcOpen, setCalcOpen] = useState(false)
  const [full, setFull] = useState(false)
  const [pausedAt, setPausedAt] = useState<number | null>(null)
  const [deadline, setDeadline] = useState(attempt?.deadline ?? null)
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
  // Biology teaches through illustrated Teach me clips instead of the handwritten player.
  const solutionId = question?.subject === 'biology' ? undefined : question?.animationId
  const lessonIndex = useLessonIndex()
  const calculatorDialog = useRef<HTMLDialogElement>(null)
  const [calculatorUsed, setCalculatorUsed] = useState(false)
  const { View: CalculatorView, failed: calculatorFailed } = calculatorModule.useView(calculatorUsed)
  const showCalculator = question?.type === 'calculation' && !review
  const showTeachMe = question?.subject === 'biology' && answered && !study && (Boolean(review) || attempt?.mode !== 'exam')
  const { View: TeachMe } = teachMe.useView(showTeachMe)
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
      if (ACCOUNTS_ENABLED && !review) recordVisitorAnswer(question.id)
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
    setFull(false)
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
      } else if ((event.code === 'Space' || event.key === ' ') && solutionId) {
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
  // Study keeps the full lesson. Practice and exam review show a short verdict first.
  const compact = !study
  const detailed = !compact || full
  const chapterId = getQuestionChapter(question)
  const englishLearn = compact && question.subject === 'english' ? englishLearnLink(chapterId) : undefined
  const conceptLesson = lessonIndex && question ? lessonFor(question, chapterId, lessonIndex) : undefined
  const learnHref = englishLearn?.href
    ?? (conceptLesson ? '#/lesson?id=' + encodeURIComponent(conceptLesson.id) : undefined)
    ?? (compact && STUDY_TOPICS[question.subject]?.includes(chapterId) ? studyLink(question.subject, chapterId) : undefined)
  const exitHref = back ?? (attempt ? (attempt.mode === 'exam' ? '#/exam'
    : '#/practice?subject=' + encodeURIComponent(question.subject)) : '#/')
  const canPause = attempt?.mode === 'practice' && deadline !== null
  const pause = () => setPausedAt(Date.now())
  const resume = () => {
    const run = savedAttempt.current
    if (run && run.deadline !== null && pausedAt !== null) {
      run.deadline += Date.now() - pausedAt
      saveAttempt(run)
      setDeadline(run.deadline)
    }
    setPausedAt(null)
  }
  const sessionAnswered = Object.keys(picks).length
  const sessionCorrect = queue.filter(({ question }) => picks[question.id] === question.answerId).length
  const progressPercent = Math.round(((index + 1) / queue.length) * 100)
  const animationKind = solutionId ? getAnimation(solutionId)?.kind : undefined
  const isConceptAnimation = animationKind === 'concept'
  const showRightCol = answered && detailed && isWide && (Boolean(solutionId) || desktopAskOpen)
  const letterFor = (optionId: OptionId): string => {
    const pos = options.findIndex((option) => option.id === optionId)
    return pos >= 0 ? OPTION_LETTERS[pos] : optionId.toUpperCase()
  }

  const calculationPlayer = solutionId ? (
    <SolutionPlayer
      animationId={solutionId}
      open={calcOpen}
      onToggleOpen={() => setCalcOpen((prev) => !prev)}
      playSignal={playSignal}
      isCorrect={answered ? pickedId === question.answerId : undefined}
      answerLetter={letterFor(question.answerId)}
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

  return (
    <main class="jp-screen jp-screen--session" data-answered={answered ? 'true' : 'false'}>
      <header class="jp-topbar">
        <div class="jp-topbar-inner">
          <div class="jp-brand-group">
            <a class="jp-session-back" href={exitHref}
              aria-label={attempt?.mode === 'exam' ? 'Leave exam. The timer keeps running' : 'Back. Your place is saved'}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </a>
            <a class="jp-logo" href="#/" aria-label="JP home">JP</a>
          </div>
          {!study && !review && <span class="jp-pill jp-pill--score" aria-live="polite">
            Score {sessionCorrect}/{sessionAnswered}
          </span>}
          <div class="jp-topbar-actions">
            {showCalculator && <button type="button" class="jp-btn jp-calc-open" aria-haspopup="dialog" onClick={() => {
              setCalculatorUsed(true)
              calculatorDialog.current?.showModal()
            }}>Calc</button>}
            {deadline !== null && pausedAt === null && <Countdown deadline={deadline}
              onExpire={() => finishAttempt(savedAttempt.current!, Date.now())} />}
            {canPause && pausedAt === null && <button type="button" class="jp-btn" onClick={pause}>Pause</button>}
            <a class="jp-btn jp-menu-btn" href="#/" aria-label="Home">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z" /></svg>
              <span>Menu</span>
            </a>
          </div>
        </div>
      </header>
      <div class="jp-session-bar">
        <div class="jp-session-bar-inner">
          <span class="jp-session-topic">{subjectName} · {question.topic}</span>
          <div class="jp-session-meta">
            <span class="jp-pill jp-pill--practice jp-hide-sm">{study ? 'Study' : review ? 'Exam review' : 'Practice'}</span>
            <div class="jp-progress-group">
              <span class="jp-counter">
                {index + 1} of {queue.length}
              </span>
              <div class="jp-progress-track" aria-hidden="true">
                <div class="jp-progress-fill" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>
            {!attempt?.deadline && !study && !review && progress.streakDays > 0 && (
              <span class="jp-pill jp-pill--streak">
                {progress.streakDays}-day streak
              </span>
            )}
          </div>
        </div>
      </div>

      <div class="jp-session-layout">
        <div class="jp-left-col">
          {review && pickedId === null && <p class="jp-summary-sub">Unanswered</p>}
          {!answered && !review && !mayAnswer(question.id) ? <section class="jp-card jp-gate" aria-labelledby="jp-gate-title">
            <h2 id="jp-gate-title" class="jp-mode-card-title">You have used your {FREE_QUESTIONS} free questions</h2>
            <p class="jp-mode-lead">Create a free account with your email to keep practising. Your progress stays on this phone.</p>
            <a class="jp-btn jp-btn--primary jp-btn--full" href="#/signup">Start free with your email →</a>
            <a class="jp-link-btn" href="#/">Back to home</a>
          </section> : <QuestionCard
            question={question}
            review={entry.review}
            options={options}
            pickedId={pickedId}
            reveal={Boolean(review)}
            onPick={handlePick}
            compact={compact}
            full={full}
            onFull={() => setFull((prev) => !prev)}
            learnHref={learnHref}
            learnLabel={englishLearn?.label ?? (conceptLesson ? `Watch: ${conceptLesson.title} in ${conceptLesson.minutes} minutes →` : undefined)}
            onLearn={() => setReturnPoint({
              href: window.location.hash,
              label: review ? 'Back to exam review' : attempt ? 'Back to practice · Question ' + (index + 1) + ' of ' + queue.length : 'Back to the question',
              pausedAt: attempt?.mode === 'practice' && savedAttempt.current?.deadline != null ? Date.now() : null,
            })}
            calculationSlot={!isWide && !isConceptAnimation ? calculationPlayer : undefined}
            conceptSlot={!isWide && isConceptAnimation ? calculationPlayer : undefined}
          />}
          {showTeachMe && TeachMe && <TeachMe key={question.id} id={question.id} correct={pickedId === question.answerId} />}
        </div>

        {showRightCol && (
          <div class="jp-right-col">
            {isWide && calculationPlayer}
            {isWide && desktopAskOpen && (
              <AskPanel
                questionId={question.id}
                options={options}
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
                {attempt && index > 0 && <button type="button" class="jp-btn" onClick={() => move(index - 1)}>Previous</button>}
                <button type="button" class="jp-btn jp-skip-btn" onClick={advance}>
                  {study ? 'Back to chapter' : 'Skip'}
                </button>
              </div>
            </>
          ) : (
            <>
              {detailed && <button
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
              </button>}
              <ShareButton questionId={question.id} correct={pickedId === question.answerId} />
              <ReportButton questionId={question.id} />
              <div class="jp-footer-right">
                <span class="jp-kbd-hints jp-hide-sm">
                  {!back ? 'Shortcuts · A–D choose · N next · P previous' : solutionId
                    ? 'Enter next · Space play'
                    : 'Enter next'}
                </span>
                {attempt && index > 0 && <button type="button" class="jp-btn" onClick={() => move(index - 1)}>Previous</button>}
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

      {pausedAt !== null && <div class="jp-pause" role="dialog" aria-modal="true" aria-label="Paused">
        <section class="jp-card">
          <h2 class="jp-mode-card-title">Paused</h2>
          <p class="jp-mode-lead">The timer has stopped. Your answers are saved.</p>
          <button type="button" class="jp-btn jp-btn--primary jp-btn--full" onClick={resume}>Resume</button>
          <a class="jp-link-btn" href={exitHref}>Leave practice</a>
        </section>
      </div>}

      <dialog class="jp-dialog jp-calc-dialog" ref={calculatorDialog} aria-labelledby="jp-practice-calculator-title">
        <h2 id="jp-practice-calculator-title">Calculator</h2>
        {calculatorUsed && (CalculatorView ? <CalculatorView close={() => calculatorDialog.current?.close()} /> : <>
          <p class="jp-mode-lead" role="status">{calculatorFailed ? 'Could not open the calculator.' : 'Loading…'}</p>
          <div class="jp-dialog-actions">
            <button type="button" class="jp-btn" onClick={() => calculatorDialog.current?.close()}>Close</button>
          </div>
        </>)}
      </dialog>

      {askOpen && (!isWide || !answered) && (
        <AskSheet
          questionId={question.id}
          options={options}
          answered={answered}
          letterFor={letterFor}
          onClose={handleCloseSheet}
        />
      )}
    </main>
  )
}
