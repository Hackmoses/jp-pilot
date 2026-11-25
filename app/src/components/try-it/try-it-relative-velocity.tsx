import { useState } from 'preact/hooks'
import { ease, near, Scene, Select, Slider, Travel, TryIt, Values } from './TryIt'
import type { InteractiveProps } from './TryItCard'

export const relativeVelocity = (a: number, b: number, opposite: boolean) => (opposite ? -b : b) - a

export default function RelativeVelocity(props: InteractiveProps) {
  const [a, setA] = useState(100)
  const [b, setB] = useState(130)
  const [opposite, setOpposite] = useState(false)
  const [inA, setInA] = useState(false)
  const relative = relativeVelocity(a, b, opposite)
  const displayed = inA ? [0, relative] : [a, opposite ? -b : b]
  const initialSpeeds = a === 100 && b === 130
  return <TryIt {...props} aim="See how fast one moving car looks from another, going the same way or towards each other." context="From one moving danfo bus, the next bus on the expressway may look slow."
    prediction={{ question: 'Two cars travel the same way at 100 and 130 km/h. How fast does B look from A?',
      choices: ['230 km/h', '30 km/h', '130 km/h'], correct: 1, action: 'Keep the starting speeds and switch to “View from car A”.',
      observed: inA && initialSpeeds && !opposite, why: 'From A, subtract A’s velocity from both cars. B is 30 km/h faster.' }}
    missions={[
      { goal: 'Make the relative speed 30 km/h using different car speeds from the prediction.',
        reached: !initialSpeeds && near(Math.abs(relative), 30, 0.5), hint: 'For cars going the same way, compare the gap between their speeds.' },
      { goal: 'Set A to 100 and B to 130 km/h, same direction. Then switch B to the opposite direction.', baseline: initialSpeeds && !opposite,
        reached: initialSpeeds && opposite, hint: 'Take the rightward direction as positive.',
        reason: { question: 'Why is the relative speed now 230 km/h?', choices: ['B’s velocity is negative, so its speed adds to A’s in the magnitude', 'Opposite directions make both velocities positive'], correct: 0 } },
      { goal: 'A travels at 80 km/h and B at 50 km/h in the same direction. Model the view from A.',
        reached: a === 80 && b === 50 && !opposite && inA, hint: 'Compare B’s motion with A before deciding its sign.',
        answer: { question: 'What is B’s velocity relative to A, taking rightward as positive?', choices: ['+30 km/h', '−30 km/h'], correct: 1 },
        trap: 'Subtract signed velocities. Adding same-direction speeds gives the wrong relative speed.' },
    ]}
    explain={{ question: 'Why does A stand still when you view the road from A?',
      choices: ['A’s velocity relative to itself is zero', 'A’s ground speed becomes zero'], correct: 0,
      feedback: ['The reference frame moves with A. Subtract A’s ground velocity from every object.', 'Its ground speed is unchanged. Only the frame of reference changed.'] }}
    formulas={['v_{B/A} = v_{B} − v_{A}', 'Relative speed = |v_{B/A}|']}>
    {() => <>
      <Scene label={inA ? 'Car A stationary in its own frame and B moving relative to it' : 'Both cars seen from the road'}>
        <path d="M12 54H308" stroke="var(--option-line)" stroke-dasharray="7 4" />
        {displayed.map((v, i) => {
          const direction = Math.sign(v)
          const moves = v !== 0
          const colour = i ? 'var(--memo)' : 'var(--brand)'
          const car = <>
            <rect x="139" y="12" width="42" height="21" rx="5" fill="var(--bg)" stroke={colour} />
            <path d="M146 33v4m28-4v4" stroke="var(--ink-2)" stroke-width="4" />
            <text x="160" y="27" text-anchor="middle">{i ? 'B' : 'A'}</text>
          </>
          return <g key={i} transform={`translate(0 ${i * 50})`}>
            {moves ? <Travel points={[-direction * 52, 0, direction * 52, 0]} seconds={170 / Math.abs(v)}>{car}</Travel> : car}
            <path transform={`translate(160 46) scale(${direction || 1} 1)`}
              d={`M0 0h${16 + Math.abs(v) * 0.31}m-6-4 6 4-6 4`}
              {...ease({ d: `M0 0h${16 + Math.abs(v) * 0.31}m-6-4 6 4-6 4`, opacity: Number(moves) })}
              opacity={Number(moves)} fill="none" stroke={colour} stroke-width="2" />
          </g>
        })}
      </Scene>
      <Values items={{ 'A in this view': displayed[0] + ' km/h', 'B in this view': displayed[1] + ' km/h',
        'B relative to A': relative + ' km/h', 'Relative speed': Math.abs(relative) + ' km/h' }} />
      <div class="jp-try-sliders">
        <Select info="Whether car B moves the same way as car A or towards it." label="Direction of B" value={opposite ? 'opposite' : 'same'} options={ [['same', 'Same'], ['opposite', 'Opposite']] } onChange={(value) => setOpposite(value === 'opposite')} />
        <button type="button" class={'jp-btn ' + (inA ? 'jp-btn--primary' : '')} aria-pressed={inA} onClick={() => setInA(!inA)}>View from car A</button>
      </div>
      <div class="jp-try-sliders">
        <Slider info="How fast car A is moving." label={'Car A speed (km/h) · ' + a} value={a} min={0} max={150} step={5} onChange={setA} />
        <Slider info="How fast car B is moving." label={'Car B speed (km/h) · ' + b} value={b} min={0} max={150} step={5} onChange={setB} />
      </div>
    </>}
  </TryIt>
}
