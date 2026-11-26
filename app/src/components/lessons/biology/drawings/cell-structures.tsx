import { processDrawing } from '../AnatomyBoard'

export default processDrawing("Plant and microbial cells", [
  {
    outline: [
      ["green", "M61 57Q155 41 255 59L268 181Q221 223 66 209Q54 162 61 57Z"],
      ["paper", "M68 66Q157 53 245 68L255 175Q206 208 75 198Q68 147 68 66Z"],
      ["blue", "M124 88Q168 75 225 104Q244 132 233 159Q203 195 129 181Q102 167 111 131Z"],
    ],
    parts: [
      {
        cue: 'part-0-0', label: "Cellulose wall", at: [18,34], tip: [84,53], align: 'start',
        strokes: [
          ["lead", "M88 37L85 51"],
        ],
      },
      {
        cue: 'part-0-1', label: "Cytoplasm", at: [305,224], tip: [242,186], align: 'end',
        strokes: [
          ["lead", "M255 213L242 192"],
          ["green", "M83 147Q93 135 106 139Q114 155 99 169Q84 173 79 160Z"],
        ],
      },
      {
        cue: 'part-1-0', label: "Mitochondrion", at: [13,235], tip: [96,97], align: 'start',
        strokes: [
          ["red", "M82 93Q91 82 106 84Q124 87 117 96Q108 111 90 108Q79 106 82 93Z"],
          ["ink", "M87 97q7-8 10 0t10 0l7-6"],
          ["lead", "M62 223L83 109"],
        ],
        flows: [
          ["blue", "M72 89L89 94"],
        ],
      },
      {
        cue: 'part-1-1', label: "Chloroplast", at: [302,40], tip: [225,83], align: 'end',
        strokes: [
          ["green", "M207 79Q215 69 232 73Q248 77 244 85Q233 100 213 90Z"],
          ["ink", "M216 78h16m-15 4h18m-15 4h15"],
          ["lead", "M275 43L236 73"],
        ],
        flows: [
          ["blue", "M206 39L219 73"],
        ],
      },
    ],
  },
  {
    scenes: [2],
    outline: [
      ["paper", "M22 169Q124 138 261 156Q291 160 297 185Q279 210 226 217Q96 230 25 205Z"],
      ["green", "M36 74Q61 50 112 67Q152 61 179 83Q216 80 260 106L250 139Q208 112 176 117Q141 93 112 101Q76 83 44 111Z"],
      ["ink", "M91 62l-8 36m48-30l-7 30m52-16l-7 34m44-28l-9 38"],
    ],
    parts: [
      {
        cue: 'part-2-0', label: "Nucleoid", at: [299,252], tip: [203,187], align: 'end',
        strokes: [
          ["paper", "M170 189Q174 163 199 166Q235 156 249 181Q254 204 225 203L192 207Q178 207 170 189Z"],
          ["red", "M184 188q15-17 27-5t23-5q-8 15-19 7t-26 4"],
          ["lead", "M249 241L216 200"],
        ],
      },
      {
        cue: 'part-2-1', label: "Spirogyra|filament", at: [19,34], tip: [126,80], align: 'start',
        strokes: [
          ["ink", "M43 74q23 17 37 9t34 3t44 1t43 14t46 14"],
        ],
        flows: [
          ["blue", "M226 116L265 127"],
        ],
      },
    ],
  },
])
