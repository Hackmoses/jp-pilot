import { useState } from 'preact/hooks'
import { DragHandle, near, Slider, TryIt, Values } from './TryIt'
import type { InteractiveProps } from './TryItCard'

const initial = { volume: 2, pressure: 100, kelvin: 300 }
const minVolume = 1
const maxVolume = 4
const pistonX = (volume: number) => 22 + 42 * volume

export const boylePressure = (volume: number) => initial.pressure * initial.volume / volume
export const charlesVolume = (kelvin: number) => initial.volume * kelvin / initial.kelvin
export const molecularSpeedRatio = (kelvin: number) => Math.sqrt(kelvin / initial.kelvin)

const dots = [
  [10, 16], [18, 40], [28, 26], [36, 58], [48, 13], [54, 37],
  [64, 51], [73, 23], [79, 58], [87, 38], [91, 13], [9, 60],
]
const graphX = (volume: number) => 215 + (volume - minVolume) * 27
const graphY = (pressure: number) => 86 - pressure * 0.33
const pressureCurve = Array.from({ length: 31 }, (_, index) => {
  const volume = minVolume + index / 10
  return [graphX(volume), graphY(boylePressure(volume))].join(',')
}).join(' ')

export default function GasLaws(props: InteractiveProps) {
  const [law, setLaw] = useState<'boyle' | 'charles'>('boyle')
  const [compressedVolume, setVolume] = useState(initial.volume)
  const [kelvin, setKelvin] = useState(initial.kelvin)
  const boyle = law === 'boyle'
  const volume = boyle ? compressedVolume : charlesVolume(kelvin)
  const pressure = boyle ? boylePressure(volume) : initial.pressure
  const piston = pistonX(volume)

  return (
    <TryIt {...props} context="Air in a bicycle pump warms as you compress it. Boyle’s law models slow compression at constant temperature."
      prediction={{ question: 'What happens to pressure when you halve the volume at constant temperature?',
        choices: ['It halves', 'It stays the same', 'It doubles'], correct: 2,
        action: 'Compress the 2 L gas to half its volume using Boyle’s law.',
        observed: boyle && volume === 1, why: 'The molecules hit the walls more often in the smaller space.' }}
      missions={[
        { goal: 'Make the pressure 80 kPa at constant temperature.', reached: boyle && near(pressure, 80, 0.8), hint: 'At constant temperature, increasing the volume lowers the pressure.' },
        { goal: 'Use Charles’ law. Compare 300 K with 450 K and pick the reason.',
          baseline: !boyle && kelvin === 300, reached: !boyle && kelvin === 450, hint: 'Watch the piston as the particles move faster.',
          reason: { question: 'Why does the volume rise?', choices: ['The gas expands to keep pressure constant', 'Heating adds gas molecules'], correct: 0 } },
        { goal: 'At constant pressure, a 2 L gas at 27 °C is heated to 127 °C. Set the final temperature in kelvin to find its new volume.',
          reached: !boyle && near(volume, 8 / 3, 0.01), hint: 'Add about 273 to convert Celsius to kelvin before using the slider.',
          answer: { question: 'What is the new volume?', choices: ['About 2.67 L', 'About 9.41 L'], correct: 0 },
        trap: 'Charles’ law uses kelvin temperatures. A Celsius ratio gives the wrong volume.' },
      ]}
      explain={{ question: 'Why does pressure rise when the gas is compressed at constant temperature?',
        choices: ['The molecules hit the walls more often', 'Every molecule moves faster'], correct: 0,
        feedback: ['The same molecules have less space, so they collide with the walls more frequently.', 'Temperature stayed fixed, so average molecular speed stayed the same.'] }}
      formulas={[boyle ? 'P_{1}V_{1} = P_{2}V_{2}' : '\\frac{V_{1}}{T_{1}} = \\frac{V_{2}}{T_{2}}']}>
      {(unlocked) => {
        const adjustPiston = setVolume
        return <>
          <div class="jp-pills" role="group" aria-label="Gas law">
            <button type="button" class={'jp-btn ' + (boyle ? 'jp-btn--primary' : '')} aria-pressed={boyle}
              onClick={() => setLaw('boyle')}>Boyle’s law</button>
            <button type="button" class={'jp-btn ' + (!boyle ? 'jp-btn--primary' : '')} aria-pressed={!boyle}
              onClick={() => setLaw('charles')}>Charles’ law</button>
          </div>
          <div class="jp-try-scene">
            <svg viewBox="0 0 320 120" role="img" aria-label={boyle
              ? 'Piston and a pressure against volume curve' : 'Gas molecules and a movable piston'}>
              <rect x="22" y="22" width={piston - 22} height="68" fill="var(--brand-soft)" />
              <path d="M194 22H22V90H194" fill="none" stroke="var(--ink-2)" stroke-width="2" />
              <path d={'M' + piston + ' 23v66m0-33h' + Math.min(21, 212 - piston)} fill="none"
                stroke={boyle ? 'var(--brand)' : 'var(--ink-2)'} stroke-width="5" stroke-linecap="round" />
              <svg x="25" y="24" width={piston - 28} height="64" viewBox="0 0 100 68" preserveAspectRatio="none">
                <g class={unlocked ? 'jp-try-still' : undefined} fill="var(--brand)">
                  {dots.map(([x, y]) => <circle key={x} cx={x} cy={y} r="2" />)}
                </g>
                {unlocked && <g class="jp-try-moving" fill="var(--brand)">
                  {dots.map(([x, y], index) => <circle key={x} r="2">
                    <animateMotion dur={(1.5 + index % 4 * 0.32) / molecularSpeedRatio(boyle ? initial.kelvin : kelvin) + 's'} repeatCount="indefinite"
                      {...{ path: 'M' + x + ',' + y + ' L96,' + (68 - y) + ' L' + (100 - x) + ',4 L4,' + y + ' Z' }} />
                  </circle>)}
                </g>}
              </svg>
              {boyle && <g>
                <path d="M215 13V86H306" fill="none" stroke="var(--ink-2)" />
                <polyline points={pressureCurve} fill="none" stroke="var(--brand)" stroke-width="2" />
                <circle cx={graphX(volume)} cy={graphY(pressure)} r="4" fill="var(--brand)" />
                <text x="224" y="17">P (kPa)</text>
                <text x="278" y="104">V (L)</text>
              </g>}
            </svg>
            {unlocked && boyle && <DragHandle x={piston / 320} y={56 / 120} onDrag={(fraction) =>
              adjustPiston(Math.min(maxVolume, Math.max(minVolume, Math.round((fraction * 320 - 22) / 42 * 10) / 10)))} />}
          </div>
          {boyle ? <Slider label="Piston volume (L)" value={volume} min={minVolume} max={maxVolume} step={0.1} onChange={adjustPiston} />
            : <Slider label="Heat the gas (K)" value={kelvin} min={150} max={600} step={5} onChange={setKelvin} />}
          <Values items={{ 'P': pressure.toFixed(1) + ' kPa', 'V': volume.toFixed(2) + ' L', 'T': (boyle ? initial.kelvin : kelvin) + ' K' }} />
        </>
      }}
    </TryIt>
  )
}
