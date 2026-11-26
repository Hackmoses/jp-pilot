import { processDrawing } from '../AnatomyBoard'

export default processDrawing("How birds fly and feed", [
  {
    outline: [
      ["paper", "M49 163Q83 136 107 132Q118 102 149 98Q190 90 206 105Q212 75 238 73Q263 69 270 91L289 96Q280 106 265 103Q262 132 228 145Q202 177 173 183Q139 183 114 174Q87 180 60 198L75 176L43 185Z"],
      ["ink", "M263 90h2M230 126Q255 122 260 104"],
    ],
    parts: [
      {
        cue: 'part-0-0', label: "Wing", at: [25,59], tip: [153,91], align: 'start',
        strokes: [
          ["lead", "M63 62L111 103"],
        ],
        flows: [
          ["blue", "M107 76Q93 113 106 147"],
        ],
        motion: [
          ["green", "M173 126Q133 104 91 49Q91 89 106 127L126 153L150 151Z", "M173 126Q121 119 54 147Q83 166 112 171L141 163L155 148Z"],
        ],
      },
      {
        cue: 'part-0-1', label: "Flight quills", at: [303,32], tip: [148,90], align: 'end',
        strokes: [
          ["zoom", "M122 95L174 54M135 105L238 62"],
          ["paper", "M169 70Q185 36 234 36Q223 66 176 74Z"],
          ["ink", "M171 75L226 41m-41 23l1-10m12 2l2-9m5 6l11 1m-24 8l11 1"],
        ],
      },
      {
        cue: 'part-2-0', label: "Talons", at: [306,219], tip: [211,190], align: 'end',
        strokes: [
          ["ink", "M184 168L177 192M211 166L212 188M137 204Q183 194 233 202Q259 204 291 191"],
        ],
        flows: [
          ["blue", "M232 195Q235 204 225 209"],
        ],
        motion: [
          ["ink", "M177 192q8 1 14 9q3 6-1 10M177 192q-7 5-9 14M212 188q11 0 17 9q3 9-4 13M212 188q-8 7-10 13", "M177 192q10 2 11 10q0 7-8 8M177 192q-8 8-5 15M212 188q13 4 12 12q-2 9-10 8M212 188q-10 9-6 14"],
        ],
      },
    ],
  },
  {
    scenes: [1],
    outline: [
      ["green", "M23 201Q64 198 106 176Q159 148 197 168Q240 182 296 164"],
      ["red", "M102 177Q102 151 124 138Q139 125 161 130Q149 145 130 151Q115 165 113 182Z"],
    ],
    parts: [
      {
        cue: 'part-1-0', label: "Nectar bill", at: [20,65], tip: [116,148], align: 'start',
        strokes: [
          ["paper", "M29 153Q39 113 66 114Q89 112 101 133L139 142L101 145Q77 171 39 165Z"],
          ["ink", "M81 130h2"],
        ],
        flows: [
          ["blue", "M95 146L132 143"],
        ],
      },
      {
        cue: 'part-1-1', label: "Seed-cracking|bill", at: [308,95], tip: [217,173], align: 'end',
        strokes: [
          ["paper", "M214 173L174 163Q203 141 220 150Q230 115 263 123Q290 131 298 157Q281 183 246 190Z"],
          ["ink", "M240 142h2m-64 22l35-4"],
          ["amber", "M179 165Q189 162 197 172Q188 181 179 165Z"],
        ],
        flows: [
          ["blue", "M212 156L192 169"],
        ],
      },
    ],
  },
])
