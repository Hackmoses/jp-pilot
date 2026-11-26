import type { DrawingProps } from '../../lesson'
import { processDrawing } from '../AnatomyBoard'
import { Diagram, type Point } from '../Diagram'

const Overview = processDrawing("DNA, chromosomes and X-linked inheritance", [
  {
    outline: [
      ["paper", "M29 72Q50 28 103 42Q169 40 179 92Q186 150 132 169Q66 191 33 151Q15 113 29 72Z"],
      ["blue", "M66 61L89 91L103 90L127 60L141 67L114 105L140 148L127 155L99 122L87 122L65 156L52 146L77 105L51 68Z"],
      ["ink", "M80 91L91 99M103 92L109 101M81 112l13 7m9-7l11 6"],
    ],
    parts: [
      {
        cue: 'part-0-0', label: "DNA base pairs", at: [309,42], tip: [245,92], align: 'end',
        strokes: [
          ["zoom", "M124 66L195 58M129 85L192 136"],
          ["blue", "M202 60Q224 67 244 85T275 119Q287 130 291 150M287 59Q269 66 247 84T216 118Q204 130 200 151"],
          ["ink", "M213 69L275 69M225 78L261 78M230 98L261 98M219 111L271 111M210 123L283 123M205 135L287 135"],
        ],
      },
      {
        cue: 'part-1-0', label: "X chromosome", at: [21,209], tip: [105,101], align: 'start',
        flows: [
          ["blue", "M153 63Q181 41 220 69"],
        ],
      },
    ],
  },
  {
    scenes: [2],
    outline: [
      ["green", "M22 75Q30 40 75 53Q127 60 149 95Q166 122 142 146Q101 166 67 150Q23 137 22 75Z"],
      ["green", "M162 111Q183 90 235 101Q282 112 296 158Q307 205 269 222Q214 238 175 199Q144 176 147 145Z"],
      ["ink", "M49 66l-6-8m12 7l-3-9m16 9v-10M70 149l-3 11m17-6v10m20-12l4 10M274 218l6 7m-18 2l4 9m-18-9l1 9M288 197l9 3m-10-15l11 2"],
    ],
    parts: [
      {
        cue: 'part-2-0', label: "Conjugating Paramecium", at: [155,26], tip: [155,143],
        strokes: [
          ["red", "M78 97a13 12 0 1 0 26 0a13 12 0 1 0-26 0ZM216 163a13 12 0 1 0 26 0a13 12 0 1 0-26 0Z"],
        ],
        flows: [
          ["blue", "M97 93Q134 96 151 125Q177 151 225 158"],
          ["blue", "M224 181Q179 179 154 144Q125 115 100 110"],
        ],
      },
    ],
  },
])

const mother = ['Xᴺ', 'Xᶜ'] as const

function Cross({ left, affectedFather }: { left: number; affectedFather: boolean }) {
  const father = [affectedFather ? 'Xᶜ' : 'Xᴺ', 'Y'] as const
  const center = left + 71
  return <g text-anchor="middle">
    <text x={center} y="74">{affectedFather ? 'Colour-blind father' : 'Unaffected father'}</text>
    {father.map((sperm, col) => <text key={sperm} x={left + 49 + 48 * col} y="106">{sperm}</text>)}
    {mother.map((egg, row) => <g key={egg}>
      <text x={left + 11} y={138 + 38 * row}>{egg}</text>
      {father.map((sperm, col) => {
        const copies = Number(egg === 'Xᶜ') + Number(sperm === 'Xᶜ')
        const affected = copies === (sperm === 'Y' ? 1 : 2)
        const carrier = copies === 1 && sperm !== 'Y'
        const trait = affected ? 'jp-biology-red-soft' : carrier ? 'jp-biology-yellow-seed' : 'jp-biology-anatomy'
        const x = left + 25 + 48 * col
        const y = 115 + 38 * row
        return <g key={sperm}><rect class={trait} x={x} y={y} width="48" height="38" />
          <text x={x + 24} y={y + 24}>{egg}{sperm}</text>
        </g>
      })}
    </g>)}
    <text x={center} y="219">{affectedFather ? '50% colour-blind' : '25% colour-blind'}</text>
    <text x={center} y="239">1 carrier daughter</text>
  </g>
}

export default function Chromosomes(props: DrawingProps) {
  const { scene, frame } = props
  if (scene.visual !== '1') return <Overview {...props} />

  const cues = scene.beats.slice(0, frame.reached).map(({ action }) => action)
  const active = cues[cues.length - 1]
  const points: Record<string, Point> = {
    'cross-mother': [159, 43], 'cross-unaffected': [104, 153], 'cross-affected': [242, 153],
  }
  return <Diagram label="Colour blindness crosses for a carrier mother with an unaffected or affected father"
    viewBox="0 0 320 274" point={!frame.reduced && active ? points[active] : undefined}>
    <text x="160" y="34" text-anchor="middle">Carrier mother · XᴺXᶜ</text>
    {(frame.reduced || cues.includes('cross-unaffected')) && <Cross left={13} affectedFather={false} />}
    {(frame.reduced || cues.includes('cross-affected')) && <Cross left={165} affectedFather />}
  </Diagram>
}
