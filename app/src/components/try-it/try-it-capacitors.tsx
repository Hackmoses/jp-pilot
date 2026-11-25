import { useState } from 'preact/hooks'
import { ease, near, Scene, Select, Slider, Travel, TryIt, Values } from './TryIt'
import type { InteractiveProps } from './TryItCard'

export function capacitance(parts: number[], parallel: boolean, voltage: number) {
  const total = parallel ? parts.reduce((sum, c) => sum + c, 0) : 1 / parts.reduce((sum, c) => sum + 1 / c, 0)
  return { total, charge: total * voltage, energy: total * voltage ** 2 / 2e6 }
}
export const capacitanceTarget = (total: number) => near(total, 14, 0.1)

export default function Capacitors(props: InteractiveProps) {
  const [parts, setParts] = useState([2, 4, 8])
  const [count, setCount] = useState(2)
  const [parallel, setParallel] = useState(false)
  const [voltage, setVoltage] = useState(3)
  const shown = parts.slice(0, count)
  const { total, charge, energy } = capacitance(shown, parallel, voltage)
  const examParts = count === 3 && parts.every((part, index) => part === 2 ** (index + 1))
  return <TryIt {...props} context="A ceiling fan uses a capacitor to help start its motor and keep it turning."
    prediction={{ question: 'When two capacitors are connected in parallel, how does the total compare with either one alone?',
      choices: ['It is bigger', 'It is smaller', 'It is the same'], correct: 0, action: 'Change the two starting capacitors from series to parallel.',
      observed: parallel && count === 2 && parts[0] === 2 && parts[1] === 4, why: 'Each capacitor adds charge at the same voltage, so the total capacitance increases.' }}
    missions={[
      { goal: 'Make the total capacitance 14 μF.', reached: capacitanceTarget(total), hint: 'Try adding capacitances directly using one of the two layouts.' },
      { goal: 'Set 2, 4 and 8 μF in parallel. Then switch the same three to series.', baseline: examParts && parallel,
        reached: examParts && !parallel, hint: 'Compare the voltage across the whole chain with the voltage across one capacitor.',
        reason: { question: 'Why does series give a smaller total capacitance?', choices: ['The same charge corresponds to the sum of the voltage drops', 'All three capacitance values add directly'], correct: 0 } },
      { goal: 'Three capacitors of 2, 4 and 8 μF are in parallel at 6 V. Find their total stored energy.',
        reached: examParts && parallel && voltage === 6, hint: 'Convert microfarads to farads before multiplying by half the voltage squared.',
        answer: { question: 'How much energy is stored?', choices: ['2.52 × 10^{-4} J', '8.4 × 10^{-5} J'], correct: 0 },
        trap: 'Capacitances add in parallel. In series, add their reciprocals. Resistors follow the opposite rules.' },
    ]}
    explain={{ question: 'Why does doubling voltage quadruple the stored energy for the same capacitor?',
      choices: ['The energy depends on voltage squared', 'The capacitance quadruples'], correct: 0,
      feedback: ['The capacitance stays fixed. Twice the voltage makes V² four times as large.', 'Voltage changes the charge and energy. The capacitance is fixed in this model.'] }}
    formulas={[parallel ? 'C = C_{1} + C_{2} + …' : '\\frac{1}{C} = \\frac{1}{C_{1}} + \\frac{1}{C_{2}} + …',
      'Q = CV', 'E = \\frac{1}{2}CV^{2}']}>
    {() => <>
      <Scene label="Capacitor plates with opposite charges. The wires show the selected layout." height={124}>
        {parallel && <path d="M22 15V100M298 15V100" stroke="var(--ink-2)" />}
        {shown.map((part, i) => {
          const x = parallel ? 160 : (i + 0.5) * 320 / count
          const y = parallel ? 23 + 34 * i : 55
          const signs = Math.min(4, Math.ceil((parallel ? part * voltage : charge) / 15))
          return <g key={i} transform={`translate(${x} ${y})`} {...ease({ transform: `translate(${x} ${y})` })}>
            <path d={parallel ? 'M-138 0H-7M7 0H138' : `M-${160 / count} 0H-7M7 0H${160 / count}`} stroke="var(--ink-2)" />
            <path d="M-7-11V11M7-11V11" stroke="var(--brand)" stroke-width="3" />
            <text x="0" y="24" text-anchor="middle">{part} μF</text>
            <text x="-13" y="-5" text-anchor="end" style={{ fill: 'var(--bad)' }}>{'+'.repeat(signs)}</text>
            <text x="13" y="-5" style={{ fill: 'var(--memo)' }}>{'−'.repeat(signs)}</text>
            {voltage > 0 && <Travel points={[-7, -10, -7, 10, -7, -10]} seconds={7 / voltage}>
              <circle r="2" fill="var(--bad)" />
            </Travel>}
          </g>
        })}
      </Scene>
      <Values items={{ 'Total': total.toFixed(2) + ' μF', 'Charge': charge.toFixed(1) + ' μC', 'Energy': energy === 0 ? '0 J' : energy.toExponential(2).replace(/e(-?)(\d+)/, ' × 10^{$1$2}') + ' J' }} />
      <div class="jp-try-sliders">
        <Select label="Layout" value={parallel ? 'parallel' : 'series'} options={ [['series', 'Series'], ['parallel', 'Parallel']] } onChange={(value) => setParallel(value === 'parallel')} />
        <Select label="Capacitors" value={String(count)} options={ [['1', '1'], ['2', '2'], ['3', '3']] } onChange={(value) => setCount(Number(value))} />
      </div>
      <div class="jp-try-sliders">
        {shown.map((part, i) => <Slider key={i} label={`C${i + 1} (μF) · ${part}`} value={part} min={1} max={10} step={0.1}
          onChange={(value) => setParts(parts.map((old, j) => i === j ? value : old))} />)}
        <Slider label={'Voltage (V) · ' + voltage} value={voltage} min={0} max={12} step={0.5} onChange={setVoltage} />
      </div>
    </>}
  </TryIt>
}
