import type { DrawingProps } from '../lesson'
import { Diagram, Flow, timeline, type Point } from './Diagram'

export type Part = {
  label: string
  // Coordinates are local to the centre of the part.
  shape: string
  motion?: string
}
export type DiagramRow = {
  parts: Part[]
  links?: readonly (1 | -1 | 0)[]
}
type Board = { label: string; rows: DiagramRow[] }

const rowY = [40, 120, 200]
const positions = [[160], [77, 243], [53, 160, 267], [40, 120, 200, 280]]
const key = (row: number, column: number) => 'part-' + row + '-' + column

export function processDrawing(board: Board) {
  const sequence = board.rows.map(({ parts }, row) => parts.map((_, i) => key(row, i)))
  return function ProcessDrawing(props: DrawingProps) {
    const { active, shown, reduced } = timeline(props, sequence)
    let point: Point | undefined
    const drawing = board.rows.map(({ parts, links }, row) => {
      const y = rowY[row]
      const xs = positions[parts.length - 1]
      return <g key={row}>
        {parts.map(({ label, shape, motion }, column) => {
          const part = key(row, column)
          if (!shown(part)) return null
          const x = xs[column]
          const isActive = !reduced && part === active
          if (isActive) point = [Math.min(x + 23, 293), y + 16]
          const direction = links?.[column - 1]
          const from = direction === -1 ? x - 29 : xs[column - 1] + 29
          const to = direction === -1 ? xs[column - 1] + 29 : x - 29
          return <g key={part}>
            {Boolean(direction) && <Flow d={'M' + from + ' ' + y + 'H' + to} tone="jp-biology-blue"
              seconds={props.frame.seconds} moving={isActive} />}
            <g transform={'translate(' + x + ' ' + y + ')'}>
              <path d={shape} class="jp-biology-structure" />
              {motion && <Flow d={motion} tone="jp-biology-blue" seconds={props.frame.seconds} moving={isActive} />}
              <text text-anchor="middle" y="32">
                {label.split('|').map((line, i) => <tspan key={i} x="0" dy={i ? '14' : '0'}>{line}</tspan>)}
              </text>
            </g>
          </g>
        })}
      </g>
    })
    return <Diagram label={board.label} point={point} viewBox="0 0 320 258">{drawing}</Diagram>
  }
}
