import type { ComponentChildren } from 'preact'
import { useState } from 'preact/hooks'
import { getAttempt, getAttemptQuestions, restoreAttemptQuestions, type Attempt, type TestMode } from '../lib/modes'
import { Panel, useSubjects } from './Modes'

export function AttemptRun({ mode, children }: { mode: TestMode; children: (attempt: Attempt) => ComponentChildren }) {
  const [{ attempt, offline }] = useState(() => {
    const attempt = getAttempt(mode)
    return { attempt, offline: restoreAttemptQuestions(attempt) }
  })
  const status = useSubjects(offline ? [] : attempt?.subjects ?? [])
  if (!attempt || status !== 'ready') return <Panel title={
    !attempt ? 'No session to resume' : status === 'loading' ? 'Loading questions…' : 'Could not load questions'
  } back={mode === 'exam' ? '#/exam' : '#/subjects?mode=practice'} />
  if (getAttemptQuestions(attempt).length !== attempt.ids.length) return <Panel title="Some questions are no longer available" />
  return <>{children(attempt)}</>
}
