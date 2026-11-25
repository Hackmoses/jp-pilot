import { useState } from 'preact/hooks'
import { ease, near, Scene, Select, Travel, TryIt, Values } from './TryIt'
import type { InteractiveProps } from './TryItCard'

const masses = { 'H₂': 2, He: 4, 'NH₃': 17, 'O₂': 32, HCl: 36.5, 'CO₂': 44, 'CH₄': 16 }
type Gas = keyof typeof masses
export function graham(first: number, second: number) {
  const ratio = Math.sqrt(second / first)
  return { ratio, meet: ratio / (1 + ratio) }
}
export const unknownMass = (known: number, ratio: number) => known / ratio ** 2

export default function DiffusionRace(props: InteractiveProps) {
  const [left, setLeft] = useState<Gas>('O₂')
  const [right, setRight] = useState<Gas>('O₂')
  const { ratio, meet } = graham(masses[left], masses[right])
  const point = 20 + 280 * meet
  const duration = 0.85 / (1 / Math.sqrt(masses[left]) + 1 / Math.sqrt(masses[right]))
  const options = Object.keys(masses).map((gas) => [gas, gas] as const)
  return <TryIt {...props} context="The smell of pepper soup can reach you before you see the pot."
    prediction={{ question: 'At equal temperature, which gas reaches the middle of the tube first?',
      choices: ['The lighter gas', 'The heavier gas'], correct: 0, action: 'Set hydrogen (H₂) on the left and oxygen (O₂) on the right.',
      observed: left === 'H₂' && right === 'O₂', why: 'Hydrogen has a lower molar mass, so it spreads faster at the same temperature.' }}
    missions={[
      { goal: 'Make the left gas diffuse twice as fast as the right gas.', reached: near(ratio, 2, 0.01), hint: 'Look for a gas on the right with roughly four times the molar mass.' },
      { goal: 'Try HCl on the left and NH₃ on the right, then swap them.', baseline: left === 'HCl' && right === 'NH₃', reached: left === 'NH₃' && right === 'HCl',
        hint: 'The faster gas travels farther in the same time.',
        reason: { question: 'Why do they meet nearer the HCl end?', choices: ['NH₃ has less mass per mole and travels farther', 'HCl has less mass per mole and travels farther'], correct: 0 } },
      { goal: 'X diffuses twice as fast as Y, whose molar mass is 16 g/mol. Match the rates with X on the left and select its mass.',
        reached: masses[right] === 16 && near(ratio, 2), hint: 'Square the rate ratio before using it to relate the masses.',
        answer: { question: 'What is the molar mass of X?', choices: ['8 g/mol', unknownMass(16, 2) + ' g/mol'], correct: 1 },
        trap: 'The rate is proportional to the inverse square root of molar mass. Doubling the rate means quartering the mass.' },
    ]}
    explain={{ question: 'Why is the meeting point in the middle for two identical gases?',
      choices: ['Their diffusion rates are equal', 'Both gases stop moving in the middle'], correct: 0,
      feedback: ['At equal temperature, equal molar masses give equal rates and travel distances.', 'The gas particles still move. Both fronts reach the midpoint at the same time.'] }}
    formulas={['\\frac{r_{1}}{r_{2}} = \\sqrt{\\frac{M_{2}}{M_{1}}}']}>
    {() => <>
      <Scene label={'Gas fronts meet ' + Math.round(100 * meet) + '% of the way from the left'} height={91}>
        <rect x="15" y="24" width="290" height="42" rx="16" fill="none" stroke="var(--ink-2)" />
        <path d="M160 24v42" stroke="var(--option-line)" stroke-dasharray="3 3" />
        <path d={`M${point} 20v50`} {...ease({ d: `M${point} 20v50` })} stroke="var(--good)" stroke-width="2" />
        {[20, 300].map((x, side) => <g key={x} fill={side ? 'var(--memo)' : 'var(--brand)'}>
          <circle cx={x} cy="45" r="3" />
          <Travel points={[x, 45, point, 45]} seconds={duration}>
            <circle cx="-7" cy="-11" r="3" /><circle r="3" /><circle cx="6" cy="11" r="3" />
          </Travel>
        </g>)}
        <text x="18" y="84">{left}</text><text x="302" y="84" text-anchor="end">{right}</text>
      </Scene>
      <Values items={{ 'Left mass': masses[left] + ' g/mol', 'Right mass': masses[right] + ' g/mol', 'Left ÷ right rate': ratio.toFixed(2),
        'Meeting point from left': (100 * meet).toFixed(1) + '%' }} />
      <div class="jp-try-sliders">
        <Select info="The gas released at the left end. A lighter gas diffuses faster (Graham's law)." label="Left gas" value={left} options={options} onChange={(value) => setLeft(value as Gas)} />
        <Select info="The gas released at the right end. Compare its molar mass with the left gas." label="Right gas" value={right} options={options} onChange={(value) => setRight(value as Gas)} />
      </div>
    </>}
  </TryIt>
}
