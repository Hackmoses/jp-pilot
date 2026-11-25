import { coords, Drawing, Label, Line } from './drawing'
import type { GeometrySpec, Point } from './spec'

type Angle = NonNullable<GeometrySpec['angles']>[number]
function angleArc({ vertex: [x, y], from, to, radius = 21 }: Angle) {
  const start = Math.atan2(from[1] - y, from[0] - x)
  const end = Math.atan2(to[1] - y, to[0] - x)
  const delta = Math.atan2(Math.sin(end - start), Math.cos(end - start))
  const at = (angle: number, r: number): Point => [x + r * Math.cos(angle), y + r * Math.sin(angle)]
  return {
    path: 'M' + at(start, radius) + 'A' + radius + ',' + radius + ' 0 0 ' + (delta >= 0 ? 1 : 0) + ' ' + at(end, radius),
    labelAt: at(start + delta / 2, radius + 13),
  }
}

export default function Geometry({ spec }: { spec: GeometrySpec }) {
  return (
    <Drawing>
      <g class="jp-figure-outline">
        {spec.lines?.map(([from, to], i) => <Line key={i} from={from} to={to} />)}
        {spec.polygons?.map((points, i) => <polygon key={i} points={coords(points)} />)}
        {spec.circles?.map(({ centre: [x, y], radius }, i) => <circle key={i} cx={x} cy={y} r={radius} />)}
      </g>
      {spec.angles?.map((angle, i) => {
        const { path, labelAt } = angleArc(angle)
        return <g key={i} class="jp-figure-accent">
          <path class="jp-figure-outline" d={path} />
          {angle.label && <Label at={labelAt} text={angle.label} />}
        </g>
      })}
      {spec.points?.map(({ at: [x, y], label, labelAt, marker = true }, i) => <g key={i}>
        {marker && <circle cx={x} cy={y} r="2.5" />}
        {label && <Label at={labelAt ?? [x, y - 12]} text={label} />}
      </g>)}
      {spec.labels?.map(({ at, text }, i) => <Label key={i} at={at} text={text} />)}
    </Drawing>
  )
}
