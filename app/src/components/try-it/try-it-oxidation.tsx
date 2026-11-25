import { useState } from 'preact/hooks'
import { ease, Select, Travel, TryIt, Values } from './TryIt'
import type { InteractiveProps } from './TryItCard'

const compounds = {
  'NH₃': ['N', 1, '3H(+1)', 3, 0],
  'H₂SO₄': ['S', 1, '2H(+1) + 4O(−2)', -6, 0],
  'KMnO₄': ['Mn', 1, 'K(+1) + 4O(−2)', -7, 0],
  'Cr₂O₇²⁻': ['Cr', 2, '7O(−2)', -14, -2],
  'NO₃⁻': ['N', 1, '3O(−2)', -6, -1],
} as const
type Compound = keyof typeof compounds

export function oxidationTotal(compound: Compound, unknown: number) {
  const [, count, , knownTotal] = compounds[compound]
  return count * unknown + knownTotal
}
export function oxidationNumber(compound: Compound) {
  const [, count, , knownTotal, charge] = compounds[compound]
  return (charge - knownTotal) / count
}

export default function OxidationFinder(props: InteractiveProps) {
  const [compound, setCompound] = useState<Compound>('NH₃')
  const [unknown, setUnknown] = useState(0)
  const [element, count, known, knownTotal, charge] = compounds[compound]
  const total = oxidationTotal(compound, unknown)
  const balanced = unknown === oxidationNumber(compound)
  return <TryIt {...props} context="Potassium permanganate is an oxidising agent used in some water-treatment systems in Nigeria."
    prediction={{ question: 'In neutral NH₃, is nitrogen’s oxidation number positive, zero or negative?',
      choices: ['Positive', 'Zero', 'Negative'], correct: 2, action: 'Use the stepper to balance NH₃.',
      observed: compound === 'NH₃' && balanced, why: 'The three H atoms contribute +3, so nitrogen must contribute −3 to make zero.' }}
    missions={[
      { goal: 'Balance the oxidation numbers in H₂SO₄.', reached: compound === 'H₂SO₄' && balanced, hint: 'Add the hydrogen and oxygen contributions before adjusting sulfur.' },
      { goal: 'Compare neutral NH₃ with NO₃⁻. Balance NO₃⁻ and pick the reason.',
        baseline: compound === 'NH₃', reached: compound === 'NO₃⁻' && balanced, hint: 'Look at the target charge in each case.',
        reason: { question: 'Why does the sum in NO₃⁻ end at −1?', choices: ['The ion has charge −1', 'Each nitrogen atom has charge −1'], correct: 0 } },
      { goal: 'What is the oxidation number of chromium in Cr₂O₇²⁻? Balance the ion.',
        reached: compound === 'Cr₂O₇²⁻' && balanced, hint: 'Once you account for oxygen, share the remaining contribution across the chromium atoms.',
        trap: 'The sum covers both chromium atoms. The question asks for the number per atom.' },
    ]}
    explain={{ question: 'Why does K contribute +1 in KMnO₄?',
      choices: ['It is in Group 1', 'The compound is neutral'], correct: 0,
      feedback: ['Group 1 metals have oxidation number +1 in their compounds.', 'Neutrality sets the total to zero. Potassium’s +1 comes from its group.'] }}
    formulas={[`${known} + ${count}(${element}) = ${charge}`, 'Sum of oxidation numbers = overall charge']}>
    {() => <>
      <Select label="Species" value={compound} options={Object.keys(compounds).map((name) => [name, name])}
        onChange={(value) => setCompound(value as Compound)} />
      <div class="jp-pills" role="group" aria-label={'Set ' + element + ' oxidation number'}>
        <button class="jp-btn" type="button" aria-label="Decrease oxidation number" disabled={unknown <= -8} onClick={() => setUnknown(unknown - 1)}>−</button>
        <button class="jp-btn" type="button" aria-label="Increase oxidation number" disabled={unknown >= 8} onClick={() => setUnknown(unknown + 1)}>+</button>
      </div>
      <div class="jp-try-scene">
        <svg viewBox="0 0 320 102" role="img" aria-label={balanced ? 'Total and overall charge balance' : 'Balance tilted towards the larger number'}>
          <path d="M160 49l-16 41h32z" fill="var(--ink-2)" />
          <g transform={`rotate(${Math.max(-18, Math.min(18, (charge - total) * 3))} 160 48)`}
            {...ease({ transform: `rotate(${Math.max(-18, Math.min(18, (charge - total) * 3))} 160 48)` })}>
            <path d="M59 48h202m-187 0-12 20h24zm172 0-12 20h24z" fill="none" stroke={balanced ? 'var(--good)' : 'var(--brand)'} stroke-width="3" />
            <Travel points={[115, 48, 75, 48, 75, 59]} seconds={1.8}><circle r="3" fill="var(--memo)" /></Travel>
            <text x="74" y="38" text-anchor="middle">Total {total}</text><text x="246" y="38" text-anchor="middle">Charge {charge}</text>
          </g>
        </svg>
      </div>
      <Values balanced={balanced} items={{ 'Known charges:': known, 'Known total:': String(knownTotal),
        [element + ' per atom:']: String(unknown), 'Running total:': String(total), 'Overall charge:': String(charge),
        '': balanced ? '✓ Balanced' : 'Adjust the unknown' }} />
    </>}
  </TryIt>
}
