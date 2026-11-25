import type { ComponentChildren } from 'preact'
import { hasMathNotation, renderMathText } from '../../lib/mathText'
import type { Point } from './spec'

export function Drawing({ width = 320, height = 180, children }: {
  width?: number; height?: number; children: ComponentChildren
}) {
  return (
    <svg class="jp-figure-svg" viewBox={'0 0 ' + width + ' ' + height}
      width={width} height={height} aria-hidden="true" focusable="false">{children}</svg>
  )
}

export function Label({ at: [x, y], text, anchor = 'middle', width = 106 }: {
  at: Point; text: string; anchor?: 'start' | 'middle' | 'end'; width?: number
}) {
  if (!hasMathNotation(text)) {
    return <text x={x} y={y} dominant-baseline="central" text-anchor={anchor}>{text}</text>
  }
  const left = anchor === 'middle' ? x - width / 2 : anchor === 'end' ? x - width : x
  const align = anchor === 'middle' ? 'center' : anchor === 'end' ? 'right' : 'left'
  return (
    <foreignObject x={left} y={y - 22} width={width} height="44">
      <span class="jp-figure-math" style={{ justifyContent: align }}>{renderMathText(text)}</span>
    </foreignObject>
  )
}

export function coords(points: Point[]) {
  return points.map(([x, y]) => x + ',' + y).join(' ')
}

export function Line({ from, to }: { from: Point; to: Point }) {
  return <line x1={from[0]} y1={from[1]} x2={to[0]} y2={to[1]} />
}
