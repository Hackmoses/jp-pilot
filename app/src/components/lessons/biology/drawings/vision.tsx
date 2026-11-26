import { processDrawing } from '../AnatomyBoard'

export default processDrawing("The eye, vision and common defects", [
  {
    outline: [
      ["paper", "M96 80Q136 45 209 56Q266 61 282 102Q301 138 273 173Q236 204 170 196Q122 192 97 167Q63 149 61 124Q58 97 96 80Z"],
      ["blue", "M96 80Q72 107 79 141Q86 156 97 167Q60 151 61 124Q58 97 96 80Z"],
      ["ink", "M105 85Q80 111 101 120M102 133Q85 143 105 163M262 83Q298 111 275 150Q263 171 249 177M281 140L308 160L302 175L274 157"],
      ["paper", "M115 97Q143 126 115 153Q93 126 115 97Z"],
    ],
    parts: [
      {
        cue: 'part-0-0', label: "Iris", at: [24,72], tip: [98,113], align: 'start',
        strokes: [
          ["lead", "M55 70L95 111"],
        ],
        motion: [
          ["green", "M100 91Q98 107 101 118M100 154Q96 143 100 134", "M100 91Q98 107 101 123M100 154Q96 143 100 130"],
        ],
      },
      {
        cue: 'part-0-1', label: "Retinal rods", at: [305,43], tip: [264,104], align: 'end',
        strokes: [
          ["zoom", "M277 102L272 64M287 106L299 66"],
          ["red", "M269 58h29v13h-29z"],
          ["ink", "M274 65v-11m7 11v-11m7 11v-11m6 11v-11"],
        ],
      },
      {
        cue: 'part-1-0', until: 'part-1-1', label: "Long-sighted focus", at: [21,227], tip: [288,124], align: 'start',
        flows: [
          ["blue", "M43 107H82L114 106L286 125"],
          ["blue", "M43 144H82L114 143L286 125"],
        ],
      },
      {
        cue: 'part-1-1', label: "Convex lens", at: [16,256], tip: [48,124], align: 'start',
        strokes: [
          ["green", "M46 94Q25 122 46 154Q62 123 46 94Z"],
        ],
        flows: [
          ["blue", "M15 102L44 102L110 114L278 125"],
          ["blue", "M15 146L44 146L110 137L278 125"],
        ],
      },
      {
        cue: 'part-2-0', label: "Cataract", at: [306,230], tip: [113,123], align: 'end',
        strokes: [
          ["lead", "M260 223L120 138"],
          ["amber", "M115 109q14 15 0 33q-12-12 0-33Z"],
        ],
      },
      {
        cue: 'part-2-1', label: "Astigmatism", at: [111,36], tip: [84,91], align: 'start',
        strokes: [
          ["lead", "M110 43L79 91"],
          ["zoom", "M91 78Q62 103 63 124Q65 146 96 169"],
        ],
      },
    ],
  },
])
