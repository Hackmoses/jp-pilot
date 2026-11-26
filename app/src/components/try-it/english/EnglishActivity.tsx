import type { ComponentChildren } from 'preact'
import { useState } from 'preact/hooks'
import { TryIt } from '../TryIt'
import type { InteractiveProps } from '../TryItCard'
import './english-activities.css'

export type Task = { goal: string; hint: string; answer: string }
export type FourTasks<T extends Task> = readonly [T, T, T, T]
type Props<T extends FourTasks<Task>> = InteractiveProps & {
  aim: string
  context: string
  tasks: T
  prediction: { question: string; choices: readonly string[]; correct: number; why: string }
  reason: { question: string; choices: readonly [string, string]; correct: 0 | 1 }
  trap: string
  controls: (task: T[number], value: string, change: (value: string) => void) => ComponentChildren
}

export function isSolved(task: Task, value: string | undefined) {
  return value === task.answer
}

export function EnglishActivity<T extends FourTasks<Task>>({ tasks, controls, prediction, reason, trap, english, ...props }: Props<T>) {
  const [answers, setAnswers] = useState<Record<number, string>>({})
  if (!english) return null
  const [watch, first, second, third] = tasks
  const explain = english.explain
  const mission = ({ goal, hint, answer }: Task, index: number) => ({ goal, hint, reached: answers[index] === answer })
  return <TryIt {...props} mode="exercise" formulas={[]} prediction={{
    ...prediction, action: watch.goal, observed: isSolved(watch, answers[0]),
  }} missions={[
    mission(first, 1),
    { ...mission(second, 2), baseline: isSolved(first, answers[1]), reason },
    { ...mission(third, 3), trap },
  ]} explain={{ question: explain.prompt, choices: explain.options, correct: explain.answerIndex,
    feedback: explain.options.map((_, i) => i === explain.answerIndex ? explain.feedback : 'Try again. ' + explain.feedback) }}>
    {(_, challenge) => <div key={challenge} class="jp-try-word-model">
      {controls(tasks[challenge], answers[challenge] ?? '', (value) => setAnswers((previous) => ({ ...previous, [challenge]: value })))}
    </div>}
  </TryIt>
}

export function ChoiceButtons({ options, picked, onPick, label }: {
  options: readonly string[]; picked: string; onPick: (option: string) => void; label: string
}) {
  return <div class="jp-pills" role="group" aria-label={label}>{options.map((option) =>
    <button key={option} type="button" class="jp-btn" aria-pressed={option === picked} onClick={() => onPick(option)}>{option}</button>,
  )}</div>
}
