import { useState } from 'preact/hooks'
import { Slider, TryIt } from './TryIt'
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

export default function Electrolysis({ practiceHref }: InteractiveProps) {
  const [current, setCurrent] = useState(2)
  const [seconds, setSeconds] = useState(965)
  const [metal, setMetal] = useState<Metal>('copper')
  const { charge, electronMoles, mass } = deposition(current, seconds, metal)
  const thickness = 26 * mass / deposition(5, 1930, 'silver').mass
  const { molarMass, electrons } = metals[metal]

  return (
    <TryIt practiceHref={practiceHref}
      prediction="If you double the time, the mass deposited will:"
      choices={['Double', 'Halve', 'Stay the same']} correct={0}
      explanation="At constant current, doubling the time doubles the charge and the mass deposited. The mass also depends on the metal’s molar mass M and the number z of electrons needed per ion. This model assumes all the charge deposits metal and uses a molten electrolyte for aluminium."
      formulas={['Q = It', 'n_{e} = \\frac{Q}{F}', 'm = \\frac{ItM}{zF}']}>
      {(_, tried) => <>
        <div class="jp-try-scene">
          <svg viewBox="0 0 320 114" role="img" aria-label="Electrolysis cell with the metal deposit shown in blue on the cathode">
            <path d="M70 50H250V100H70Z" fill="var(--brand-soft)" />
            <path d="M70 42V100H250V42 M112 45V16H151 M169 16H208V45 M151 7V25 M169 11V21"
              fill="none" stroke="var(--ink-2)" stroke-width="2" />
            <path d="M112 44V80 M208 44V80" fill="none" stroke="var(--ink)" stroke-width="8" />
            <rect x={204 - thickness / 2} y="50" width={8 + thickness} height="32" fill="var(--brand)" opacity={mass > 0 ? 1 : 0} />
            <text x="79" y="39">Anode +</text>
            <text x="215" y="39">Cathode −</text>
          </svg>
        </div>
        <label class="jp-try-select">
          Metal
          <select class="jp-btn" value={metal} onChange={(event) => {
            setMetal(event.currentTarget.value as Metal)
            tried()
          }}>
            {Object.entries(metals).map(([key, entry]) => <option key={key} value={key}>{entry.name}</option>)}
          </select>
        </label>
        <div class="jp-try-sliders">
          <Slider label={'Current (A) · ' + current.toFixed(1)} value={current} min={0} max={5} step={0.1} onChange={(next) => {
            setCurrent(next)
            tried()
          }} />
          <Slider label={'Time (s) · ' + seconds} value={seconds} min={0} max={1930} step={5} onChange={(next) => {
            setSeconds(next)
            tried()
          }} />
        </div>
        <p class="jp-try-values">Q = {charge.toFixed(1)} C · Electrons = {electronMoles.toFixed(4)} mol · Mass = {mass.toFixed(3)} g</p>
        <p class="jp-mode-lead">F = 96,500 C/mol · M = {molarMass} g/mol · z = {electrons}</p>
      </>}
    </TryIt>
  )
}
