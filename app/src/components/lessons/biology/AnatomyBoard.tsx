import type { DrawingProps } from '../lesson'
import { Diagram, Flow, type Point } from './Diagram'

type Tone = 'ink' | 'paper' | 'blue' | 'red' | 'green' | 'amber' | 'lead' | 'zoom' | 'shade'
type Stroke = readonly [tone: Tone, d: string]
type Route = readonly [tone: 'blue' | 'red' | 'green' | 'amber', d: string, particles?: 'split']
type Motion = readonly [tone: Tone, rest: string, extended: string]
type Part = {
  cue: string
  label: string
  at: Point
  tip: Point
  until?: string
  align?: 'start' | 'middle' | 'end'
  strokes?: Stroke[]
  flows?: Route[]
  motion?: Motion[]
}
type View = { scenes?: number[]; outline: Stroke[]; parts: Part[] }

const styles: Record<Tone, string> = {
  ink: 'jp-biology-contour',
  paper: 'jp-biology-anatomy',
  blue: 'jp-biology-blue-soft',
  red: 'jp-biology-red-soft',
  green: 'jp-biology-green-seed',
  amber: 'jp-biology-yellow-seed',
  lead: 'jp-biology-leader',
  zoom: 'jp-biology-zoom',
  shade: 'jp-biology-shade',
}
const flows = {
  blue: 'jp-biology-blue', red: 'jp-biology-red', green: 'jp-biology-good', amber: 'jp-biology-waste',
}
const numbers = /-?\d+(?:\.\d+)?/g

function curve(rest: string, extended: string) {
  const end = extended.match(numbers)?.map(Number) ?? []
  return (progress: number) => {
    let coordinate = 0
    return rest.replace(numbers, (raw) => {
      const initial = Number(raw)
      return String(initial + ((end[coordinate++] ?? initial) - initial) * progress)
    })
  }
}

export function processDrawing(title: string, views: View[]) {
  const prepared = views.map((view) => ({
    ...view,
    parts: view.parts.map((part) => ({
      ...part,
      start: Number(part.cue.split('-')[1]),
      curves: part.motion?.map(([tone, rest, extended]) => [tone, curve(rest, extended)] as const),
    })),
  }))
  return function Drawing({ scene, frame }: DrawingProps) {
    const chapter = Number(scene.visual)
    const cues = scene.beats.slice(0, frame.reached).map(({ action }) => action)
    const active = cues[cues.length - 1]
    const main = prepared[0]
    const comparison = chapter >= 3 && !frame.reduced && active && !main.parts.some(({ cue }) => cue === active)
      ? prepared.slice(1).find(({ parts }) => parts.some(({ cue }) => cue === active)) : undefined
    const view = prepared.find(({ scenes }) => scenes?.includes(chapter)) ?? comparison ?? main
    const visible = view.parts.filter(({ cue, start, until }) => {
      if (until && active !== cue && (frame.reduced || chapter > Number(until.split('-')[1]) || cues.includes(until))) return false
      return frame.reduced || start < chapter || cues.includes(cue)
    })
    const point = !frame.reduced ? visible.find(({ cue }) => cue === active)?.tip : undefined
    const animated = !frame.reduced
    const cycle = (1 - Math.cos(frame.seconds * 2.2)) / 2

    return <Diagram label={title} point={point} viewBox="0 0 320 274">
      {view.outline.map(([tone, d], i) => <path key={i} class={styles[tone]} d={d} />)}
      {visible.map(({ cue, strokes, curves, flows: routes }) => <g key={cue}>
        {strokes?.map(([tone, d], i) => <path key={i} class={styles[tone]} d={d} />)}
        {curves?.map(([tone, d], i) =>
          <path key={i} class={styles[tone]} d={d(animated ? cycle : 0)} />)}
        {routes?.map(([tone, d, particles], i) => <Flow key={i} d={d} tone={flows[tone]}
          seconds={frame.seconds} moving={animated && active === cue} split={particles === 'split'} />)}
      </g>)}
      {visible.map(({ cue, label, at: [x, y], align }) => label && <text key={cue} x={x} y={y}
        text-anchor={align ?? (x < 42 ? 'start' : x > 278 ? 'end' : 'middle')}>
        {label.split('|').map((line, i) => <tspan key={i} x={x} dy={i ? '15' : '0'}>{line}</tspan>)}
      </text>)}
    </Diagram>
  }
}
