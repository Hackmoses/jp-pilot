import { useState } from 'preact/hooks'
import { ease, near, Scene, Slider, Travel, TryIt, Values } from './TryIt'
import type { InteractiveProps } from './TryItCard'

const factor = 380
const gases = ['O₂', 'N₂', 'CO₂']
const colours = ['var(--brand)', 'var(--memo)', 'var(--good)']
export function gasPressures(moles: number[]) {
  const amount = moles.reduce((sum, n) => sum + n, 0)
  return { total: factor * amount, partials: moles.map((n) => factor * n), fractions: moles.map((n) => amount ? n / amount : 0) }
}

export default function PartialPressures(props: InteractiveProps) {
  const [moles, setMoles] = useState([1, 0.5, 0])
  const [oxygen, nitrogen, carbonDioxide] = moles
  const { total, partials, fractions } = gasPressures(moles)
  return <TryIt {...props} aim="See how each gas in a mixture adds its own share to the total pressure." context="The air in a tyre contains several gases. Each one contributes to the pressure."
    prediction={{ question: 'At fixed temperature and volume, what does adding nitrogen do to oxygen’s partial pressure?',
      choices: ['It rises', 'It falls', 'It stays the same'], correct: 2, action: 'Raise nitrogen from 0.5 to 2 mol. Leave oxygen at 1 mol and CO₂ at zero.',
      observed: oxygen === 1 && nitrogen === 2 && carbonDioxide === 0, why: 'The same amount of oxygen occupies the same space at the same temperature.' }}
    missions={[
      { goal: 'Make the total pressure 760 mmHg.', reached: near(total, 760, 3), hint: 'Use the total amount of gas to set the pressure.' },
      { goal: 'Try 1 mol O₂ alone. Add 1 mol CO₂ while holding O₂ steady.', baseline: oxygen === 1 && nitrogen === 0 && carbonDioxide === 0,
        reached: oxygen === 1 && nitrogen === 0 && carbonDioxide === 1, hint: 'Compare oxygen’s share with its partial pressure.',
        reason: { question: 'Why did oxygen’s partial pressure stay fixed?', choices: ['Its amount, temperature and volume did not change', 'The total pressure stayed fixed'], correct: 0 } },
      { goal: 'A vessel contains 1 mol O₂, 2 mol N₂ and 1 mol CO₂ at 1,520 mmHg. Model the mixture and find oxygen’s partial pressure.',
        reached: oxygen === 1 && nitrogen === 2 && carbonDioxide === 1, hint: 'Multiply the total pressure by oxygen’s mole fraction.',
        answer: { question: 'How much pressure is due to oxygen?', choices: ['380 mmHg', '760 mmHg'], correct: 0 },
        trap: 'Adding gas at fixed volume lowers the original gas’s mole fraction. Its own partial pressure stays fixed.' },
    ]}
    explain={{ question: 'Why can the total pressure rise even when oxygen’s partial pressure stays fixed?',
      choices: ['Other gases contribute their own pressure', 'Oxygen molecules grow when more gas is added'], correct: 0,
      feedback: ['Add the contributions from all the gases to get the total.', 'Adding another gas adds particles. It leaves the existing oxygen molecules unchanged.'] }}
    formulas={['P_{total} = P_{O₂} + P_{N₂} + P_{CO₂}', 'P_{i} = x_{i} × P_{total}']}>
    {() => <>
      <Scene label="Gas particles in a fixed vessel and stacked bars for partial pressure">
        <rect x="15" y="10" width="290" height="54" rx="8" fill="none" stroke="var(--ink-2)" />
        {moles.map((amount, gas) => <g key={gas} fill={colours[gas]}>
          {[0, 1].map((group) => <Travel key={group} points={[0, 0, 8, 5, -6, -4, 0, 0]}
            seconds={1.5 + gas * 0.15} offset={group * 0.5 + gas * 0.16}>
            {Array.from({ length: Math.max(0, Math.ceil(amount - group * 0.5)) }, (_, dot) => <circle key={dot} r="3"
              cx={29 + 19 * ((gas + dot * 4 + group * 3) % 14)} cy={24 + 7 * ((dot + gas * 3 + group) % 5)} />)}
          </Travel>)}
          <rect x={15 + partials.slice(0, gas).reduce((sum, p) => sum + p, 0) / 12}
            y="73" width={partials[gas] / 12}
            {...ease({ x: 15 + partials.slice(0, gas).reduce((sum, p) => sum + p, 0) / 12, width: partials[gas] / 12 })} height="16" />
          <text x={24 + 55 * gas} y="105" style={{ fill: colours[gas] }}>{gases[gas]}</text>
        </g>)}
      </Scene>
      <Values items={{ 'Total': total + ' mmHg', 'O₂': partials[0] + ' mmHg', 'N₂': partials[1] + ' mmHg', 'CO₂': partials[2] + ' mmHg',
        'O₂ mole fraction': fractions[0].toFixed(2) }} />
      <div class="jp-try-sliders">
        {moles.map((amount, gas) => <Slider key={gas} label={gases[gas] + ' (mol) · ' + amount}
          value={amount} min={0} max={3} step={0.25} onChange={(next) => setMoles(moles.map((n, i) => i === gas ? next : n))} />)}
      </div>
    </>}
  </TryIt>
}
