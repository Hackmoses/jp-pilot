import type { DrawingProps } from '../lesson'
import { Diagram, Flow, timeline, type Point } from './Diagram'

const stages = [
  ['kidney', 'cortex', 'zoom'],
  ['in', 'tuft', 'filter', 'capsule'],
  ['prox', 'reabs', 'blood', 'down', 'loop', 'duct'],
  ['out', 'ureter'],
]
const targets: Record<string, Point> = {
  kidney: [73, 124], cortex: [189, 85], zoom: [106, 111], in: [173, 51], tuft: [189, 77],
  filter: [207, 94], capsule: [205, 112], prox: [246, 95], reabs: [243, 117], blood: [220, 124],
  down: [242, 163], loop: [264, 211], duct: [329, 145], out: [329, 230], ureter: [113, 177],
}
const organ = 'M92 68C55 67 31 104 40 145C49 190 104 190 111 160Q114 147 96 139Q78 126 98 113Q122 97 112 80Q104 68 92 68Z'

export default function Nephron(props: DrawingProps) {
  const { shown, active, reduced, chapter } = timeline(props, stages)
  const full = shown('zoom')
  const flow = (d: string, tone: string, part: string, scene = chapter) =>
    <Flow d={d} tone={tone} seconds={props.frame.seconds} moving={!reduced && chapter === scene && active === part} />

  return <Diagram label="Kidney cortex magnified to show a nephron, filtration and reabsorption" point={!reduced && active ? targets[active] : undefined}>
    <g class="jp-biology-organ" data-zoom={full}>
      <path class="jp-biology-red-soft" d={organ} />
      {shown('cortex') && <path class="jp-biology-anatomy" d="M91 78C63 76 43 108 49 138Q56 170 84 171Q98 171 102 157Q105 150 90 145Q68 130 87 109Q108 91 103 85Q99 78 91 78Z" />}
      <path d="M97 133Q112 141 113 178" fill="none" class="jp-biology-leader" />
    </g>
    <text x={full ? 52 : 139} y={full ? 62 : 54}>Kidney</text>
    {shown('cortex') && <text x={full ? 17 : 86} y={full ? 105 : 87}>Cortex</text>}
    {full && <>
      <path class="jp-biology-zoom" d="M107 98L163 42M112 120L169 115" />
      <circle class="jp-biology-zoom" cx="105" cy="109" r="11" />
      <text x="225" y="24" text-anchor="middle">Nephron</text>
      <path class="jp-biology-anatomy" d="M163 72Q159 109 184 116Q204 123 220 106" />
    </>}
    {shown('in') && <>
      {flow('M147 49H167Q176 52 180 66','jp-biology-red','in',1)}
      <text x="141" y="41">Blood in</text>
    </>}
    {shown('tuft') && <>
      <path class="jp-biology-tuft" d="M180 66C191 56 207 63 207 75C207 88 182 98 177 85C173 73 196 66 200 76C204 90 182 94 181 78Q180 65 203 56L223 48" />
      <text x="231" y="62">Glomerulus</text>
    </>}
    {shown('capsule') && <text x="126" y="133">Bowman’s<tspan x="126" dy="14">capsule</tspan></text>}
    {shown('filter') && flow('M194 82L198 105','jp-biology-blue','filter',1)}
    {shown('prox') && <>
      <path class="jp-biology-tubule" d="M214 110Q223 92 230 103T242 99T254 98L242 121" />
      {flow('M216 107Q224 95 231 105T243 100T254 98','jp-biology-blue','prox',2)}
      <text x="261" y="88">Proximal<tspan x="261" dy="14">tubule</tspan></text>
    </>}
    {shown('reabs') && shown('prox') && <>
      <path class="jp-biology-tuft" d="M223 48Q231 52 224 78L212 120Q208 144 213 178" />
      {flow('M244 107L218 116','jp-biology-good','reabs',2)}
      <text x="159" y="164">Glucose</text>
    </>}
    {shown('down') && <>
      <path class="jp-biology-tubule" d="M242 121V190Q242 210 257 210Q273 210 273 190V122" />
      {flow('M242 132V190Q242 209 257 209Q273 209 273 190V131','jp-biology-blue','loop',2)}
      {flow('M242 159H221','jp-biology-blue','down',2)}
      <text x="179" y="191">Water</text><text x="248" y="227" text-anchor="middle">Loop of Henle</text>
    </>}
    {shown('duct') && <>
      <path class="jp-biology-tubule" d="M273 122Q280 108 291 117T308 113T329 122M329 106V215" />
      {flow('M329 158H307','jp-biology-blue','duct',2)}
      <text x="307" y="146" text-anchor="middle">Water</text>
      <text x="342" y="200" text-anchor="middle"><tspan x="342">Collecting</tspan><tspan x="342" dy="14">duct</tspan></text>
    </>}
    {shown('out') && <>
      {flow('M329 202V232','jp-biology-waste','out',3)}
      <text x="329" y="246" text-anchor="middle">Urine</text>
    </>}
    {shown('ureter') && <>
      {flow('M98 135Q111 147 113 176','jp-biology-waste','ureter',3)}
      <text x="83" y="195">Ureter</text>
    </>}
  </Diagram>
}
