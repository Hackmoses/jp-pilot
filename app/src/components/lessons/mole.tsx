import type { DrawingProps } from './lesson'
import { interpolate } from '../try-it/motion'

const dots = Array.from({ length: 12 }, (_, i) => i)

export default function Mole({ scene, frame }: DrawingProps) {
  const { visual } = scene
  const { reached, seconds, progress, sinceBeat } = frame
  const scale = ['mass', 'scale', 'divide'].includes(visual)
  const gas = ['gas', 'balloon', 'stp', 'volume'].includes(visual)
  const bridge = ['bridge', 'route'].includes(visual)
  const water = visual === 'water'
  const pairs = visual === 'pairs'
  const market = visual === 'market'
  const move = Math.sin(seconds * 2)
  const ease = (from: number, to: number) =>
    Number(interpolate(String(from), String(to))(seconds ? Math.min(1, sinceBeat / 850) : 1))
  const fall = seconds ? Math.max(0, 1 - progress * 4) : 0
  const gasAmount = scene.id === 'mole-4-q2' && reached ? ease(1, 0.5)
    : reached > (visual === 'balloon' ? 0 : 1) && visual !== 'stp' ? ease(1, 2) : 1
  const gasW = 104 * gasAmount
  const routeTo = scene.id === 'mole-3-s4' && reached > 1 ? 65
    : scene.id === 'mole-5-s2' && reached > 1 ? 170 : reached > 1 || visual === 'route' ? 275 : 170
  const routeFrom = scene.id === 'mole-3-s4' && reached > 1 ? 170
    : scene.id === 'mole-5-s2' ? (reached > 1 ? 275 : 170) : 65
  const concentration = scene.id.startsWith('mole-3-q')
  const bridgeLabels = ['Mass', 'Moles', concentration ? 'Concentration' : 'Particles']

  return <svg class="jp-concept-svg" viewBox="0 0 340 132" role="img" aria-label={scene.show}>
    {gas ? <>
      {visual === 'balloon' ? <ellipse cx="170" cy="60" rx={gasW / 2} ry="45" fill="none" stroke="currentColor" />
        : <rect x={170 - gasW / 2} y="13" width={gasW} height="94" rx="8" fill="none" stroke="currentColor" />}
      {dots.slice(0, Math.max(3, Math.round(6 * gasAmount))).map((i) => {
        const x = 170 + (((i * 0.3819 + seconds * 0.045) % 1) - 0.5) * gasW * 0.71
        const y = 62 + Math.cos(seconds * 1.6 + i * 2.1) * 30
        return <circle key={i} cx={x} cy={y} r="4" class="accent-fill" />
      })}
      {!!reached && <text x="170" y="127" text-anchor="middle">{visual === 'stp' ? 'Temperature · Pressure' : 'Gas volume'}</text>}
    </> : bridge ? <>
      <path class="guide" d="M64 53h215" />
      {[65, 170, 275].map((x, i) => <g key={x}>
        <circle cx={x} cy="53" r="21" fill="none" class="accent" />
        <text x={x} y="101" text-anchor="middle">{bridgeLabels[i]}</text>
      </g>)}
      <circle cx={reached ? ease(routeFrom, routeTo) : routeFrom} cy="53" r="6" class="accent-fill" />
    </> : <>
      {scale ? <>
        <path d="M98 89h144l12 22H86Z" fill="none" stroke="currentColor" />
        <path d="M107 87h126" class="accent" stroke-width="3" />
        <text x="170" y="106" text-anchor="middle">{reached ? 'grams' : 'Scale'}</text>
      </> : <>
        <rect x="42" y="23" width="110" height="79" rx="6" fill="none" stroke="currentColor" />
        <rect x="188" y="23" width="110" height="79" rx="6" fill="none" stroke="currentColor" />
      </>}
      {dots.map((i) => {
        const x = scale ? 113 + i % 6 * 22 : (i < 6 ? 60 : 206) + i % 3 * 35
        const y = (scale ? 73 : 50) + (scale ? -25 : 28) * (Math.floor(i / (scale ? 6 : 3)) % 2)
        const joins = (water || (pairs && i >= 6)) && reached
        const offset = joins ? ease(13, 7) : 13
        const radius = visual === 'mass' && i > 5 && reached ? 7 : 4
        return <g key={i} transform={`translate(${x + move * (i % 2 ? 3 : -3)} ${y - fall * (18 + i % 3 * 5)})`}
          opacity={i < 6 || reached || market || pairs ? 1 : .24}>
          {water && <path d={`M-${offset} 5 0 0 ${offset} 5`} stroke="currentColor" fill="none" />}
          {pairs && i >= 6 && <path d={`M0 0h${offset + 2}`} stroke="currentColor" />}
          {market ? <ellipse rx="6" ry="8" class="accent-fill" /> : <circle r={radius} class="accent-fill" />}
          {water && <><circle cx={-offset} cy="5" r="3" fill="currentColor" /><circle cx={offset} cy="5" r="3" fill="currentColor" /></>}
          {pairs && i >= 6 && <circle cx={offset + 2} r="4" class="accent-fill" />}
        </g>
      })}
      {!!reached && !scale && <text x="170" y="126" text-anchor="middle">
        {water ? 'Water molecules' : pairs ? 'Oxygen atoms and molecules' : market ? 'Equal groups' : 'Particles in counted groups'}
      </text>}
    </>}
  </svg>
}
