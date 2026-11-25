import { Drawing, Label, Line } from './drawing'
import type { ChartSpec, Point } from './spec'

const colours = ['var(--brand)', 'var(--memo)', 'var(--good)', 'var(--trap)', 'var(--ink-2)']
type PieSpec = Extract<ChartSpec, { kind: 'pie' }>

function Pie({ spec }: { spec: PieSpec }) {
  const total = spec.slices.reduce((sum, slice) => sum + slice.value, 0)
  const center: Point = [160, 70]
  const edge = (angle: number) => [center[0] + 58 * Math.sin(angle), center[1] - 58 * Math.cos(angle)]
  let angle = 0
  return (
    <Drawing height={145 + spec.slices.length * 20}>
      {spec.slices.map(({ value, label }, i) => {
        const sweep = value / total * Math.PI * 2
        const start = angle
        angle += sweep
        const colour = colours[i % colours.length]
        const unitValue = Math.round(value / total * (spec.unit === '%' ? 100 : 360) * 10) / 10
        const y = 144 + i * 20
        return <g key={i}>
          {sweep >= Math.PI * 2 ? <circle cx={center[0]} cy={center[1]} r="58" fill={colour} /> :
            sweep > 0 && <path fill={colour} stroke="var(--bg)" d={
              'M' + center + 'L' + edge(start) + 'A58 58 0 ' + (sweep > Math.PI ? 1 : 0) + ' 1 ' + edge(angle) + 'Z'
            } />}
          <rect x="28" y={y - 5} width="10" height="10" fill={colour} />
          <Label at={[46, y]} anchor="start" width={260} text={label + ' ' + unitValue + spec.unit} />
        </g>
      })}
    </Drawing>
  )
}

export default function Chart({ spec }: { spec: ChartSpec }) {
  if (spec.kind === 'pie') return <Pie spec={spec} />
  const bars = spec.kind === 'bar'
    ? spec.bars.map(({ value, label }, i) => ({ from: i + .15, to: i + .85, height: value, label }))
    : spec.bins
  if (!bars.length) return null
  const max = Math.max(1, ...bars.map(({ height }) => height))
  const xRange: Point = spec.kind === 'bar' ? [0, bars.length]
    : [Math.min(...bars.map(({ from }) => from)), Math.max(...bars.map(({ to }) => to))]
  const xTicks = spec.kind === 'bar' ? [] : [...new Set(bars.flatMap(({ from, to }) => [from, to]))].sort((a, b) => a - b)
  const step = Math.max(1, Math.ceil(max / 4))
  const yTicks = Array.from({ length: Math.ceil(max / step) + 1 }, (_, i) => step * i)
  const top = 25
  const bottom = 142
  const left = 42
  const right = 300
  const x = (value: number) => left + (value - xRange[0]) / (xRange[1] - xRange[0]) * (right - left)
  const y = (value: number) => bottom - value / yTicks[yTicks.length - 1] * (bottom - top)
  return (
    <Drawing>
      <Label at={[left, 12]} anchor="start" width={240} text={spec.yLabel ?? 'Frequency'} />
      <g class="jp-figure-grid">
        {yTicks.map((tick) => <Line key={tick} from={[left, y(tick)]} to={[right, y(tick)]} />)}
      </g>
      {bars.map(({ from, to, height }, i) => <rect key={i} x={x(from)} y={y(height)}
        width={x(to) - x(from)} height={bottom - y(height)}
        fill="var(--brand)" fill-opacity=".27" stroke="var(--brand)" />)}
      <g class="jp-figure-outline">
        <Line from={[left, top]} to={[left, bottom]} />
        <Line from={[left, bottom]} to={[right, bottom]} />
        {xTicks.map((tick) => <Line key={tick} from={[x(tick), bottom]} to={[x(tick), bottom + 4]} />)}
      </g>
      {yTicks.map((tick) => <Label key={tick} at={[left - 7, y(tick)]} text={String(tick)} anchor="end" />)}
      {xTicks.map((tick) => <Label key={tick} at={[x(tick), bottom + 13]} text={String(tick)} />)}
      {spec.kind === 'bar' && spec.bars.map(({ label }, i) =>
        <Label key={i} at={[x(i + .5), bottom + 13]} width={(right - left) / bars.length} text={label} />)}
      {spec.xLabel && <Label at={[(left + right) / 2, 171]} width={240} text={spec.xLabel} />}
    </Drawing>
  )
}
