import { coords, Drawing, Label, Line } from './drawing'
import type { Point, RaysSpec } from './spec'

function Arrow({ points }: { points: Point[] }) {
  if (points.length < 2) return null
  const [a, b] = points.slice(-2)
  const angle = Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI
  return <path transform={'translate(' + b.join(' ') + ') rotate(' + angle + ')'} d="M-6-4 0 0-6 4" />
}

const optics = {
  lens: {
    convex: 'M160 26Q132 90 160 154Q188 90 160 26Z',
    concave: 'M147 26H173Q155 90 173 154H147Q165 90 147 26Z',
  },
  mirror: {
    convex: 'M171 26Q139 90 171 154',
    concave: 'M149 26Q181 90 149 154',
  },
}

export default function Rays({ spec }: { spec: RaysSpec }) {
  return (
    <Drawing>
      <g class="jp-figure-outline">
        <Line from={[12, 90]} to={[308, 90]} />
        <path d={optics[spec.optic][spec.shape]} />
        {spec.optic === 'mirror' && <path class="jp-figure-grid"
          transform={spec.shape === 'convex' ? 'translate(-5)' : 'translate(5)'}
          d={optics.mirror[spec.shape]} />}
        {[spec.object, spec.image].map((item, i) => item && <g key={i}>
          <Line from={item.from} to={item.to} />
          <Arrow points={[item.from, item.to]} />
        </g>)}
        {spec.rays.map(({ points, dashed }, i) => <g key={i} class="jp-figure-accent">
          <polyline points={coords(points)} stroke-dasharray={dashed ? '4 4' : undefined} />
          {!dashed && <Arrow points={points} />}
        </g>)}
      </g>
      {[spec.object, spec.image].map((item, i) => item?.label &&
        <Label key={i} at={[item.to[0], item.to[1] + (item.to[1] < 90 ? -12 : 12)]} text={item.label} />)}
      {spec.focalPoints.map(({ at: [x, y], label, labelAt }, i) => <g key={i}>
        <circle cx={x} cy={y} r="2.5" />
        <Label at={labelAt ?? [x, y + 14]} text={label ?? 'F'} />
      </g>)}
    </Drawing>
  )
}
