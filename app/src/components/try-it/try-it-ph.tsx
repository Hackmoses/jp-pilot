import { useState } from 'preact/hooks'
import { near, Select, TryIt, Values } from './TryIt'
import type { InteractiveProps } from './TryItCard'

type Solute = 'HCl' | 'NaOH'
export function strongPH(solute: Solute, concentration: number) {
  const exponent = -Math.log10(concentration)
  return solute === 'HCl' ? exponent : 14 - exponent
}
export const phTarget = (solute: Solute, concentration: number, target: number) => near(strongPH(solute, concentration), target)

export default function PHScale(props: InteractiveProps) {
  const [solute, setSolute] = useState<Solute>('HCl')
  const [dilutions, setDilutions] = useState(0)
  const concentration = 10 ** -dilutions
  const acid = solute === 'HCl'
  const pH = strongPH(solute, concentration)
  const marker = 20 + 20 * pH
  const colour = acid ? 'var(--bad)' : 'var(--brand)'
  return <TryIt {...props} context="Adding water to a sour zobo drink dilutes its acids. Here we model a strong acid and base."
    prediction={{ question: 'How does the pH of HCl change when you dilute it tenfold?',
      choices: ['Goes up by 1', 'Goes down by 1', 'Stays the same'], correct: 0,
      action: 'Set HCl to 1 mol/dm³, then dilute it tenfold.',
      observed: acid && dilutions === 1, why: 'There are ten times fewer hydrogen ions per unit volume, so pH rises by 1.' }}
    missions={[
      { goal: 'Make the pH exactly 3.', reached: phTarget(solute, concentration, 3), hint: 'Move the acid’s pH marker closer to neutral.' },
      { goal: 'Dilute 0.1 mol/dm³ NaOH tenfold. Leave it at the new concentration.',
        baseline: !acid && dilutions === 1, reached: !acid && dilutions === 2, hint: 'Follow hydroxide first, then look at the pH scale.',
        reason: { question: 'Why does pH fall?', choices: ['Fewer hydroxide ions per unit volume bring pH towards 7', 'Diluting NaOH produces extra hydroxide ions'],
          correct: 0 } },
      { goal: 'At 25 °C, which NaOH concentration gives pH 13? Set it on the scale.',
        reached: !acid && phTarget(solute, concentration, 13), hint: 'Start with pH + pOH = 14 and work backwards.',
        trap: 'For NaOH, the negative logarithm of concentration gives pOH.' },
    ]}
    explain={{ question: 'Why do acid and base pH values move towards each other on dilution?',
      choices: ['The solution with extra water has more concentrated ions', 'The solute ions are spread through more water'], correct: 1,
      feedback: ['The same amount of solute occupies more volume, so its concentration falls.', 'Hydrogen ions in the acid and hydroxide ions in the base become less concentrated.'] }}
    formulas={['pH = −log_{10}[H^{+}]', 'pOH = −log_{10}[OH^{−}]', 'pH + pOH = 14 (25 °C)']}>
    {() => <>
      <div class="jp-try-sliders">
        <Select label="Solute" value={solute} options={ [['HCl', 'HCl'], ['NaOH', 'NaOH']] } onChange={(value) => setSolute(value as Solute)} />
        <Select label="Concentration (mol/dm³)" value={String(dilutions)}
          options={['1', '0.1', '0.01', '0.001'].map((text, index) => [String(index), text])}
          onChange={(value) => setDilutions(Number(value))} />
        <button type="button" class="jp-btn" disabled={dilutions === 3} onClick={() => setDilutions(dilutions + 1)}>Dilute × 10</button>
      </div>
      <div class="jp-try-scene">
        <svg viewBox="0 0 320 102" role="img" aria-label={'pH scale from 0 to 14. Marker at ' + pH}>
          <path d="M20 37h140" stroke="var(--bad)" stroke-width="5" />
          <path d="M160 37h140" stroke="var(--brand)" stroke-width="5" />
          <circle cx={marker} cy="37" r="8" fill="var(--bg)" stroke={colour} stroke-width="3" />
          <text x="17" y="57">0</text><text x="147" y="57">7</text><text x="289" y="57">14</text>
          {Array.from({ length: 12 - 3 * dilutions }, (_, index) => <circle key={index}
            cx={45 + 21 * index} cy="78" r="4" fill={colour} />)}
        </svg>
      </div>
      <Values items={{ 'pH': String(pH), 'pOH': String(14 - pH), [acid ? 'Acid indicator (litmus) · [H⁺]' : 'Base indicator (litmus) · [OH⁻]']: concentration + ' mol/dm³' }} />
    </>}
  </TryIt>
}
