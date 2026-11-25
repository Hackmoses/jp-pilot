import { useState } from 'preact/hooks'
import { near, Select, Slider, TryIt, Values } from './TryIt'
import type { InteractiveProps } from './TryItCard'

type Layout = 'series' | 'parallel'
export function circuit(resistors: number[], layout: Layout, emf: number, internal: number) {
  const total = layout === 'series' ? resistors.reduce((sum, r) => sum + r, 0)
    : 1 / resistors.reduce((sum, r) => sum + 1 / r, 0)
  const current = emf / (total + internal)
  return { total, current, terminal: current * total }
}
export const circuitTarget = (current: number, target: number) => near(current, target, 0.06)

export default function CircuitLab(props: InteractiveProps) {
  const [resistors, setResistors] = useState([4, 4, 4])
  const [count, setCount] = useState(2)
  const [layout, setLayout] = useState<Layout>('series')
  const [emf, setEmf] = useState(8)
  const [internal, setInternal] = useState(0)
  const parallel = layout === 'parallel'
  const { total, current, terminal } = circuit(resistors.slice(0, count), layout, emf, internal)
  const paired = count === 2 && resistors[0] === 4 && resistors[1] === 4 && emf === 8
  return <TryIt {...props} context="House lights on the NEPA supply are wired in parallel so each can work on its own."
    prediction={{ question: 'Switch two 4 Ω resistors from series to parallel. What happens to total resistance?',
      choices: ['It falls', 'It rises', 'It stays the same'], correct: 0,
      action: 'Keep the two 4 Ω resistors and switch to parallel.',
      observed: paired && parallel, why: 'Two paths give the charge more ways to flow. The total falls from 8 Ω to 2 Ω.' }}
    missions={[
      { goal: 'Get a current of 2 A.', reached: circuitTarget(current, 2), hint: 'Current depends on both the e.m.f. and the resistance of the whole circuit.' },
      { goal: 'Use two 4 Ω resistors in parallel and 8 V. Compare internal resistances of 0 Ω and 2 Ω.',
        baseline: paired && parallel && internal === 0, reached: paired && parallel && internal === 2, hint: 'Some of the e.m.f. is used inside the cell.',
        reason: { question: 'Why did the terminal voltage fall?', choices: ['There is a voltage drop inside the cell', 'The parallel resistors doubled in value'], correct: 0 } },
      { goal: 'Three 4 Ω resistors are in parallel across an ideal 16 V battery. Set up the circuit to find the total current.',
        reached: count === 3 && resistors.every((r) => r === 4) && parallel && emf === 16 && !internal && circuitTarget(current, 12),
        hint: 'Each branch gets the same voltage. Combine the branch currents.',
        answer: { question: 'What is the total current?', choices: ['1.33 A', '12 A'], correct: 1 },
        trap: 'Adding the three resistances directly would use the series rule.' },
    ]}
    explain={{ question: 'Why can a parallel combination have less resistance than either branch?',
      choices: ['The battery increases its e.m.f.', 'More paths raise the total current at the same voltage'], correct: 1,
      feedback: ['The same battery supplies the same e.m.f. Look at the extra path.', 'With more current for the same voltage, the equivalent resistance falls.'] }}
    formulas={[parallel ? '\\frac{1}{R} = \\frac{1}{R_{1}} + \\frac{1}{R_{2}} + …' : 'R = R_{1} + R_{2} + …',
      'I = \\frac{ε}{R + r}', 'V = ε − Ir']}>
    {() => <>
      <div class="jp-try-sliders">
        <Select label="Layout" value={layout} options={ [['series', 'Series'], ['parallel', 'Parallel']] } onChange={(value) => setLayout(value as Layout)} />
        <Select label="Resistors" value={String(count)} options={ [['1', '1'], ['2', '2'], ['3', '3']] } onChange={(value) => setCount(Number(value))} />
      </div>
      <div class="jp-try-scene">
        <svg viewBox="0 0 320 145" role="img" aria-label={'Circuit in ' + layout + '. Dots represent moving electrons.'}>
          <path d="M150 22H28V124H292V22H171M150 15v14m21-20v26" fill="none" stroke="var(--ink-2)" stroke-width="2" />
          <text x="179" y="17">+</text><text x="139" y="17">−</text>
          {resistors.slice(0, count).map((r, index) => {
            const x = parallel ? 135 : 48 + index * 87
            const y = parallel ? 124 - index * 34 : 124
            return <g key={index}>
              {parallel && <path d={`M28 ${y}H292`} stroke="var(--ink-2)" />}
              <rect x={x} y={y - 11} width="50" height="22" rx="3" fill="var(--brand-soft)" stroke="var(--brand)" />
              <text x={x + 25} y={y + 4} text-anchor="middle">{r} Ω</text>
            </g>
          })}
          {current > 0 && [0, 1, 2].map((dot) => <circle key={dot} class="jp-try-moving" r="3" fill="var(--brand)">
            <animateMotion {...{ path: "M150 22H28V124H292V22H171" }} dur={Math.max(0.7, 9 / current) + 's'}
              key={current} begin={-dot * Math.max(0.7, 9 / current) / 3 + 's'} repeatCount="indefinite" />
          </circle>)}
        </svg>
      </div>
      <Values items={{ 'External R': total.toFixed(2) + ' Ω', 'Current': current.toFixed(2) + ' A', 'Terminal voltage': terminal.toFixed(2) + ' V' }} />
      <div class="jp-try-sliders">
        {resistors.slice(0, count).map((r, index) => <Slider key={index} label={`Resistor ${index + 1} (Ω)`} value={r} min={1} max={12} step={1}
          onChange={(next) => setResistors(resistors.map((old, i) => i === index ? next : old))} />)}
        <Slider label={'Cell e.m.f. (V) · ' + emf} value={emf} min={0} max={20} step={1} onChange={setEmf} />
        <Slider label={'Internal resistance (Ω) · ' + internal} value={internal} min={0} max={5} step={0.5} onChange={setInternal} />
      </div>
    </>}
  </TryIt>
}
