import { useEffect } from 'preact/hooks'
import { getAttempt } from '../lib/modes'
import { AttemptRun } from './AttemptRun'
import { Session } from './Session'

export function PracticeRun() {
  const passageId = getAttempt('practice')?.passageId
  useEffect(() => {
    if (passageId) window.location.replace('#/practice/passages?set=' + passageId)
  }, [passageId])
  if (passageId) return null
  return <AttemptRun mode="practice">{(attempt) => <Session attempt={attempt} />}</AttemptRun>
}
