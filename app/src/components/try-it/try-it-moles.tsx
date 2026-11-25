import { useState } from 'preact/hooks'
import { ease, near, Select, Travel, TryIt, Values } from './TryIt'
import type { InteractiveProps } from './TryItCard'

const substances = { Na: 23, 'H₂O': 18, 'CO₂': 44, 'CaCO₃': 100, 'O₂': 32 }
type Substance = keyof typeof substances

export function moleBridge(substance: Substance, mass: number) {
  const moles = mass / substances[substance]
  const gas = substance === 'O₂' || substance === 'CO₂'
  return { moles, particles: moles * 6.02e23, volume: gas ? moles * 22.4 : null }
}

export const moleTarget = (substance: Substance, mass: number, target: number) => substance === 'Na' && near(moleBridge(substance, mass).moles, target, 0.002)

export default function MoleBridge(props: InteractiveProps) {
  const [substance, setSubstance] = useState<Substance>('Na')
  const [input, setInput] = useState('2.3')
  const mass = input === '' ? NaN : Number(input)
  const valid = Number.isFinite(mass) && mass >= 0 && mass <= 1000
  const { moles, particles, volume } = moleBridge(substance, mass)
  const bead = 2 + (valid ? Math.min(6, 3 * Math.sqrt(moles)) : 0)
  return <TryIt {...props} aim="Turn a mass into moles and particles, and see why equal moles hold equal numbers of particles." context="The carbon dioxide in generator exhaust has mass and contains molecules."
    prediction={{ question: 'Twice the mass of the same substance gives how many moles?', choices: ['Twice the moles', 'Half', 'The same'],
      correct: 0, why: 'The molar mass stays fixed, so twice the mass gives twice the amount.',
      action: 'Keep Na selected and double the starting mass of 2.3 g.', observed: substance === 'Na' && near(mass, 4.6) }}
    missions={[
      { goal: 'Make 0.30 mol of sodium.', reached: moleTarget(substance, mass, 0.3), hint: 'Use sodium’s molar mass to work backwards from moles to grams.' },
      { goal: 'Compare 11 g and 22 g of CO₂. Leave the mass at 22 g and pick the reason.',
        baseline: substance === 'CO₂' && near(mass, 11, 0.05), reached: substance === 'CO₂' && near(mass, 22, 0.05), hint: 'Check the factor between the two masses and what stays fixed.',
        reason: { question: 'Why did the particle count double?', choices: ['There are twice as many moles', 'Each mole contains more particles'], correct: 0 } },
      { goal: 'At s.t.p., what mass of oxygen occupies 11.2 dm³? Set the oxygen mass to find out.',
        reached: substance === 'O₂' && near(volume ?? NaN, 11.2, 0.05), hint: 'Work back from the gas volume to the amount in moles.',
        trap: '22.4 dm³ is the volume per mole of gas at s.t.p. It does not apply to solids or liquids.' },
    ]}
    explain={{ question: 'Why do equal moles of Na and water contain equal numbers of particles?',
      choices: ['Each mole contains the same number of particles', 'Sodium and water have equal molar masses'], correct: 0,
      feedback: ['One mole always has 6.02 × 10²³ entities, here atoms or molecules.', 'Their molar masses differ. A mole is a fixed count of entities.'] }}
    formulas={['n = \\frac{m}{M}', 'N = n × 6.02 × 10^{23}', 'V = n × 22.4 dm^{3} (gas at s.t.p.)']}>
    {() => <>
      <Select info="Choose a substance. Each one has its own molar mass." label="Substance" value={substance} options={Object.keys(substances).map((name) => [name, name])}
        onChange={(value) => setSubstance(value as Substance)} />
      <label class="jp-try-select">Mass (g)
        <input class="jp-btn" type="number" min="0" max="1000" step="any" value={input} onInput={(event) => setInput(event.currentTarget.value)} />
      </label>
      <div class="jp-try-scene">
        <svg viewBox="0 0 320 94" role="img" aria-label="Divide grams by molar mass to get moles, then multiply by Avogadro’s constant for particles or by 22.4 for gas volume.">
          <path d="M49 47h85m-5-4 5 4-5 4M185 47l47-26m-7 0h7l-3 6" fill="none" stroke="var(--brand)" />
          {volume !== null && <path d="M185 47l47 27m-7 0h7l-3-6" fill="none" stroke="var(--brand)" />}
          <Travel points={[51, 47, 133, 47]} seconds={1.5}><circle r="3" fill="var(--brand)" /></Travel>
          <Travel points={[185, 47, 232, 21]} seconds={1.5} offset={0.4}><circle r={bead} {...ease({ r: bead })} fill="var(--memo)" /></Travel>
          {volume !== null && <Travel points={[185, 47, 232, 74]} seconds={1.5} offset={0.4}><circle r={bead} {...ease({ r: bead })} fill="var(--memo)" /></Travel>}
          <text x="10" y="51">Mass</text><text x="66" y="42">÷ {substances[substance]}</text><text x="141" y="51">Moles</text>
          <text x="202" y="16">× 6.02 × 10²³</text><text x="244" y="33">Particles</text>
          {volume !== null && <><text x="187" y="81">× 22.4</text><text x="244" y="75">Gas volume</text></>}
        </svg>
      </div>
      <Values items={{ 'Mass': valid ? mass + ' g' : 'Enter 0–1000 g', 'Amount': valid ? +moles.toPrecision(5) + ' mol' : '—',
        'Particles': valid ? particles.toExponential(2).replace(/e\+?(.*)/, ' × 10^{$1}') : '—',
        'Gas volume at s.t.p.': volume === null ? 'Gas only' : valid ? +volume.toPrecision(5) + ' dm³' : '—' }} />
    </>}
  </TryIt>
}
