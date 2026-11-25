import { useState } from 'preact/hooks'
import { Select, TryIt, Values } from './TryIt'
import type { InteractiveProps } from './TryItCard'

const solutions = ['Dilute', 'Equal', 'Concentrated'] as const
type Solution = typeof solutions[number]
export function osmosis(outside: Solution) {
  if (outside === 'Dilute') return { water: 'Into the cell', cell: 'Turgid', inset: 3 }
  if (outside === 'Concentrated') return { water: 'Out of the cell', cell: 'Plasmolysed', inset: 26 }
  return { water: 'No net flow', cell: 'No change', inset: 11 }
}

export default function OsmosisCell(props: InteractiveProps) {
  const [outside, setOutside] = useState<Solution>('Equal')
  const { water, cell, inset } = osmosis(outside)
  const equal = outside === 'Equal'
  const inward = outside === 'Dilute'
  return <TryIt {...props} context="Salt draws water out of sliced vegetables, such as ugu, as they sit."
    prediction={{ question: 'What happens to a plant cell in concentrated sugar solution?',
      choices: ['It swells', 'Its membrane pulls from the wall', 'It stays the same'], correct: 1,
      action: 'Choose a concentrated outside solution.', observed: outside === 'Concentrated',
      why: 'The concentrated solution has lower water potential, so the cell loses water and its membrane pulls away.' }}
    missions={[
      { goal: 'Make the cell turgid.', reached: inward, hint: 'A turgid cell gains water.' },
      { goal: 'Move the swollen cell from dilute to equal solution. Pick the reason.',
        baseline: inward, reached: equal, hint: 'Check whether water can still move in both directions.',
        reason: { question: 'Why is there no net movement now?', choices: ['Water cannot cross the membrane', 'Water crosses both ways at the same rate'], correct: 1 } },
      { goal: 'A plant cell is put into concentrated sucrose. Recreate the setup to identify the observed condition.',
        reached: outside === 'Concentrated', hint: 'Watch for a gap between the membrane and the wall.',
        answer: { question: 'Which condition does the model show?', choices: ['Plasmolysis', 'Turgidity'], correct: 0 },
        trap: 'If the membrane pulls away, the cell is plasmolysed. In a turgid cell it presses against the wall.' },
    ]}
    explain={{ question: 'Why does water leave in concentrated solution?',
      choices: ['Water moves towards lower water potential', 'The wall pushes the water out'], correct: 0,
      feedback: ['The partially permeable membrane allows water to move down the water-potential gradient.', 'The wall holds its shape. Water leaves through the membrane because water potential is lower outside.'] }}
    formulas={['Net water flow: higher → lower water potential']}>
    {(unlocked) => <>
      <Select label="Outside solution" value={outside} options={solutions.map((name) => [name, name])}
        onChange={(value) => setOutside(value as Solution)} />
      <div class="jp-try-scene">
        <svg viewBox="0 0 320 134" role="img" aria-label={cell + '. Water movement: ' + water}>
          <rect x="84" y="18" width="152" height="94" rx="12" fill="none" stroke="var(--ink-2)" stroke-width="3" />
          <rect x={84 + inset} y={18 + inset} width={152 - 2 * inset} height={94 - 2 * inset}
            rx="11" class="jp-try-membrane" fill="var(--memo-soft)" stroke="var(--memo)" stroke-width="2" />
          <text x="160" y="69" text-anchor="middle">{cell}</text>
          {[43, 84].map((y, index) => <g key={y} stroke="var(--brand)" fill="none" stroke-width="2">
            {[false, true].map((right) => {
              const reverse = equal ? index === 1 : !inward
              return <g key={String(right)} transform={right ? 'translate(320 0) scale(-1 1)' : undefined}>
                <path d={reverse ? `M123 ${y}H50m6-5-6 5 6 5` : `M50 ${y}H123m-6-5 6 5-6 5`} />
                {unlocked && <circle class="jp-try-moving" r="3" fill="var(--brand)">
                  <animateMotion key={outside} {...{ path: reverse ? `M123 ${y}H50` : `M50 ${y}H123` }} dur="1.7s" repeatCount="indefinite" />
                </circle>}
              </g>
            })}
          </g>)}
          <text x="93" y="128">Cell wall</text><text x="170" y="128">Membrane</text>
        </svg>
      </div>
      <Values items={{ 'Water': water, 'Cell': cell, 'Wall': 'Holds its shape' }} />
    </>}
  </TryIt>
}
