import { useState } from 'preact/hooks'
import { ease, near, Scene, Slider, Travel, TryIt, Values } from './TryIt'
import type { InteractiveProps } from './TryItCard'

export function pulley(segments: number, load: number, lostPercent: number) {
  const efficiency = 100 - lostPercent
  const advantage = segments * efficiency / 100
  const effort = load / advantage
  return { effort, advantage, efficiency, rope: segments, workIn: effort * segments }
}

export default function Pulley(props: InteractiveProps) {
  const [segments, setSegments] = useState(2)
  const [load, setLoad] = useState(800)
  const [loss, setLoss] = useState(25)
  const { effort, advantage, efficiency, rope, workIn } = pulley(segments, load, loss)
  return <TryIt {...props} context="Builders can use a pulley to lift blocks on a site by pulling a longer length of rope."
    prediction={{ question: 'For the same load and friction loss, what happens to effort when more rope segments support the load?',
      choices: ['It gets smaller', 'It gets larger', 'It stays the same'], correct: 0, action: 'Raise the number of supporting segments from 2 to 4.',
      observed: segments === 4 && load === 800 && loss === 25, why: 'More rope segments share the load. You pull more rope for each metre raised.' }}
    missions={[
      { goal: 'Use VR 6 to lift an 800 N load with about 400 N effort. Read the efficiency.',
        reached: segments === 6 && load === 800 && near(effort, 400, 2), hint: 'Adjust lost energy and watch both the effort and efficiency.' },
      { goal: 'With VR 6 and an 800 N load, try 0% loss. Then set the loss to 25%.',
        baseline: segments === 6 && load === 800 && loss === 0, reached: segments === 6 && load === 800 && loss === 25,
        hint: 'Compare the work done by your pull with the energy gained by the load.',
        reason: { question: 'Why is a real pulley’s efficiency below 100%?', choices: ['Friction transfers some input energy to heat', 'Extra rope creates extra energy'], correct: 0 } },
      { goal: 'A pulley with VR 4 and 75% efficiency lifts a 600 N load. Model it and find the effort.',
        reached: segments === 4 && load === 600 && loss === 25, hint: 'Use efficiency and VR to find mechanical advantage first.',
        answer: { question: 'How much effort is needed?', choices: ['150 N', '200 N'], correct: 1 },
        trap: 'A pulley can reduce force by increasing pull distance. Friction makes the input work larger than the useful output.' },
    ]}
    explain={{ question: 'Why does an ideal pulley need a longer pull to lift the load with less force?',
      choices: ['The input force acts through a greater distance', 'The pulley removes some of the load’s weight'], correct: 0,
      feedback: ['The ideal pulley trades force for distance. The input and output work are equal.', 'The load weighs the same. The supporting segments share its weight.'] }}
    formulas={['MA = \\frac{load}{effort}', 'Efficiency = \\frac{MA}{VR} × 100%', 'Work = force × distance']}>
    {() => <>
      <Scene label="Supporting rope segments share the load. The bars compare rope pulled with load raised." height={132}>
        <path d="M24 13H163M35 88H155" stroke="var(--ink-2)" stroke-width="4" />
        {Array.from({ length: segments }, (_, i) => <path key={i} d={`M${39 + i * 22} 16V87`} stroke="var(--brand)" stroke-width="2" />)}
        {Array.from({ length: Math.floor(segments / 2) }, (_, i) => <circle key={i} cx={50 + 44 * i} cy="82" r="10"
          fill="var(--brand-soft)" stroke="var(--ink-2)" />)}
        <Travel points={[0, 0, 0, -22, 0, 0]} seconds={2.8}>
          <rect x="68" y="91" width="55" height="22" rx="4" fill="var(--memo-soft)" stroke="var(--memo)" />
          <text x="95" y="106" text-anchor="middle">{load} N</text>
        </Travel>
        <Travel points={[151, 30, 151, 30 + 9 * segments, 151, 30]} seconds={2.8}>
          <circle r="3" fill="var(--brand)" />
        </Travel>
        <text x="185" y="25">Rope pulled</text><path d={`M188 43h${rope * 18}`} {...ease({ d: `M188 43h${rope * 18}` })} stroke="var(--brand)" stroke-width="6" />
        <text x="185" y="72">Load raised</text><path d="M188 90h18" stroke="var(--memo)" stroke-width="6" />
      </Scene>
      <Values items={{ 'Effort': effort.toFixed(1) + ' N', 'MA': advantage.toFixed(2), 'VR': String(segments), 'Efficiency': efficiency.toFixed(1) + '%',
        'Rope pulled': rope + ' m', 'Load raised': '1 m', 'Input work': workIn.toFixed(0) + ' J', 'Useful work': load + ' J' }} />
      <div class="jp-try-sliders">
        <Slider info="Rope segments holding up the load. This number is the velocity ratio." label={'Supporting segments · ' + segments} value={segments} min={1} max={6} step={1} onChange={setSegments} />
        <Slider info="The weight being lifted, in newtons." label={'Load (N) · ' + load} value={load} min={200} max={1200} step={50} onChange={setLoad} />
        <Slider info="Energy lost to friction and moving parts. More loss means lower efficiency." label={'Friction loss (%) · ' + loss} value={loss} min={0} max={75} step={0.1} onChange={setLoss} />
      </div>
    </>}
  </TryIt>
}
