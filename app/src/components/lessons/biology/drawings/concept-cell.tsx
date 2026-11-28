import { processDrawing } from '../AnatomyBoard'

// Plant cell for the Biology key concept lesson bio-cell. Each part is numbered in the order
// the lesson introduces it (part-<n>-0), so a step's chapter keeps earlier parts on the page.
// Parts are listed in drawing order: the wall sits under the membrane, the vacuole under the organelles.
export default processDrawing("Plant cell and its parts", [
  {
    outline: [
      ["paper", "M102 57Q160 48 220 59Q228 140 222 216Q160 226 104 216Q96 140 102 57Z"],
    ],
    parts: [
      {
        cue: 'part-7-0', label: "Cellulose wall", at: [8,30], tip: [98,54], align: 'start',
        strokes: [
          ["green", "M96 50Q160 40 226 52Q236 140 228 224Q160 236 98 224Q88 140 96 50Z"],
          ["paper", "M102 57Q160 48 220 59Q228 140 222 216Q160 226 104 216Q96 140 102 57Z"],
          ["lead", "M58 34L96 52"],
        ],
      },
      {
        cue: 'part-1-0', label: "Cell membrane", at: [312,30], tip: [214,66], align: 'end',
        strokes: [
          ["blue", "M107 62Q160 54 215 64Q222 140 217 211Q160 220 109 211Q102 140 107 62Z"],
          ["lead", "M262 34L216 64"],
        ],
      },
      {
        cue: 'part-8-0', label: "Large|vacuole", at: [8,156], tip: [128,140], align: 'start',
        strokes: [
          ["amber", "M128 92Q166 82 200 96Q208 135 200 178Q166 190 132 178Q120 135 128 92Z"],
          ["lead", "M54 158L126 142"],
        ],
      },
      {
        cue: 'part-3-0', label: "Cytoplasm", at: [8,236], tip: [116,198], align: 'start',
        strokes: [
          ["ink", "M118 196l1 1m70 4l1 1m14-60l1 1m-96-20l1 1m4 70l1 1m82-150l1 1m-60 160l1 1"],
          ["lead", "M66 230L116 200"],
        ],
      },
      {
        cue: 'part-2-0', label: "Nucleus", at: [8,92], tip: [112,80], align: 'start',
        strokes: [
          ["red", "M112 72Q122 64 133 70Q139 82 131 92Q119 97 112 89Q107 80 112 72Z"],
          ["ink", "M118 81q3-3 6 0t-6 0"],
          ["lead", "M56 90L110 81"],
        ],
      },
      {
        cue: 'part-6-0', label: "Chloroplast", at: [312,124], tip: [206,74], align: 'end',
        strokes: [
          ["green", "M182 68Q192 62 205 66Q212 73 204 80Q192 85 183 80Q177 74 182 68Z"],
          ["ink", "M186 71h15m-14 4h14"],
          ["lead", "M270 112L208 76"],
        ],
      },
      {
        cue: 'part-5-0', label: "Mitochondrion", at: [312,236], tip: [200,200], align: 'end',
        strokes: [
          ["red", "M178 192Q186 186 198 189Q206 194 200 201Q189 206 180 201Q173 197 178 192Z"],
          ["ink", "M181 195q4-5 7 0t7 0"],
          ["lead", "M262 230L202 200"],
        ],
      },
      {
        cue: 'part-4-0', label: "Ribosomes", at: [160,262], tip: [152,206], align: 'middle',
        strokes: [
          ["ink", "M144 196l2 2m8 4l2 2m8-7l2 2m-24 9l2 2"],
          ["lead", "M156 252L152 208"],
        ],
      },
    ],
  },
])
