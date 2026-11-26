import { useState } from 'preact/hooks'
import { ease, near, Scene, Select, Slider, Travel, TryIt, Values } from './TryIt'
import type { InteractiveProps } from './TryItCard'

const powers = [-2, -1, -0.5, -0.25, 0.25, 0.5, 2, 3]
const labels = ['−2', '−1', '−½', '−¼', '¼', '½', '2', '3']
const frac = (a: number, b: number) => b === 1 ? String(a) : `\\frac{${a}}{${b}}`
export const indexValue = (numerator: number, denominator: number, power: number) => (numerator / denominator) ** power
function format(value: number) {
  for (let denominator = 1; denominator <= 81; denominator++) {
    const numerator = Math.round(value * denominator)
    if (near(value, numerator / denominator, 1e-10)) return frac(numerator, denominator)
  }
  return value.toFixed(4)
}

export default function Indices(props: InteractiveProps) {
  const [integer, setInteger] = useState(4)
  const [base, setBase] = useState('integer')
  const [index, setIndex] = useState(6)
  const [numerator, denominator] = base === 'ratio' ? [16, 81] : base === 'reciprocal' ? [81, 16] : [integer, 1]
  const power = powers[index]
  const result = indexValue(numerator, denominator, power)
  const flipped = power < 0
  const root = Math.abs(power) < 1
  const workingBase = flipped ? frac(denominator, numerator) : frac(numerator, denominator)
  const simpleFour = base === 'integer' && integer === 4
  const radius = 4 + Math.min(7, Math.sqrt(result) * 2)
  const solved = base === 'reciprocal' && power === -0.25
  return <TryIt {...props} aim="Find out what a negative or a fractional index does to a number." context="Indices show up in JAMB. Use the steps to see what each part of an index does."
    prediction={{ question: 'What is 4^{−\\frac{1}{2}}?', choices: ['−2', '\\frac{1}{2}', '2'], correct: 1,
      action: 'Keep the base at 4 and set the power to −½.', observed: simpleFour && power === -0.5,
      why: 'Take the square root and then its reciprocal. The result is positive.' }}
    missions={[
      { goal: 'Make \\frac{2}{3} using the base \\frac{16}{81}.', reached: base === 'ratio' && near(result, 2 / 3),
        hint: 'Try a root that turns both 16 and 81 into whole numbers.' },
      { goal: 'Compare powers ½ and −½ for the base 4. Leave −½ selected.',
        baseline: simpleFour && power === 0.5, reached: simpleFour && power === -0.5,
        hint: 'Watch what happens to the numerator and denominator.',
        reason: { question: 'Why is the answer still positive?', choices: ['A negative index takes a reciprocal', 'A negative index makes the base negative'], correct: 0 } },
      { goal: 'Evaluate (\\frac{81}{16})^{−\\frac{1}{4}} × 2^{−1}. Set the first factor and use the reciprocal rule on the second.',
        reached: solved, hint: 'Treat the two factors separately before multiplying.',
        answer: { question: 'What is the product?', choices: ['\\frac{1}{3}', '\\frac{4}{3}'], correct: 0 },
        trap: 'A negative index takes the reciprocal. A fractional index uses a root, so apply both rules to the first factor.' },
    ]}
    explain={{ question: 'Why is the fourth root of a positive fraction the fourth root of its top divided by the fourth root of its bottom?',
      choices: ['Raising that quotient to the fourth power gives the starting fraction', 'The fourth root divides both terms by four'], correct: 0,
      feedback: ['The fourth power acts on both terms. It undoes each fourth root.', 'A root undoes a power. For example, the fourth root of 81 is 3.'] }}
    formulas={[
      `(${frac(numerator, denominator)})^{${labels[index]}} = (${workingBase})^{${labels[index].replace('−', '')}}`,
      root ? `Take the ${Math.abs(power) === 0.5 ? 'square' : 'fourth'} root of ${workingBase} = ${format(result)}`
        : `Raise ${workingBase} to power ${Math.abs(power)} = ${format(result)}`,
    ]}>
    {() => <>
      <Scene label="Steps for evaluating the chosen index" height={75}>
        <path d="M12 36h296" stroke="var(--option-line)" />
        <Travel points={[40, 25, 120, 25, 200, 25, 280, 25]} seconds={2.7}><circle r="3" fill="var(--memo)" /></Travel>
        {['Base', flipped ? 'Reciprocal' : 'Keep base', root ? 'Take root' : 'Multiply', 'Result'].map((step, i) => <g key={i}>
          <circle cx={40 + i * 80} cy="36" r={i === 3 ? radius : 5} {...ease({ r: i === 3 ? radius : 5 })} fill={i === 1 && flipped ? 'var(--memo)' : 'var(--brand)'} />
          <text x={40 + i * 80} y="60" text-anchor="middle">{step}</text>
        </g>)}
      </Scene>
      <Values items={{ 'Base': frac(numerator, denominator), 'Power': labels[index], 'Working base': workingBase, 'Value': format(result) }} />
      <Select info="Choose the kind of number to raise to a power." label="Base type" value={base} options={ [['integer', 'Whole number'], ['ratio', '\\frac{16}{81}'], ['reciprocal', '\\frac{81}{16}']] } onChange={setBase} />
      {base === 'integer' && <Slider info="The number that is multiplied by itself." label={'Base · ' + integer} value={integer} min={2} max={10} step={1} onChange={setInteger} />}
      <Slider info="The index. It tells you how many times the base is used." label={'Power · ' + labels[index]} value={index} valueText={labels[index]} min={0} max={powers.length - 1} step={1} onChange={setIndex} />
    </>}
  </TryIt>
}
