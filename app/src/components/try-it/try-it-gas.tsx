import { useState } from 'preact/hooks'
import { DragHandle, ease, near, Slider, Trace, Travel, TryIt, Values } from './TryIt'
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
export default function GasLaws(props: InteractiveProps) {
  const [law, setLaw] = useState<'boyle' | 'charles'>('boyle')
  const [compressedVolume, setVolume] = useState(initial.volume)
  const [kelvin, setKelvin] = useState(initial.kelvin)
  const boyle = law === 'boyle'
  const volume = boyle ? compressedVolume : charlesVolume(kelvin)
  const pressure = boyle ? boylePressure(volume) : initial.pressure
  const piston = pistonX(volume)

  return (
    <TryIt {...props} aim="See how the pressure, volume and temperature of a gas change together." context="Air in a bicycle pump warms as you compress it. Boyle’s law models slow compression at constant temperature."
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
            <svg viewBox="0 0 320 120" role="img" aria-label="Gas particles bouncing in a cylinder with a movable piston">
              <rect x="22" y="22" width={piston - 22} {...ease({ width: piston - 22 })} height="68" fill="var(--brand-soft)" />
              <path d="M194 22H22V90H194" fill="none" stroke="var(--ink-2)" stroke-width="2" />
              <g transform={`translate(${piston} 0)`} {...ease({ transform: `translate(${piston} 0)` })}>
                <path d="M0 23v66m0-33h21" fill="none" stroke="var(--brand)" stroke-width="5" stroke-linecap="round" />
              </g>
              <svg x="25" y="24" width={piston - 28} {...ease({ width: piston - 28 })} height="64" viewBox="0 0 100 68" preserveAspectRatio="none">
                {dots.map(([x, y], i) => <Travel key={x}
                  seconds={(1.5 + i % 4 * 0.32) / molecularSpeedRatio(boyle ? initial.kelvin : kelvin)}
                  points={[x, y, 96, 68 - y, 100 - x, 4, 4, y, x, y]} offset={i / dots.length}>
                  <circle r="2" fill="var(--brand)" />
                </Travel>)}
              </svg>
              <text x="260" y="57" text-anchor="middle">Piston</text>
            </svg>
            {unlocked && boyle && <DragHandle x={piston / 320} y={56 / 120} onDrag={(fraction) =>
              adjustPiston(Math.min(maxVolume, Math.max(minVolume, Math.round((fraction * 320 - 22) / 42 * 10) / 10)))} />}
          </div>
          {boyle ? <Slider info="Push or pull the piston to change the space the gas fills." label={'Piston volume (L) · ' + volume.toFixed(2)} value={volume} min={minVolume} max={maxVolume} step={0.1} onChange={adjustPiston} />
            : <Slider info="The gas temperature in kelvin. Gas laws always use kelvin, not °C." label={'Heat the gas (K) · ' + kelvin} value={kelvin} min={150} max={600} step={5} onChange={setKelvin} />}
          <Trace x={boyle ? (volume - 1) / 3 : (kelvin - 150) / 450}
            y={boyle ? pressure / 200 : volume / 4} series={law}
            labels={boyle ? ['Volume (L)', 'Pressure (kPa)'] : ['Temperature (K)', 'Volume (L)']} />
          <Values items={{ 'P': pressure.toFixed(1) + ' kPa', 'V': volume.toFixed(2) + ' L', 'T': (boyle ? initial.kelvin : kelvin) + ' K' }} />
        </>
      }}
    </TryIt>
  )
}
