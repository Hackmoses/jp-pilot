import { useState } from 'preact/hooks'
import { near, Select, Slider, TryIt, Values } from './TryIt'
import type { InteractiveProps } from './TryItCard'

export const faradayConstant = 96500
const metals = {
  copper: { name: 'Copper (Cu²⁺)', molarMass: 63.5, electrons: 2 },
  silver: { name: 'Silver (Ag⁺)', molarMass: 108, electrons: 1 },
  aluminium: { name: 'Aluminium (Al³⁺)', molarMass: 27, electrons: 3 },
}
type Metal = keyof typeof metals

export function deposition(current: number, seconds: number, metal: Metal) {
  const charge = current * seconds
  const electronMoles = charge / faradayConstant
  const { molarMass, electrons } = metals[metal]
  return { charge, electronMoles, mass: (electronMoles / electrons) * molarMass }
}

export default function Electrolysis(props: InteractiveProps) {
  const [current, setCurrent] = useState(2)
  const [seconds, setSeconds] = useState(965)
  const [metal, setMetal] = useState<Metal>('copper')
  const { charge, electronMoles, mass } = deposition(current, seconds, metal)
  const thickness = 26 * mass / deposition(5, 1930, 'silver').mass
  const { molarMass, electrons } = metals[metal]

  return (
    <TryIt {...props} context="Think of a shiny plated tap sold at a Nigerian market. Electrolysis can deposit the thin metal coating."
      prediction={{ question: 'At the same current, what happens to deposited mass if you double the time?',
        choices: ['It doubles', 'It halves', 'It stays the same'], correct: 0,
        action: 'Keep copper at 2 A and double the starting time of 965 s.',
        observed: metal === 'copper' && current === 2 && seconds === 1930,
        why: 'Twice the time passes twice the charge, so twice as much copper is deposited.' }}
      missions={[
        { goal: 'Pass a charge of about 1,930 C.', reached: near(charge, 1930, 12), hint: 'Vary the time or the current. Charge is their product.' },
        { goal: 'At 2 A for 965 s, compare copper with silver. Leave silver selected and pick the reason.',
          baseline: metal === 'copper' && current === 2 && seconds === 965,
          reached: metal === 'silver' && current === 2 && seconds === 965, hint: 'Read the electrons needed per metal ion.',
          reason: { question: 'Why can the same charge deposit more silver ions?', choices: ['Each silver ion needs fewer electrons', 'The silver cell receives more charge'], correct: 0 } },
        { goal: 'A current of 5 A passes through molten aluminium electrolyte for 1,930 s. Set the cell to find the mass deposited.',
          reached: metal === 'aluminium' && current === 5 && seconds === 1930,
          hint: 'Calculate the electron amount first. Then use aluminium’s charge per ion.',
          answer: { question: 'What mass of aluminium is deposited?', choices: ['0.90 g', '2.70 g'], correct: 0 },
        trap: 'One mole of aluminium ions needs three moles of electrons.' },
      ]}
      explain={{ question: 'Why does the metal build up on the cathode?',
        choices: ['Positive metal ions gain electrons there', 'Positive metal ions lose electrons there'], correct: 0,
        feedback: ['Gaining electrons reduces the metal ions to neutral atoms.', 'Reduction takes place at the cathode. The metal ions gain electrons.'] }}
      formulas={['Q = It', 'n_{e} = \\frac{Q}{F}', 'm = \\frac{ItM}{zF}']}>
      {(unlocked) => <>
        <div class="jp-try-scene">
          <svg viewBox="0 0 320 114" role="img" aria-label="Electrolysis cell with the metal deposit shown in blue on the cathode">
            <path d="M70 50H250V100H70Z" fill="var(--brand-soft)" />
            <path d="M70 42V100H250V42 M112 45V16H151 M169 16H208V45 M151 7V25 M169 11V21"
              fill="none" stroke="var(--ink-2)" stroke-width="2" />
            <path d="M112 44V80 M208 44V80" fill="none" stroke="var(--ink)" stroke-width="8" />
            <rect x={204 - thickness / 2} y="50" width={8 + thickness} height="32" fill="var(--brand)" opacity={mass > 0 ? 1 : 0} />
            {unlocked && current > 0 && [57, 71, 85].map((y) => <circle key={y} r="3" class="jp-try-moving" fill="var(--memo)">
              <animateMotion key={current} {...{ path: `M125 ${y}L200 ${Math.min(y, 77)}` }} dur={4 / current + 's'} repeatCount="indefinite" />
            </circle>)}
            <text x="127" y="97">Metal ions →</text>
            <text x="79" y="39">Anode +</text>
            <text x="215" y="39">Cathode −</text>
          </svg>
        </div>
        <Select label="Metal ion" value={metal} options={Object.entries(metals).map(([key, item]) => [key, item.name])}
          onChange={(value) => setMetal(value as Metal)} />
        <div class="jp-try-sliders">
          <Slider label="Current (A)" value={current} min={0} max={5} step={0.1} onChange={setCurrent} />
          <Slider label="Time (s)" value={seconds} min={0} max={1930} step={5} onChange={setSeconds} />
        </div>
        <Values items={{ 'I': current.toFixed(1) + ' A', 't': seconds + ' s', 'Q': charge.toFixed(1) + ' C',
          'Electrons': electronMoles.toFixed(4) + ' mol', 'Mass': mass.toFixed(3) + ' g' }} />
        <p class="jp-mode-lead">F = 96,500 C/mol · M = {molarMass} g/mol · z = {electrons} electrons per ion</p>
      </>}
    </TryIt>
  )
}
