import { Drawing, Label } from './drawing'
import type { TableSpec } from './spec'

export default function Table({ spec }: { spec: TableSpec }) {
  const width = 320
  const cell = (width - 12) / spec.headers.length
  const rowHeight = 34
  const rows = [spec.headers, ...spec.rows]
  return (
    <Drawing width={width} height={12 + rows.length * rowHeight}>
      <rect x="6" y="6" width={width - 12} height={rowHeight} fill="var(--brand-soft)" />
      <g class="jp-figure-outline">
        <rect x="6" y="6" width={width - 12} height={rows.length * rowHeight} />
        {rows.slice(1).map((_, row) => {
          const y = 6 + (row + 1) * rowHeight
          return <line key={row} x1="6" x2={width - 6} y1={y} y2={y} />
        })}
        {spec.headers.slice(1).map((_, column) => {
          const x = 6 + (column + 1) * cell
          return <line key={column} x1={x} x2={x} y1="6" y2={6 + rows.length * rowHeight} />
        })}
      </g>
      {rows.map((entries, row) => <g key={row} font-weight={row === 0 ? 700 : undefined}>
        {entries.map((entry, column) => <Label key={column}
          at={[6 + (column + .5) * cell, 6 + (row + .5) * rowHeight]} width={cell - 6} text={entry} />)}
      </g>)}
    </Drawing>
  )
}
