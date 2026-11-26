import type { ComponentChildren } from 'preact'
import type { DrawingProps, Frame } from '../lesson'
import { wordMarker } from '../lesson'

export const sceneCode = (id: string) => id.replace(/^english-foundations-\d+-/, '')
export function reveal(frame: Frame) {
  if (frame.reached === 0) return 0
  if (frame.reduced) return 1
  return Math.min(1, Math.max(0, frame.sinceBeat / 650))
}
export function examples({ scene, pronunciations }: DrawingProps) {
  return [...new Set(Array.from(scene.say.matchAll(wordMarker), ([, id]) => id))]
    .map((id) => pronunciations?.[id]?.word ?? id).slice(0, 6)
}
export function Board({ label, height, children }: { label: string; height: number; children: ComponentChildren }) {
  return <svg class="jp-concept-svg" viewBox={'0 0 360 ' + height} role="img" aria-label={label}>{children}</svg>
}
type Row = { cells: readonly string[]; mark?: readonly number[]; hide?: readonly number[]; appear?: readonly number[]; split?: boolean }
export function Rows({ label, frame, rows }: { label: string; frame: Frame; rows: readonly Row[] }) {
  const amount = reveal(frame)
  return <Board label={label} height={rows.length * 45 + 14}>
    {rows.map(({ cells, mark, hide, appear, split }, row) => {
      const widths = cells.map((cell) => Math.max(26, 13 + [...cell].length * 8))
      const gap = 4 + (split ? amount * 9 : 0)
      let x = (360 - widths.reduce((sum, width) => sum + width, 0) - (cells.length - 1) * gap) / 2
      return cells.map((cell, i) => {
        const left = x
        const width = widths[i]
        x += width + gap
        const emphasized = Boolean(mark?.includes(i))
        const scale = emphasized ? 1 + amount * .14 : 1
        return <g key={row + ':' + i} opacity={hide?.includes(i) ? 1 - amount * .83 : appear?.includes(i) ? amount : 1}
          transform={`translate(${left + width / 2} ${row * 45 + 28}) scale(${scale})`}>
          <rect x={-width / 2} y="-15" width={width} height="30" rx="6" fill={emphasized && amount > 0 ? 'var(--brand-soft)' : 'var(--bg)'}
            stroke={emphasized && amount > 0 ? 'var(--brand)' : 'var(--line)'} />
          <text text-anchor="middle" dominant-baseline="central">{cell}</text>
        </g>
      })
    })}
  </Board>
}
