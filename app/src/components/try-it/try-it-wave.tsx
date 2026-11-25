import { useState } from 'preact/hooks'
import { ease, near, Slider, Travel, TryIt, Values } from './TryIt'
import type { InteractiveProps } from './TryItCard'

export function waveValues(frequency: number, speed: number) {
  return { wavelength: speed / frequency, period: 1 / frequency }
}

export default function WaveOnString(props: InteractiveProps) {
  const [frequency, setFrequency] = useState(5)
  const [amplitude, setAmplitude] = useState(2)
  const { wavelength, period } = waveValues(frequency, 420)
  const width = wavelength * 1.5
  const points = Array.from({ length: 67 }, (_, i) => {
    const x = i * 7 - 140
    return x + ',' + (57 - amplitude * 4 * Math.cos((x - 32) * 2 * Math.PI / width)).toFixed(1)
  }).join(' ')
  const y = 50 - amplitude * 4
  const wave = <>
    <polyline points={points} {...ease({ points })} fill="none" stroke="var(--brand)" stroke-width="2" />
    <path d={`M32 ${y}v-5h${width}v5`} {...ease({ d: `M32 ${y}v-5h${width}v5` })} fill="none" stroke="var(--memo)" />
    <text x={32 + width / 2} y={y - 9} {...ease({ x: 32 + width / 2, y: y - 9 })} text-anchor="middle">λ</text>
  </>
  return <TryIt {...props} context="A vibrating talking-drum skin makes waves. Here a string carries a transverse wave."
    prediction={{ question: 'At fixed wave speed, what happens to wavelength if frequency doubles?',
      choices: ['It doubles', 'It halves', 'It stays the same'], correct: 1,
      action: 'Raise the frequency from 5 Hz to 10 Hz.', observed: frequency === 10,
      why: 'The wave covers the same distance each second with twice as many crests, so they are half as far apart.' }}
    missions={[
      { goal: 'Make the amplitude 4 cm.', reached: near(amplitude, 4, 0.1), hint: 'Amplitude measures how far the string moves from its middle line.' },
      { goal: 'Compare 5 Hz with 10 Hz, then leave the frequency at 10 Hz and pick the reason.',
        baseline: frequency === 5, reached: frequency === 10, hint: 'Wave speed is fixed. Compare the spacing between crests.',
        reason: { question: 'Why did the wavelength halve?', choices: ['The wave speed halved', 'Twice as many cycles pass in a second at the same speed'], correct: 1 } },
      { goal: 'A wave travelling at 420 m/s has a wavelength of 28 m. Set that wavelength to find its period.',
        reached: near(wavelength, 28, 0.2), hint: 'Use speed and wavelength to find the frequency first.',
        answer: { question: 'What is the period?', choices: ['15 s', 'About 0.067 s'], correct: 1 },
        trap: 'Frequency counts cycles per second. Period is seconds per cycle.' },
    ]}
    explain={{ question: 'Why does moving the amplitude slider leave the wavelength unchanged?',
      choices: ['It changes the height of the crests', 'It changes the wave speed'], correct: 0,
      feedback: ['The amplitude changes vertical displacement. Speed and frequency set the horizontal spacing.', 'The model holds speed fixed. Watch the height change while crest spacing stays the same.'] }}
    formulas={['v = fλ', 'T = \\frac{1}{f}']}>
    {() => <>
      <div class="jp-try-scene">
        <svg viewBox="0 0 320 121" role="img" aria-label={'Wave snapshot with one crest-to-crest wavelength marked. Wavelength ' + wavelength.toFixed(1) + ' metres.'}>
          <path d="M0 57H320" stroke="var(--option-line)" />
          <Travel points={[0, 0, width, 0]} seconds={5 / frequency}>{wave}</Travel>
          <text x="19" y="111">Crest spacing</text>
        </svg>
      </div>
      <Values items={{ 'Speed': '420 m/s', 'Frequency': frequency + ' Hz', 'Wavelength': wavelength.toFixed(1) + ' m',
        'Period': period.toFixed(3) + ' s', 'Amplitude': amplitude + ' cm' }} />
      <div class="jp-try-sliders">
        <Slider label={'Frequency (Hz) · ' + frequency} value={frequency} min={5} max={20} step={1} onChange={setFrequency} />
        <Slider label={'Amplitude (cm) · ' + amplitude} value={amplitude} min={1} max={6} step={0.5} onChange={setAmplitude} />
      </div>
    </>}
  </TryIt>
}
