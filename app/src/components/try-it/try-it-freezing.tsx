import { useState } from 'preact/hooks'
import { near, Scene, Select, Slider, TryIt, Values } from './TryIt'
import type { InteractiveProps } from './TryItCard'

export const freezingDrop = (molality: number, salt: boolean) => 1.86 * molality * (salt ? 2 : 1)
export const freezingTarget = (molality: number, salt: boolean) => near(freezingDrop(molality, salt), 1.86, 0.04)

export default function FreezingPoint(props: InteractiveProps) {
  const [salt, setSalt] = useState(false)
  const [molality, setMolality] = useState(1)
  const drop = freezingDrop(molality, salt)
  const marker = 22 + 8.2 * drop
  return <TryIt {...props} context="In a market cooler, adding salt to ice lowers the temperature at which the mixture freezes."
    prediction={{ question: 'At equal molality, which lowers water’s freezing point more?',
      choices: ['Both equally', 'Salt', 'Sugar'], correct: 1, action: 'Switch from sugar to salt at 1 mol/kg.',
      observed: salt && molality === 1, why: 'In this ideal model, each unit of salt gives two ions. Sugar stays as whole molecules.' }}
    missions={[
      { goal: 'Make the freezing point −1.86 °C.', reached: freezingTarget(molality, salt), hint: 'Use the solute amount and the number of particles it makes.' },
      { goal: 'Compare sugar and salt at 1 mol/kg. Leave salt selected.', baseline: !salt && molality === 1, reached: salt && molality === 1,
        hint: 'Count the dissolved particles in each model.',
        reason: { question: 'Why is the drop for salt twice as large here?', choices: ['Salt produces two ions per unit', 'Salt is always twice as heavy as sugar'], correct: 0 } },
      { goal: 'Dissolve 1.5 mol of sugar per kg of water. Set the model to find the freezing point depression.',
        reached: !salt && molality === 1.5, hint: 'For sugar, one dissolved molecule counts as one particle.',
        answer: { question: 'By how much does the freezing point fall?', choices: ['2.79 °C', '5.58 °C'], correct: 0 },
        trap: 'The number of dissolved particles per kg of solvent determines the drop. Equal solute masses can give different particle counts.' },
    ]}
    explain={{ question: 'Why does dissolving more sugar lower the freezing point further?',
      choices: ['There are more dissolved particles per kg of water', 'Sugar molecules split into ions'], correct: 0,
      feedback: ['A larger particle concentration gives a larger freezing point depression.', 'Sugar dissolves as molecules. More sugar gives more of those molecules.'] }}
    formulas={['ΔT = iK_{f}m', 'K_{f} = 1.86 °C kg/mol', salt ? 'NaCl → Na^{+} + Cl^{−} (ideal i = 2)' : 'Sugar: i = 1']}>
    {() => <>
      <Scene label="Thermometer and dissolved particles">
        <rect x="38" y="15" width="9" height="72" rx="4" fill="var(--bg)" stroke="var(--ink-2)" />
        <path d={`M42.5 ${marker}V88`} stroke="var(--brand)" stroke-width="6" />
        <circle cx="42.5" cy="91" r="10" fill="var(--brand)" />
        <text x="15" y="24">0°</text><text x="9" y="75">−6°</text>
        <rect x="105" y="12" width="194" height="84" rx="8" fill="none" stroke="var(--option-line)" />
        {Array.from({ length: Math.round(8 * molality) }, (_, i) => <g key={i} transform={`translate(${120 + 23 * (i % 8)} ${27 + 19 * Math.floor(i / 8)})`}>
          <circle r="4" fill="var(--brand)" />
          {salt && <circle cx="8" cy="5" r="3" fill="var(--memo)" />}
        </g>)}
      </Scene>
      <Values items={{ 'Freezing point': (drop ? -drop : 0).toFixed(2) + ' °C', 'Drop': drop.toFixed(2) + ' °C',
        'Particles per solute unit': salt ? '2' : '1' }} />
      <Select label="Solute" value={salt ? 'salt' : 'sugar'} options={ [['sugar', 'Sugar'], ['salt', 'Salt']] } onChange={(value) => setSalt(value === 'salt')} />
      <Slider label={'Molality (mol/kg) · ' + molality} min={0} max={2} step={0.02} value={molality} onChange={setMolality} />
    </>}
  </TryIt>
}
