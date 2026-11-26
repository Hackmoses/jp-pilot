import { processDrawing } from '../AnatomyBoard'

export default processDrawing("Sensing light, sound, touch and water", [
  {
    outline: [
      ["paper", "M52 167Q84 145 115 130Q134 88 177 84Q191 54 216 65Q241 78 221 106Q255 129 266 165Q265 204 213 220Q153 233 98 207Z"],
      ["ink", "M60 164q-9 11 1 17m26 2l39 4m-40-15l35-3M140 135a5 5 0 1 0 10 0a5 5 0 1 0-10 0Z"],
    ],
    parts: [
      {
        cue: 'part-1-0', label: "Cochlea", at: [306,38], tip: [195,123], align: 'end',
        strokes: [
          ["zoom", "M204 98L249 57M213 120L269 99"],
          ["amber", "M213 75Q224 51 248 60Q273 70 269 89Q266 106 245 108Q221 103 222 87Q225 74 245 75Q257 80 252 91Q248 97 239 93Q231 88 242 83"],
          ["ink", "M194 96Q189 114 201 124L177 133"],
        ],
        flows: [
          ["blue", "M208 81Q199 93 201 107Q204 121 184 129"],
        ],
      },
      {
        cue: 'part-1-1', label: "Vibrissae", at: [19,244], tip: [112,169], align: 'start',
        strokes: [
          ["ink", "M122 156Q75 146 19 145M117 165Q64 159 16 174M119 173Q62 181 24 202M120 180Q87 202 53 221"],
          ["lead", "M79 235L109 181"],
        ],
        flows: [
          ["blue", "M22 176Q70 158 113 166"],
        ],
      },
    ],
  },
  {
    scenes: [0,2],
    outline: [
      ["blue", "M19 66Q70 49 112 67Q175 92 234 68Q270 57 299 71V164Q243 155 215 173Q146 188 101 164Q61 154 19 169Z"],
      ["amber", "M19 174Q64 148 105 172Q157 202 214 175Q252 159 300 167V256H19Z"],
    ],
    parts: [
      {
        cue: 'part-0-0', label: "Euglena eyespot", at: [19,31], tip: [102,102], align: 'start',
        strokes: [
          ["green", "M63 123Q74 93 113 90Q140 95 135 108Q117 129 79 139Z"],
          ["red", "M114 95a5 5 0 1 0 10 0a5 5 0 1 0-10 0Z"],
          ["ink", "M130 100Q152 82 171 94T212 95"],
        ],
        flows: [
          ["amber", "M77 61L111 93"],
          ["blue", "M149 114Q180 113 219 94"],
        ],
      },
      {
        cue: 'part-2-0', label: "Hydrotropism", at: [303,239], tip: [205,209], align: 'end',
        strokes: [
          ["green", "M219 171Q211 142 219 123L228 120Q233 138 225 167Q224 189 211 208Q190 231 156 229L158 222Q192 218 206 199Z"],
          ["blue", "M131 238q18-14 29-1q-9 13-29 1Zm43 9q14-12 25-4q-9 12-25 4Z"],
        ],
        flows: [
          ["blue", "M225 165Q219 189 202 205Q182 224 155 227"],
        ],
      },
    ],
  },
])
