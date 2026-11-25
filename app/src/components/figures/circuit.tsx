import { coords, Drawing, Label } from './drawing'
import type { CircuitSpec, Point } from './spec'

type Part = CircuitSpec['parts'][number]
const pitch = 45
const position = ([x, y]: Point): Point => [25 + x * pitch, 29 + y * pitch]

function PartSymbol({ kind, closed }: Pick<Part, 'kind' | 'closed'>) {
  switch (kind) {
    case 'cell': return <path d="M-4-12v24 M4-7v14" />
    case 'resistor': return <rect x="-13" y="-6" width="26" height="12" />
    case 'capacitor': return <path d="M-4-10v20 M4-10v20" />
    case 'switch': return <>
      <circle cx="-10" r="2" /><circle cx="10" r="2" />
      <path d={closed ? 'M-8 0H8' : 'M-8-1 7-11'} />
    </>
    case 'bulb': return <><circle r="12" /><path d="M-8-8 8 8 M-8 8 8-8" /></>
    default: return <circle r="12" />
  }
}

const contacts = { cell: 4, resistor: 13, capacitor: 4, switch: 12, bulb: 12, ammeter: 12, voltmeter: 12 }

export default function Circuit({ spec }: { spec: CircuitSpec }) {
  return (
    <Drawing width={spec.size[0] * pitch + 50} height={spec.size[1] * pitch + 58}>
      <g class="jp-figure-outline">
        {spec.wires.map((wire, i) => <polyline key={i} points={coords(wire.map(position))} />)}
      </g>
      {spec.junctions?.map((point, i) => {
        const [cx, cy] = position(point)
        return <circle key={i} cx={cx} cy={cy} r="2.8" />
      })}
      {spec.parts.map((part, i) => {
        const [x, y] = position(part.at)
        const contact = contacts[part.kind]
        const meter = part.kind === 'ammeter' ? 'A' : part.kind === 'voltmeter' ? 'V' : null
        return <g key={i} transform={'translate(' + x + ' ' + y + ')'}>
          <g transform={part.vertical ? 'rotate(90)' : undefined}>
            <rect x={-contact} y="-13" width={2 * contact} height="26" fill="var(--bg)" />
            <g class="jp-figure-outline"><PartSymbol kind={part.kind} closed={part.closed} /></g>
          </g>
          {meter && <Label at={[0, 0]} text={meter} />}
          {part.label && <Label at={part.vertical ? [17, 0] : [0, -19]} anchor={part.vertical ? 'start' : 'middle'} text={part.label} />}
        </g>
      })}
    </Drawing>
  )
}
