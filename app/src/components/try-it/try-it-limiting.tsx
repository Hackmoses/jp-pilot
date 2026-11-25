import { useState } from 'preact/hooks'
import { ease, near, Scene, Slider, Travel, TryIt, Values } from './TryIt'
import type { InteractiveProps } from './TryItCard'

export function reaction(hydrogen: number, oxygen: number) {
  const batches = Math.min(hydrogen / 2, oxygen)
  return { water: 2 * batches, hydrogenLeft: hydrogen - 2 * batches, oxygenLeft: oxygen - batches }
}

export function waterTarget(hydrogen: number, oxygen: number) {
  const { water, hydrogenLeft, oxygenLeft } = reaction(hydrogen, oxygen)
  return near(water, 4, 0.1) && near(hydrogenLeft, 0, 0.1) && near(oxygenLeft, 0, 0.1)
}

export default function LimitingReagent(props: InteractiveProps) {
  const [h, setH] = useState(6)
  const [o, setO] = useState(2)
  const { water, hydrogenLeft, oxygenLeft } = reaction(h, o)
  const rows = [
    ['H₂ left', hydrogenLeft, 'var(--brand)'],
    ['O₂ left', oxygenLeft, 'var(--memo)'],
    ['H₂O made', water, 'var(--good)'],
  ] as const
  return <TryIt {...props} context="Extra rice cannot make more pots of jollof if you have already used all the tomatoes."
    prediction={{ question: 'If all the oxygen has reacted, what does adding more hydrogen do to the amount of water?',
      choices: ['It increases', 'It stays the same'], correct: 1, action: 'Increase hydrogen from 6 to 8 cm³, keeping oxygen at 2 cm³.',
      observed: h === 8 && o === 2, why: 'The recipe needs oxygen too. Once it is used up, extra hydrogen is left over.' }}
    missions={[
      { goal: 'Make 4 cm³ of water vapour with no gas left over.', reached: waterTarget(h, o), hint: 'The equation needs two parts hydrogen for every part oxygen.' },
      { goal: 'Set 8 cm³ hydrogen and 4 cm³ oxygen. Then raise the oxygen to 8 cm³.', baseline: h === 8 && o === 4, reached: h === 8 && o === 8,
        hint: 'Compare how much oxygen 8 cm³ of hydrogen can use.',
        reason: { question: 'Which gas runs out first, and why?', choices: ['Hydrogen. Each batch needs twice as much of it.', 'Oxygen. The starting volumes are equal.'], correct: 0 } },
      { goal: 'React 8 cm³ of hydrogen with 20 cm³ of oxygen at the same temperature and pressure. Find the leftover oxygen.',
        reached: h === 8 && o === 20, hint: 'Find the oxygen consumed before subtracting from the starting volume.',
        answer: { question: 'What volume of oxygen remains?', choices: ['12 cm³', '16 cm³'], correct: 1 },
        trap: 'Use the 2:1 recipe to decide which gas is in excess. The larger starting amount alone is insufficient.' },
    ]}
    explain={{ question: 'Why can 6 cm³ of hydrogen run out before 4 cm³ of oxygen?',
      choices: ['The reaction uses two volumes of hydrogen per volume of oxygen', 'It uses more oxygen than hydrogen per batch'], correct: 0,
      feedback: ['Six volumes of hydrogen need only three of oxygen, leaving one oxygen volume.', 'The coefficients are 2 for hydrogen and 1 for oxygen.'] }}
    formulas={['2H_{2} + O_{2} → 2H_{2}O', 'Gas volumes at the same temperature and pressure: 2 : 1 : 2']}>
    {() => <>
      <Scene label="Dots group into hydrogen, oxygen and water molecules. The rows show what is left and what is made." height={124}>
        {rows.map(([label, value, colour], row) => <g key={label} transform={`translate(0 ${row * 36})`}
          data-replay-from={row === 2 ? '{"opacity":"0"}' : undefined} {...ease({ opacity: 1 })}>
          <text x="9" y="25">{label}</text>
          {Array.from({ length: Math.ceil(value) }, (_, i) => <g key={i} transform={`translate(${107 + 24 * (i % 9)} ${19 + 10 * Math.floor(i / 9)})`}
            opacity={Math.min(1, value - i)} {...ease({ opacity: Math.min(1, value - i) })}>
            <circle cx="-4" r="3" fill={colour} /><circle cx="4" r="3" fill={colour} />
            {row === 2 && <circle cy="-4" r="3" fill="var(--memo)" />}
          </g>)}
        </g>)}
        {water > 0 && <>
          <Travel points={[85, 14, 99, 53, 108, 89]} seconds={1.8}><circle r="2.5" fill="var(--brand)" /></Travel>
          <Travel points={[86, 49, 99, 53, 108, 85]} seconds={1.8}><circle r="2.5" fill="var(--memo)" /></Travel>
        </>}
      </Scene>
      <Values items={{ 'Water made': water.toFixed(1) + ' cm³', 'Hydrogen left': hydrogenLeft.toFixed(1) + ' cm³', 'Oxygen left': oxygenLeft.toFixed(1) + ' cm³' }} />
      <div class="jp-try-sliders">
        <Slider info="Volume of hydrogen available to react." label={'Hydrogen (cm³) · ' + h} value={h} min={0} max={16} step={0.1} onChange={setH} />
        <Slider info="Volume of oxygen available. Two volumes of hydrogen react with one of oxygen." label={'Oxygen (cm³) · ' + o} value={o} min={0} max={20} step={0.1} onChange={setO} />
      </div>
    </>}
  </TryIt>
}
