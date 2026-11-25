import { useState } from 'preact/hooks'
import { DragHandle, ease, near, Slider, Travel, TryIt, Values } from './TryIt'
import type { InteractiveProps } from './TryItCard'

const focalLength = 5

export function mirrorImage(u: number, f: number) {
  if (u === f) return null
  const v = u * f / (u - f)
  return { v, magnification: -v / u }
}

const pole = 192
const axis = 84
const scale = 5.5
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

export default function ConcaveMirror(props: InteractiveProps) {
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
    <TryIt {...props} context="A concave mirror in a barber’s shop can magnify a face when the face is close to it."
      prediction={{ question: 'When the object is beyond the centre of curvature, how large is its image?',
        choices: ['Larger', 'Smaller', 'Same size'], correct: 1,
        action: 'Move the object to 20 cm. Compare the image arrow with the object arrow.',
        observed: u === 20, why: 'Reflected rays meet between C and F to form a smaller, inverted real image.' }}
      missions={[
        { goal: 'Get a real image the same size as the object.', reached: image !== null && near(image.magnification, -1, 0.04),
          hint: 'Compare the lengths of the object and image arrows.' },
        { goal: 'Compare the object at F (5 cm) and just inside F (4 cm). Leave it at 4 cm.',
          baseline: u === 5, reached: u === 4, hint: 'Follow the dashed lines behind the mirror.',
          reason: { question: 'Why is the image at 4 cm virtual?', choices: ['Only backward extensions of the rays meet', 'The reflected rays meet in front'], correct: 0 } },
        { goal: 'A 4 cm object stands 15 cm from a mirror with f = 5 cm. Set the distance and use the size ratio to find the image height.',
          reached: u === 15, hint: 'Multiply the object height by the magnitude of the magnification.',
          answer: { question: 'What is the image height?', choices: ['−2 cm', '2 cm'], correct: 1 },
        trap: 'A negative magnification shows inversion. Image height as a size is positive.' },
      ]}
      explain={{ question: 'Why is there no finite image when the object is at F?',
        choices: ['The reflected rays are parallel', 'No light hits the mirror'], correct: 0,
        feedback: ['Parallel rays do not meet at a finite distance.', 'Light still hits the mirror and reflects. The reflected rays leave parallel.'] }}
      formulas={['\\frac{1}{f} = \\frac{1}{u} + \\frac{1}{v}', 'm = -\\frac{v}{u}', 'Image height = 4 cm × |m|']}>
      {(unlocked) => {
        const moveObject = setDistance
        return <>
          <div class="jp-try-scene">
            <svg viewBox="0 0 320 168" role="img" aria-label="Concave mirror ray diagram. Solid lines show light rays and dashed lines show backward extensions.">
              <path d="M8 84H312" stroke="var(--option-line)" />
              <path d="M183 25Q201 84 183 143" fill="none" stroke="var(--ink-2)" stroke-width="2" />
              {rays.map(({ mirrorY, slope }, index) => {
                const reflectedY = mirrorY + slope * (8 - pole)
                const points = [objectX, tip, pole, mirrorY, 8, reflectedY]
                const line = points.join(' ')
                return <g key={mirrorY} stroke={rayColours[index]} fill="none" stroke-width="1.5">
                  <polyline points={line} {...ease({ points: line })} />
                  {virtual && <line x1={pole} y1={mirrorY} x2="312" y2={mirrorY + slope * (312 - pole)} stroke-dasharray="4 4" />}
                  <Travel points={points} seconds={1.8} offset={index * 0.5}><circle r="2.5" fill={rayColours[index]} /></Travel>
                </g>
              })}
              {[[pole - 2 * scale * focalLength, 'C'], [focusX, 'F'], [pole, 'P']].map(([x, label]) =>
                <g key={label}><circle cx={x} cy={axis} r="2.5" fill="var(--ink-2)" />
                  <text x={x} y={axis + 18} text-anchor="middle">{label}</text></g>)}
              <path d={arrow(objectX, tip)} {...ease({ d: arrow(objectX, tip) })} fill="none" stroke="var(--brand)" stroke-width="2.5" />
              {image && <path d={arrow(imageX, imageY)} opacity={Number(inFrame)}
                {...ease({ d: arrow(imageX, imageY), opacity: Number(inFrame) })} fill="none" stroke="var(--memo)" stroke-width="2.5" />}
              <text x="12" y="19" style={{ fill: 'var(--brand)' }}>Object</text>
              <text x="312" y="19" text-anchor="end" style={{ fill: 'var(--memo)' }}>Image</text>
            </svg>
            {unlocked && <DragHandle x={objectX / diagramWidth} y={(axis + tip) / 2 / diagramHeight} onDrag={(fraction) =>
              moveObject(Math.max(minDistance, Math.min(maxDistance, Math.round((pole - fraction * diagramWidth) / scale * 2) / 2)))} />}
          </div>
          <Slider label={'Object distance (cm) · ' + u} value={u} min={minDistance} max={maxDistance} step={0.5} onChange={moveObject} />
          <Values items={{ 'u': u + ' cm', 'v': image ? image.v.toFixed(2) + ' cm' : '∞', 'f': focalLength + ' cm',
            'm': image ? image.magnification.toFixed(2) : '—', 'Image height': image ? Math.abs(4 * image.magnification).toFixed(2) + ' cm' : '—',
            'Image': image ? (virtual ? 'Virtual, upright' : 'Real, inverted') + (!inFrame ? ' · Outside diagram' : '') : 'At infinity. Reflected rays are parallel.' }} />
          <p class="jp-mode-lead">Real-is-positive convention. Here u and f are positive. Real images have positive v and virtual images have negative v.</p>
        </>
      }}
    </TryIt>
  )
}
