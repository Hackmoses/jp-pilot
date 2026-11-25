import { useState } from 'preact/hooks'
import { DragHandle, Slider, TryIt } from './TryIt'
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

export default function GasLaws({ practiceHref }: InteractiveProps) {
  const [law, setLaw] = useState<'boyle' | 'charles'>('boyle')
  const [compressedVolume, setVolume] = useState(initial.volume)
  const [kelvin, setKelvin] = useState(initial.kelvin)
  const boyle = law === 'boyle'
  const volume = boyle ? compressedVolume : charlesVolume(kelvin)
  const pressure = boyle ? boylePressure(volume) : initial.pressure
  const piston = pistonX(volume)

  return (
    <TryIt practiceHref={practiceHref}
      prediction="If you halve the volume at constant temperature, the pressure will:"
      choices={['Halve', 'Stay the same', 'Double']} correct={2}
      explanation="At constant temperature, halving the volume doubles the pressure because the molecules hit the cylinder walls more often. At constant pressure, the same gas expands in direct proportion to its temperature in kelvin."
      formulas={['P_{1}V_{1} = P_{2}V_{2}', '\\frac{V_{1}}{T_{1}} = \\frac{V_{2}}{T_{2}}']}>
      {(unlocked, tried) => {
        const adjustPiston = (next: number) => {
          if (next === compressedVolume) return
          setVolume(next)
          tried()
        }
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
                <g class={!boyle && unlocked ? 'jp-try-still' : undefined} fill="var(--brand)">
                  {dots.map(([x, y]) => <circle key={x} cx={x} cy={y} r="2" />)}
                </g>
                {!boyle && unlocked && <g class="jp-try-moving" fill="var(--brand)">
                  {dots.map(([x, y], index) => <circle key={x} r="2">
                    <animateMotion dur={(1.5 + index % 4 * 0.32) / molecularSpeedRatio(kelvin) + 's'} repeatCount="indefinite"
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
            : <Slider label="Heat the gas (K)" value={kelvin} min={150} max={600} step={5} onChange={(next) => {
              if (next === kelvin) return
              setKelvin(next)
              tried()
            }} />}
          <p class="jp-try-values">P = {pressure.toFixed(1)} kPa · V = {volume.toFixed(2)} L · T = {boyle ? initial.kelvin : kelvin} K</p>
        </>
      }}
    </TryIt>
  )
}
