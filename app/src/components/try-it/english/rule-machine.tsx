import { Select } from '../TryIt'
import { EnglishActivity } from './EnglishActivity'
import type { InteractiveProps } from '../TryItCard'

type Rule = 'double' | 'drop-e' | 'y-to-i' | 'keep'
const rules: Record<Rule, string> = {
  double: 'Double the final consonant.',
  'drop-e': 'Drop the silent e.',
  'y-to-i': 'Change final y to i.',
  keep: 'Keep the base unchanged.',
}
export function ruleResult(base: string, suffix: string, rule: Rule) {
  const stem = rule === 'double' ? base + base.slice(-1) : rule === 'drop-e' ? base.slice(0, -1)
    : rule === 'y-to-i' ? base.slice(0, -1) + 'i' : base
  return stem + suffix
}

function combine(base: string, suffix: string, rule: Rule) {
  return { base, suffix, rule, answer: base + '+' + suffix,
    goal: 'Combine ' + base + ' with -' + suffix + '.', hint: 'Select the base first, then select its ending.' }
}
export const ruleTrials = [
  combine('run', 'ing', 'double'), combine('make', 'ing', 'drop-e'),
  combine('happy', 'ness', 'y-to-i'), combine('travel', 'ed', 'double'),
] as const
export const ruleExamples = [...ruleTrials, combine('dye', 'ing', 'keep'), combine('help', 'ful', 'keep')]
const bases = [['', 'Choose a base'], ...ruleExamples.map(({ base }) => [base, base] as const)] as const
const suffixes = [['', 'Choose a suffix'], ...[...new Set(ruleExamples.map(({ suffix }) => suffix))]
  .map((suffix) => [suffix, '-' + suffix] as const)] as const

export default function RuleMachine(props: InteractiveProps) {
  return <EnglishActivity {...props} tasks={ruleTrials} aim="See which spelling rule applies when you add a suffix."
    context="Try a base and an ending. The machine demonstrates the checked combinations."
    prediction={{ question: 'What happens when -ing joins run?', choices: ['Keep one n', 'Double the n'], correct: 1, why: 'The short vowel and final single n give running.' }}
    reason={{ question: 'What changed when you built happiness?', choices: ['Final y became i', 'Final y was doubled'], correct: 0 }}
    trap="British spelling often doubles a final l in forms like travelled."
    controls={(_, value, change) => {
      const [base = '', suffix = ''] = value.split('+')
      const match = ruleExamples.find((example) => example.answer === value)
      return <>
        <Select label="Base" value={base} options={bases} onChange={(next) => change(next + '+' + suffix)} />
        <Select label="Suffix" value={suffix} options={suffixes} onChange={(next) => change(base + '+' + next)} />
        {match ? <p class="jp-try-outcome jp-try-outcome--info" role="status">
          <strong>{ruleResult(base, suffix, match.rule)}</strong> · {rules[match.rule]}
        </p> : base && suffix && <p class="jp-try-text" role="status">Choose a different base or ending to see a checked example.</p>}
      </>
    }} />
}
