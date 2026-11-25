import { useEffect, useState } from 'preact/hooks'
import { near, Scene, Slider, TryIt, Values } from './TryIt'
import type { InteractiveProps } from './TryItCard'

const g = 10
export function falling(t: number, terminal = Infinity) {
  if (terminal === Infinity) return { distance: g * t * t / 2, speed: g * t }
  const speed = -terminal * Math.expm1(-g * t / terminal)
  return { distance: terminal * (t - speed / g), speed }
}
export function arrival(height: number, terminal = Infinity) {
  if (terminal === Infinity) return Math.sqrt(2 * height / g)
  let lo = 0
  let hi = height / terminal + terminal / g
  for (let i = 0; i < 26; i++) {
    const mid = (lo + hi) / 2
    if (falling(mid, terminal).distance < height) lo = mid
    else hi = mid
  }
  return hi
}

export default function FreeFall(props: InteractiveProps) {
  const [height, setHeight] = useState(10)
  const [air, setAir] = useState(true)
  const [time, setTime] = useState(0)
  const [run, setRun] = useState(0)
  const stoneT = air ? 22 : Infinity
  const featherT = air ? 3 : Infinity
  const stoneLanding = arrival(height, stoneT)
  const featherLanding = arrival(height, featherT)
  const stone = falling(Math.min(time, stoneLanding), stoneT)
  const feather = falling(Math.min(time, featherLanding), featherT)
  const landed = time >= featherLanding

  useEffect(() => {
    if (!run) return
    const start = performance.now()
    const ticker = window.setInterval(() => {
      const elapsed = (performance.now() - start) / 1000
      setTime(Math.min(elapsed, featherLanding))
      if (elapsed >= featherLanding) window.clearInterval(ticker)
    }, 70)
    return () => window.clearInterval(ticker)
  }, [run, featherLanding])

  function reset() {
    setRun(0)
    setTime(0)
  }

  return <TryIt {...props} context="A mango and a leaf can fall from the same tree. In air the leaf usually arrives later."
    prediction={{ question: 'Without air, when does the heavier object land if both start from the same height?',
      choices: ['First', 'At the same time', 'Last'], correct: 1, action: 'Turn air resistance off and press Drop. Watch both objects land.',
      observed: !air && landed, why: 'Gravity gives both objects the same acceleration when drag is absent.' }}
    missions={[
      { goal: 'From a new height, make both objects land together.', reached: height !== 10 && landed && near(stoneLanding, featherLanding, 0.02),
        hint: 'Compare the forces in the two settings.' },
      { goal: 'Drop both from 10 m without air. Turn air resistance on and drop them again.',
        baseline: !air && height === 10 && landed, reached: air && height === 10 && landed, hint: 'Compare drag with each object’s weight.',
        reason: { question: 'Why does the feather take longer in air?', choices: ['Drag has a greater effect compared with the feather’s weight', 'Gravity stops pulling on the feather'], correct: 0 } },
      { goal: 'Release a stone from rest at 20 m without air. Use g = 10 m/s² to find its time to the ground.',
        reached: !air && height === 20 && landed, hint: 'Use the distance fallen from rest under constant acceleration.',
        answer: { question: 'How long does the stone fall?', choices: ['2 s', '4 s'], correct: 0 },
        trap: 'In a vacuum, both masses have the same g. Distance from rest depends on time squared.' },
    ]}
    explain={{ question: 'Why do the two speeds match at every instant in a vacuum?',
      choices: ['They start from rest and gain the same speed each second', 'Objects with different masses have equal weights'], correct: 0,
      feedback: ['Both gain 10 m/s each second in this model, so their speeds stay equal.', 'Their weights differ. Their acceleration due to gravity is the same.'] }}
    formulas={['Without air: v = gt', 's = \\frac{1}{2}gt^{2}', air ? 'Air on: simplified drag model' : 'g = 10 m/s^{2}']}>
    {() => <>
      <Scene label="Stone and feather dropping in two lanes">
        <path d="M24 92H296M160 10V92" stroke="var(--option-line)" />
        <text x="62" y="106">Stone</text><text x="221" y="106">Feather</text>
        <circle cx="77" cy={14 + 70 * Math.min(1, stone.distance / height)} r="7" fill="var(--ink-2)" />
        <path transform={`translate(238 ${14 + 70 * Math.min(1, feather.distance / height)})`}
          d="M-6 6Q-7-6 8-7Q6 5-6 6L4-3" fill="var(--memo-soft)" stroke="var(--memo)" stroke-width="2" />
      </Scene>
      <Values items={{ 'Timer': time.toFixed(2) + ' s', 'Stone fall': stone.distance.toFixed(1) + ' m · ' + stone.speed.toFixed(1) + ' m/s',
        'Feather fall': feather.distance.toFixed(1) + ' m · ' + feather.speed.toFixed(1) + ' m/s',
        'Landing times': stoneLanding.toFixed(2) + ' s / ' + featherLanding.toFixed(2) + ' s' }} />
      <Slider label={'Height (m) · ' + height} value={height} min={5} max={30} step={1} onChange={(value) => { setHeight(value); reset() }} />
      <div class="jp-pills">
        <button type="button" class="jp-btn" aria-pressed={air} onClick={() => { setAir(!air); reset() }}>Air resistance {air ? 'on' : 'off'}</button>
        <button type="button" class="jp-btn jp-btn--primary" onClick={() => { setTime(0); setRun(performance.now()) }}>Drop</button>
      </div>
      <Slider label="Scrub time (s)" value={time} min={0} max={featherLanding} step={0.01} onChange={(value) => {
        setRun(0)
        setTime(featherLanding - value < 0.015 ? featherLanding : value)
      }} />
    </>}
  </TryIt>
}
