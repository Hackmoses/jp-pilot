import { processDrawing } from '../AnatomyBoard'

export default processDrawing("Where and how photosynthesis happens", [
  {
    outline: [
      ["green", "M23 72Q86 43 164 58Q225 66 297 72L297 86Q207 98 153 83Q88 76 23 94Z"],
      ["paper", "M23 94Q88 76 153 83Q207 98 297 86L297 134Q219 149 186 139L166 136Q89 128 23 147Z"],
      ["green", "M23 147Q92 132 155 136L152 147Q94 142 23 160ZM181 139Q238 144 297 134V146Q232 157 184 151Z"],
      ["green", "M29 95q15-6 24 2l-5 31q-11 16-23 6ZM60 88q14-6 24 4l-4 34q-14 9-23 4ZM92 86q14-4 24 2l-2 39q-13 4-24-1ZM122 87q14-4 23 2l3 33q-12 9-26 1ZM203 96q18-2 29 2l-5 31q-12 7-24 3ZM245 97q21 0 35-5l-5 33q-14 9-28 5Z"],
      ["green", "M143 141Q151 130 163 137Q169 149 155 156ZM177 138Q188 130 194 143Q184 158 172 151Z"],
      ["paper", "M143 98Q169 79 191 103Q208 137 169 135Q144 129 143 98Z"],
      ["blue", "M148 103Q168 90 190 103L185 116Q163 122 149 114Z"],
      ["green", "M152 122Q165 116 187 118Q183 136 160 131Z"],
      ["green", "M44 221C39 193 82 183 126 186C168 185 244 184 260 210C284 239 245 255 208 252C161 258 63 260 44 221Z"],
      ["green", "M52 220C47 202 85 191 124 194C162 192 238 189 253 212C272 232 237 249 203 244C157 251 63 250 52 220Z"],
      ["ink", "M79 209h26m-26 5h26m-26 5h26m-26 5h26m17-23h27m-27 5h27m-27 5h27m-27 5h27m-44 4l17-11"],
    ],
    parts: [
      {
        cue: 'part-0-0', label: "Leaf section", at: [17,40], tip: [76,94], align: 'start',
        strokes: [
          ["lead", "M33 44L52 79"],
        ],
        flows: [
          ["blue", "M157 176L166 151Q168 129 131 115"],
        ],
      },
      {
        cue: 'part-0-c', label: "CO₂ in", at: [20, 169], tip: [163, 150], align: 'start',
        strokes: [
          ["lead", "M66 170L143 171"],
        ],
      },
      {
        cue: 'part-0-w', label: "Xylem", at: [302,36], tip: [175,105], align: 'end',
        strokes: [
          ["lead", "M258 40L186 96"],
        ],
        flows: [
          ["blue", "M271 98Q222 102 187 107"],
        ],
      },
      {
        cue: 'part-0-1', label: "Light", at: [59,19], tip: [91,90], align: 'start',
        strokes: [
          ["zoom", "M96 107H119V125H96ZM96 125L64 193M119 125L227 185"],
        ],
        flows: [
          ["amber", "M92 23L102 83"],
        ],
      },
      {
        cue: 'part-1-0', label: "Chloroplast", at: [21,190], tip: [82,217], align: 'start',
        flows: [
          ["blue", "M190 164L171 150Q168 139 151 133"],
          ["green", "M221 225Q235 207 207 201Q176 198 169 219Q175 240 205 231"],
        ],
      },
      {
        cue: 'part-1-1', label: "Glucose / starch", at: [304,270], tip: [233,230], align: 'end',
        flows: [
          ["green", "M216 232L258 242"],
        ],
      },
      {
        cue: 'part-1-o', label: "O₂ out", at: [298,173], tip: [178,151], align: 'end',
        flows: [
          ["blue", "M144 127Q161 129 171 148L197 175"],
        ],
      },
    ],
  },
  {
    scenes: [2],
    outline: [
      ["paper", "M47 135Q73 118 110 123H256Q290 127 279 165L262 197Q169 224 63 197L45 170Z"],
      ["ink", "M51 154Q158 172 274 154M64 196Q171 215 258 195"],
      ["green", "M91 167Q146 109 222 139Q192 190 103 185Z"],
      ["ink", "M81 186L203 144M118 173L115 150M147 162L151 140M163 157L184 170"],
    ],
    parts: [
      {
        cue: 'part-2-0', label: "Warm-water rinse", at: [26,107], tip: [90,155], align: 'start',
        flows: [
          ["blue", "M52 126L76 153"],
        ],
      },
      {
        cue: 'part-2-1', label: "Iodine", at: [298,69], tip: [189,143], align: 'end',
        strokes: [
          ["ink", "M248 73L263 54L271 60L257 81M247 74L209 119L201 122L204 113L242 68Z"],
          ["shade", "M142 160Q153 141 169 146Q172 158 156 170ZM174 160Q187 142 207 144Q202 155 184 163Z"],
        ],
        flows: [
          ["amber", "M204 117L182 142"],
        ],
      },
    ],
  },
])
