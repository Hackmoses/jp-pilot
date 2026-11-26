import { processDrawing } from '../AnatomyBoard'

export default processDrawing("Xylem, phloem and transpiration", [
  {
    outline: [
      ["ink", "M17 202Q75 192 117 201Q171 208 218 200Q262 192 306 202"],
      ["green", "M118 201Q117 155 122 83Q123 67 129 55L141 56Q130 123 132 201Q137 217 160 224Q150 233 138 231L130 247Q123 261 113 247L115 229Q101 239 81 233Q77 226 95 219Z"],
      ["green", "M127 82Q88 90 52 55Q83 40 109 51Q128 59 130 78ZM135 107Q164 59 204 83Q198 112 161 116L137 116Z"],
      ["ink", "M55 54Q90 70 126 80M143 108L194 89M127 205Q101 215 98 232M130 209Q141 221 155 222M124 212L123 246"],
      ["green", "M124 65Q110 43 131 21Q150 37 138 56Z"],
      ["amber", "M112 232Q102 223 85 228Q74 240 94 245Q104 244 112 232Z"],
    ],
    parts: [
      {
        cue: 'part-0-0', label: "Xylem", at: [17,146], tip: [121,138], align: 'start',
        strokes: [
          ["lead", "M61 145L118 137"],
        ],
        flows: [
          ["blue", "M85 220Q116 216 122 197L127 84L64 56"],
        ],
      },
      {
        cue: 'part-0-1', label: "Phloem", at: [14,175], tip: [132,151], align: 'start',
        strokes: [
          ["lead", "M63 170L131 151"],
        ],
        flows: [
          ["green", "M187 95Q151 111 138 115L130 201Q126 221 101 235"],
        ],
      },
      {
        cue: 'part-1-0', label: "Pith", at: [307,120], tip: [245,164], align: 'end',
        strokes: [
          ["zoom", "M135 152L206 127M136 170L199 179"],
          ["paper", "M246 124A43 43 0 1 0 246 210A43 43 0 1 0 246 124Z"],
          ["blue", "M246 145A22 22 0 1 0 246 189A22 22 0 1 0 246 145Z"],
          ["lead", "M286 121L249 164"],
        ],
      },
      {
        cue: 'part-1-1', label: "Water vapour", at: [12,22], tip: [65,51], align: 'start',
        flows: [
          ["blue", "M79 60Q62 51 61 32L61 24"],
          ["blue", "M173 89L184 60"],
        ],
      },
      {
        cue: 'part-2-0', label: "Vascular|cambium", at: [309,229], tip: [256,142], align: 'end',
        strokes: [
          ["green", "M246 138A29 29 0 1 0 246 196A29 29 0 1 0 246 138ZM246 145A22 22 0 1 1 246 189A22 22 0 1 1 246 145Z"],
          ["lead", "M266 217L258 194"],
        ],
      },
      {
        cue: 'part-2-1', label: "Cork cambium", at: [308,259], tip: [280,181], align: 'end',
        strokes: [
          ["amber", "M246 126A41 41 0 1 0 246 208A41 41 0 1 0 246 126ZM246 132A35 35 0 1 1 246 202A35 35 0 1 1 246 132Z"],
          ["lead", "M286 246L270 204"],
        ],
      },
    ],
  },
])
