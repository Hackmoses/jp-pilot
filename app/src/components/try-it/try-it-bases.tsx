import { useState } from 'preact/hooks'
import { Select, TryIt, Values } from './TryIt'
import type { InteractiveProps } from './TryItCard'

export function placeValues(base: number, digits: readonly number[]) {
  return digits.map((digit, index) => digit * base ** (digits.length - 1 - index))
}
export function toDecimal(base: number, digits: readonly number[]) {
  return placeValues(base, digits).reduce((sum, value) => sum + value, 0)
}
const options = (min: number, max: number) => Array.from({ length: max - min + 1 }, (_, index) => {
  const value = String(min + index)
  return [value, value] as const
})
const places = ['Left digit', 'Middle digit', 'Right digit']

export default function NumberBases(props: InteractiveProps) {
  const [base, setBase] = useState(2)
  const [digits, setDigits] = useState([0, 0, 1])
  const [left, middle, right] = digits
  const values = placeValues(base, digits)
  const sum = toDecimal(base, digits)
  return <TryIt {...props} context="Counting pads of exercise books in groups of ten uses the same place-value idea as counting in groups of two."
    prediction={{ question: 'In base two, what is the value of a 1 two places left of the units digit?',
      choices: ['2', '4', '10'], correct: 1, why: 'Each move to the left multiplies the place value by two.',
      action: 'Keep base 2 and make 100₂ to check the left place.', observed: base === 2 && sum === 4 }}
    missions={[
      { goal: 'Make 5 in base ten using three binary digits.', reached: base === 2 && sum === 5, hint: 'Build five out of the powers of two shown below.' },
      { goal: 'Compare 101 in base 2 and base 3. Leave it in base 3.', baseline: base === 2 && sum === 5, reached: base === 3 && left === 1 && middle === 0 && right === 1,
        hint: 'The same digits can have different values in different bases.',
        reason: { question: 'Why did the total rise?', choices: ['The digit 1 got bigger', 'The left place changed from 2² to 3²'], correct: 1 } },
      { goal: 'Which base-eight numeral equals 511₉? Use the converter to enter its three digits.',
        reached: base === 8 && sum === 415, hint: 'Find the base-ten total of 511₉ first, then build it with powers of eight.',
        trap: '511₉ and 511₁₀ use the same digits but have different place values.' },
    ]}
    explain={{ question: 'Why does the right-hand place always have a weight of one?',
      choices: ['Its exponent is zero', 'Its digit must be one'], correct: 0,
      feedback: ['Any allowed base raised to zero equals one.', 'Any allowed digit can go there. Its place has weight one because the exponent is zero.'] }}
    formulas={[`${left} × ${base}^{2} + ${middle} × ${base}^{1} + ${right} × ${base}^{0} = ${sum}_{10}`]}>
    {() => <>
      <Select label="Base" value={String(base)} options={options(2, 10)} onChange={(value) => {
        const next = Number(value)
        setBase(next)
        setDigits(digits.map((digit) => Math.min(digit, next - 1)))
      }} />
      <div class="jp-try-sliders">
        {digits.map((digit, index) => <Select key={places[index]} label={places[index]} value={String(digit)} options={options(0, base - 1)}
          onChange={(value) => setDigits(digits.map((current, place) => place === index ? Number(value) : current))} />)}
      </div>
      <div class="jp-try-scene">
        <svg viewBox="0 0 320 104" role="img" aria-label="Three place-value columns for the digits and their contributions">
          {digits.map((digit, index) => {
            const x = 60 + index * 100
            return <g key={index} text-anchor="middle">
              <rect x={x - 41} y="13" width="82" height="78" rx="8" fill="none" stroke="var(--brand)" />
              <text x={x} y="37">{digit} × {base ** (2 - index)}</text>
              <text x={x} y="65">{values[index]}</text>
            </g>
          })}
        </svg>
      </div>
      <Values items={{ [`Base ${base}:`]: digits.join(''), 'Base ten:': String(sum) }} />
    </>}
  </TryIt>
}
