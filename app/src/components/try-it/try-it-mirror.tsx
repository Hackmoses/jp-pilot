import { useState } from 'preact/hooks'
import { DragHandle, Slider, TryIt } from './TryIt'
import type { InteractiveProps } from './TryItCard'

const focalLength = 5

export function mirrorImage(u: number, f: number) {
  if (u === f) return null
  const v = u * f / (u - f)
  return { v, magnification: -v / u }
}

const pole = 192
const axis = 84
const scale = 8
const tip = 69
const objectHeight = axis - tip
const diagramWidth = 320
const diagramHeight = 168
const minDistance = 2.5
const maxDistance = 20
const rayColours = ['var(--brand)', 'var(--memo)']

function arrow(x: number, y: number) {
  const stem = y < axis ? 5 : -5
  return ['M', x, axis, 'V', y, 'm-4', stem, 'l4', -stem, 'l4', stem].join(' ')
}

export default function ConcaveMirror({ practiceHref }: InteractiveProps) {
  const [u, setDistance] = useState(15)
  const image = mirrorImage(u, focalLength)
  const objectX = pole - scale * u
  const focusX = pole - scale * focalLength
  const imageX = image ? pole - scale * image.v : pole
  const imageY = image ? axis - objectHeight * image.magnification : axis
  const inFrame = imageX >= 8 && imageX <= diagramWidth - 8 && imageY >= 8 && imageY <= diagramHeight - 8
  const virtual = image !== null && image.v < 0
  // Paraxial construction at the mirror plane: a parallel ray reflects through F.
  // The ray at the pole reflects at the same angle to the principal axis.
  const rays = [
    { mirrorY: tip, slope: -objectHeight / (scale * focalLength) },
    { mirrorY: axis, slope: -objectHeight / (scale * u) },
  ]

  return (
    <TryIt practiceHref={practiceHref}
      prediction="If the object is beyond the centre of curvature, the image is:"
      choices={['Larger', 'Smaller', 'Same size']} correct={1}
      explanation="Beyond C, the reflected rays meet between F and C to form a smaller, inverted real image. Inside F, the rays spread out and their backward extensions meet behind the mirror, forming a larger, upright virtual image."
      formulas={['\\frac{1}{f} = \\frac{1}{u} + \\frac{1}{v}', 'm = -\\frac{v}{u}', '|m| = \\frac{|v|}{u}']}>
      {(unlocked, tried) => {
        const moveObject = (next: number) => {
          if (next === u) return
          setDistance(next)
          tried()
        }
        return <>
          <div class="jp-try-scene">
            <svg viewBox="0 0 320 168" role="img" aria-label="Concave mirror ray diagram. Solid lines show light rays and dashed lines show backward extensions.">
              <path d="M8 84H312" stroke="var(--option-line)" />
              <path d="M183 25Q201 84 183 143" fill="none" stroke="var(--ink-2)" stroke-width="2" />
              {rays.map(({ mirrorY, slope }, index) => (
                <g key={mirrorY} stroke={rayColours[index]} fill="none" stroke-width="1.5">
                  <polyline points={[[objectX, tip], [pole, mirrorY], [8, mirrorY + slope * (8 - pole)]]
                    .map((point) => point.join(',')).join(' ')} />
                  {virtual && <line x1={pole} y1={mirrorY} x2="312" y2={mirrorY + slope * (312 - pole)} stroke-dasharray="4 4" />}
                </g>
              ))}
              {[[pole - 2 * scale * focalLength, 'C'], [focusX, 'F'], [pole, 'P']].map(([x, label]) =>
                <g key={label}><circle cx={x} cy={axis} r="2.5" fill="var(--ink-2)" />
                  <text x={x} y={axis + 18} text-anchor="middle">{label}</text></g>)}
              <path d={arrow(objectX, tip)} fill="none" stroke="var(--brand)" stroke-width="2.5" />
              {image && inFrame && <path d={arrow(imageX, imageY)} fill="none" stroke="var(--memo)" stroke-width="2.5" />}
              <text x="12" y="19" style={{ fill: 'var(--brand)' }}>Object</text>
              <text x="312" y="19" text-anchor="end" style={{ fill: 'var(--memo)' }}>Image</text>
            </svg>
            {unlocked && <DragHandle x={objectX / diagramWidth} y={(axis + tip) / 2 / diagramHeight} onDrag={(fraction) =>
              moveObject(Math.max(minDistance, Math.min(maxDistance, Math.round((pole - fraction * diagramWidth) / scale * 2) / 2)))} />}
          </div>
          <Slider label="Object distance (cm)" value={u} min={minDistance} max={maxDistance} step={0.5} onChange={moveObject} />
          <p class="jp-try-values">u = {u} cm · v = {image ? image.v.toFixed(2) + ' cm' : '∞'} · f = {focalLength} cm</p>
          {image ? <p class="jp-try-values">
            m = {image.magnification.toFixed(2)} · {virtual ? 'Virtual, upright' : 'Real, inverted'}
            {' · '}{u === 2 * focalLength ? 'Same size' : u > 2 * focalLength ? 'Smaller' : 'Larger'}
            {!inFrame && ' · Image outside diagram'}
          </p> : <p class="jp-mode-lead">At F the reflected rays are parallel. The image is at infinity.</p>}
          <p class="jp-mode-lead">Real-is-positive convention. Here u and f are positive. Real images have positive v and virtual images have negative v.</p>
        </>
      }}
    </TryIt>
  )
}
