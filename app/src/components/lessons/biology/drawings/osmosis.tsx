import type { DrawingProps } from '../../lesson'
import { processDrawing } from '../AnatomyBoard'
import { Diagram, Flow, type Point } from '../Diagram'

const Overview = processDrawing("Osmosis in plants and animals", [
  {
    outline: [
      ["green", "M50 82Q104 64 211 77Q250 85 267 113L267 189Q258 226 207 230Q119 246 58 215Q38 186 42 131Z"],
      ["paper", "M58 91Q105 75 209 85Q249 91 257 117V184Q245 218 204 220Q122 235 65 209Q51 180 51 131Z"],
    ],
    parts: [
      {
        cue: 'part-0-0', label: "Water potential", at: [16,33], tip: [92,109], align: 'start',
        strokes: [
          ["lead", "M101 37L89 88"],
        ],
        flows: [
          ["blue", "M287 141L259 141Q220 143 195 150"],
        ],
      },
      {
        cue: 'part-0-1', label: "Diffusion", at: [307,57], tip: [208,95], align: 'end',
        strokes: [
          ["ink", "M218 66h2m7 1h2m7-5h2m-21-7h2m22 1h2m-9 9h2m-15 19h2"],
        ],
        flows: [
          ["blue", "M228 55L226 92L204 112"],
        ],
      },
    ],
  },
  {
    scenes: [2],
    outline: [
      ["amber", "M21 63H301V243H21Z"],
      ["green", "M23 118Q77 108 117 124Q158 138 189 127Q208 118 229 132Q247 143 275 138Q293 141 297 151Q295 167 274 170Q247 164 222 174Q202 182 181 170Q157 157 123 163Q81 185 23 173Z"],
      ["ink", "M27 135Q100 124 137 146Q167 154 183 148M28 153Q89 163 122 150M62 119v57m27-58v51m27-43v34m33-28v26"],
    ],
    parts: [
      {
        cue: 'part-2-0', label: "Root hair", at: [306,102], tip: [253,151], align: 'end',
        flows: [
          ["blue", "M279 208L271 154Q220 153 181 151L77 146"],
        ],
      },
    ],
  },
])

const cellWall = 'M25 71L151 71Q174 74 179 96V178Q176 197 154 200H48Q25 197 23 173V97Q23 82 25 71Z'
const point: Record<string, Point> = {
  'part-1-0': [73, 153], 'part-1-1': [253, 134], 'part-1-2': [268, 112],
}

export default function Osmosis(props: DrawingProps) {
  const { scene, frame } = props
  if (scene.visual === '0' || scene.visual === '2') return <Overview {...props} />

  const review = scene.visual === '3'
  const cues = scene.beats.slice(0, frame.reached).map(({ action }) => action)
  const active = cues[cues.length - 1]
  const settled = frame.reduced || review
  const plant = settled || cues.includes('part-1-0')
  const red = settled || cues.includes('part-1-1')
  const burst = settled || cues.includes('part-1-2')
  const plantProgress = settled || active !== 'part-1-0' ? 1 : Math.min(frame.sinceBeat / 1650, 1)
  const redProgress = Math.min(frame.sinceBeat / 1650, 1)
  const inset = plant ? 29 * plantProgress : 0

  return <Diagram label="A plant cell losing water and a red blood cell swelling and bursting" viewBox="0 0 320 274"
    point={!frame.reduced && active ? point[active] : undefined}>
    <path class="jp-biology-green-seed" d={cellWall} />
    <rect class="jp-biology-anatomy" x={28 + inset} y={76 + inset} width={146 - inset * 2} height={119 - inset * 2} rx="13" />
    <rect class="jp-biology-blue-soft" x={39 + inset} y={88 + inset} width={124 - inset * 2} height={95 - inset * 2} rx="16" />
    {plant && <>
      <Flow d="M80 118Q67 100 53 55" tone="jp-biology-blue" seconds={frame.seconds} moving={!frame.reduced && active === 'part-1-0'} />
      <Flow d="M139 135L189 126" tone="jp-biology-blue" seconds={frame.seconds} moving={!frame.reduced && active === 'part-1-0'} />
      <path class="jp-biology-leader" d="M61 230L73 168M112 58L121 71" />
      <text x="111" y="53" text-anchor="middle">Cell wall</text>
      <text x="19" y="243">Plasmolysis</text>
    </>}
    {red && <>
      {burst ? <>
        <path class="jp-biology-red-soft" d="M271 109Q250 93 231 111Q211 131 226 154Q240 173 258 161L264 150L273 156Q284 147 284 132L273 134L278 122L267 122Z" />
        <path class="jp-biology-contour" d="M281 115l11-8m-9 16l16-2m-14 17l11 6" />
        <g class="jp-biology-red-soft">
          <circle cx="292" cy="115" r="3" /><circle cx="303" cy="129" r="2.5" /><circle cx="295" cy="146" r="2" />
        </g>
        <path class="jp-biology-leader" d="M265 195L266 157" />
        <text x="303" y="211" text-anchor="end">Haemolysis</text>
      </> : <>
        <Flow d="M219 81L233 111" tone="jp-biology-blue" seconds={frame.seconds} moving={!frame.reduced} />
        <Flow d="M297 90L275 114" tone="jp-biology-blue" seconds={frame.seconds} moving={!frame.reduced} />
        <ellipse class="jp-biology-red-soft" cx="252" cy="132" rx={24 + 9 * redProgress} ry={10 + 21 * redProgress} />
        <path class="jp-biology-contour" opacity={1 - redProgress} d="M236 132Q251 140 267 132" />
        <path class="jp-biology-leader" d="M265 195L257 164" />
      </>}
      <text x="303" y="234" text-anchor="end">Red cell in<tspan x="303" dy="15">dilute solution</tspan></text>
    </>}
  </Diagram>
}
