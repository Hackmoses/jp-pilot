import { useId } from 'preact/hooks'
import { coords, Drawing, Label, Line } from './drawing'
import type { Axis, GraphSpec, Point } from './spec'

const left = 52
const right = 300
const top = 28
const bottom = 150
const scale = ([min, max]: Point, start: number, end: number) =>
  (value: number) => start + (value - min) / (max - min) * (end - start)
const ticks = ({ range: [min, max], ticks }: Axis) =>
  ticks ?? Array.from({ length: 5 }, (_, i) => Number((min + (max - min) * i / 4).toPrecision(4)))
const axisLabel = ({ label, unit }: Axis) => unit ? label + ' (' + unit + ')' : label

// Cubic interpolation through the listed points, with endpoint tangents.
function curve(points: Point[]) {
  return points.map(([x, y], i) => {
    if (!i) return 'M' + x + ',' + y
    const [px, py] = points[i - 1]
    const [beforeX, beforeY] = points[Math.max(0, i - 2)]
    const [afterX, afterY] = points[Math.min(i + 1, points.length - 1)]
    return 'C' + coords([
      [px + (x - beforeX) / 6, py + (y - beforeY) / 6],
      [x - (afterX - px) / 6, y - (afterY - py) / 6],
      [x, y],
    ])
  }).join(' ')
}

export default function Graph({ spec }: { spec: GraphSpec }) {
  const clip = useId()
  const x = scale(spec.x.range, left, right)
  const y = scale(spec.y.range, bottom, top)
  const plot = ([a, b]: Point): Point => [x(a), y(b)]
  const xTicks = ticks(spec.x)
  const yTicks = ticks(spec.y)
  const axisX = Math.max(left, Math.min(right, x(0)))
  const axisY = Math.max(top, Math.min(bottom, y(0)))
  return (
    <Drawing height={194}>
      <defs><clipPath id={clip}><rect x={left} y={top} width={right - left} height={bottom - top} /></clipPath></defs>
      {spec.grid && <g class="jp-figure-grid">
        {xTicks.map((v) => <Line key={v} from={[x(v), top]} to={[x(v), bottom]} />)}
        {yTicks.map((v) => <Line key={v} from={[left, y(v)]} to={[right, y(v)]} />)}
      </g>}
      <g clip-path={'url(#' + clip + ')'}>
        {spec.shaded?.map((area, i) => <polygon key={i} class="jp-figure-shade" points={coords(area.map(plot))} />)}
        <g class="jp-figure-outline jp-figure-accent">
          {spec.lines?.map(([a, b], i) => <Line key={i} from={plot(a)} to={plot(b)} />)}
          {spec.curves?.map((series, i) => <path key={i} d={curve(series.map(plot))} />)}
        </g>
      </g>
      <g class="jp-figure-outline">
        <Line from={[left, axisY]} to={[right, axisY]} />
        <Line from={[axisX, top]} to={[axisX, bottom]} />
        {xTicks.map((v) => <Line key={v} from={[x(v), axisY - 3]} to={[x(v), axisY + 3]} />)}
        {yTicks.map((v) => <Line key={v} from={[axisX - 3, y(v)]} to={[axisX + 3, y(v)]} />)}
      </g>
      {xTicks.map((v) => <Label key={v} at={[x(v), bottom + 12]} text={String(v)} />)}
      {yTicks.map((v) => <Label key={v} at={[left - 7, y(v)]} anchor="end" text={String(v)} />)}
      <Label at={[left, 13]} anchor="start" width={250} text={axisLabel(spec.y)} />
      <Label at={[(left + right) / 2, 182]} width={250} text={axisLabel(spec.x)} />
      {spec.points?.map(({ at, label, labelAt, marker = true }, i) => {
        const [cx, cy] = plot(at)
        return <g key={i}>
          {marker && <circle cx={cx} cy={cy} r="3" />}
          {label && <Label at={labelAt ? plot(labelAt) : [cx, cy - 13]} text={label} />}
        </g>
      })}
    </Drawing>
  )
}
