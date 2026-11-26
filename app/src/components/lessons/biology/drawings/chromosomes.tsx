import { processDrawing } from '../AnatomyBoard'

export default processDrawing("DNA, chromosomes and X-linked inheritance", [
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
      {
        cue: 'part-1-1', label: "Colour blindness|2 of 4 expected", at: [308,253], tip: [251,198], align: 'end',
        strokes: [
          ["paper", "M208 156H280V229H208ZM244 157V229M208 193H280"],
          ["red", "M209 194H243V227H209ZM245 194H279V227H245Z"],
          ["ink", "M216 170l14 14m0-14l-14 14m35-14l14 14m0-14l-14 14m-35 18l9 9l8-9m-8 9v7m26-16l9 9l8-9m-8 9v7"],
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
