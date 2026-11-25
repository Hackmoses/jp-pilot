import { AttemptRun } from './AttemptRun'
import { Session } from './Session'

export function PracticeRun() {
  return <AttemptRun mode="practice">{(attempt) => <Session attempt={attempt} />}</AttemptRun>
}
