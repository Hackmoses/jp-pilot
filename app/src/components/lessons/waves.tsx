import type { DrawingProps } from './lesson'
import { interpolate } from '../try-it/motion'

const marks = Array.from({ length: 19 }, (_, i) => i)
const nodes = Array.from({ length: 63 }, (_, i) => i * 5)
const tau = Math.PI * 2
export default function Waves({ scene, frame }: DrawingProps) {
  const { visual } = scene
  const { progress, reached, seconds } = frame
  const active = reached > 0
  const time = seconds + (visual === 'frequency' && reached > 1 && seconds ? frame.sinceBeat / 2000 : 0)
  const width = visual === 'speed' ? 70 : 96
  const phase = tau * time / 3
  const amplitude = visual === 'amplitude' && scene.id.endsWith('-q1') && active
    ? Number(interpolate('26', '34')(Math.min(1, frame.sinceBeat / 750))) : 26
  const pulse = visual === 'pulse' || visual === 'tank' || visual === 'energy'
  const front = 15 + Number(interpolate('0', '278')(progress))
  const waveAt = (x: number) => pulse
    ? -31 * Math.exp(-(((x - front) / 21) ** 2))
    : -amplitude * Math.cos((x - 22) * tau / width - phase)
  const longitudinal = ['spring', 'compare', 'gaps'].includes(visual)
  const showRope = visual !== 'spring' && visual !== 'gaps'
  const top = visual === 'compare' ? 43 : 66
  const bottom = visual === 'compare' ? 95 : 65
  const crest = 22 + (phase / tau * width) % width
  const compression = 24 + (phase / tau * 96) % 96
  const springPhase = (x: number) => tau * (x - 24) / 96 - phase
  return <svg class="jp-concept-svg" viewBox="0 0 340 132" role="img" aria-label={scene.show}>
    {showRope && <>
      <path class="guide" d={`M15 ${top}H325`} />
      {visual === 'tank' && <path d="M15 56v49H325V56" fill="none" stroke="currentColor" opacity=".5" />}
      <polyline class="accent" fill="none" stroke-width="3"
        points={nodes.map((offset) => `${15 + offset},${top + waveAt(15 + offset)}`).join(' ')} />
      {pulse && <>
        <path class="guide" d="M166 38v53" />
        <circle cx="166" cy={top + waveAt(166)} r="6" fill="currentColor" />
        {active && <text x={Math.min(front, 280)} y="28" text-anchor="middle">{visual === 'energy' ? 'Energy →' : 'Pulse →'}</text>}
      </>}
      {!pulse && <circle cx="118" cy={top + waveAt(118)} r="5" fill="currentColor" />}
      {active && visual === 'amplitude' && <>
        <path d={`M${crest} ${top}v-${amplitude}m-4 0h8m-8 26h8`} stroke="currentColor" fill="none" />
        <text x={crest + 10} y={top - 9}>A</text>
        {reached > 1 && <path d={`M${crest + width / 2} ${top - amplitude}v${2 * amplitude}`} class="guide" />}
      </>}
      {active && ['wavelength', 'speed', 'units', 'write'].includes(visual) && <>
        <path d={`M${crest} ${top - 31}V15h${width}v${top - 46}`} stroke="currentColor" fill="none" />
        <text x={crest + width / 2} y="12" text-anchor="middle">λ</text>
      </>}
      {active && ['string', 'compare', 'choose'].includes(visual) && <text x="126" y={top - 11}>↕</text>}
      {active && ['frequency', 'period'].includes(visual) && <>
        <path d="M118 37v59" class="guide"/>
        <rect x="72" y="109" width="192" height="3" fill="currentColor" opacity=".25" />
        <rect x="72" y="109" width={192 * ((time / 3) % 1)} height="3" class="accent-fill" />
        <text x="169" y="128" text-anchor="middle">{visual === 'period' ? 'Time for one cycle' : 'Cycles passing the marker'}</text>
      </>}
    </>}
    {longitudinal && <>
      <path class="guide" d={`M15 ${bottom}H325`} />
      {marks.map((mark) => {
        const x = 25 + mark * 16
        return <circle key={mark} cx={x - 8 * Math.sin(springPhase(x))} cy={bottom} r={mark === 6 ? 6 : 3.5}
          class={mark === 6 ? undefined : 'accent-fill'} fill="currentColor" />
      })}
      {active && (visual === 'gaps' ? <path d={`M${compression} ${bottom - 8}V31h${reached > 1 ? 96 : 48}v26`}
        fill="none" stroke="currentColor" /> : <text x="120" y={bottom + 27}>← →</text>)}
    </>}
    {active && !pulse && visual !== 'period' && visual !== 'frequency' && <text x="305" y="125">→</text>}
  </svg>
}
