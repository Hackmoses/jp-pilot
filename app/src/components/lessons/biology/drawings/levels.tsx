import { processDrawing } from '../AnatomyBoard'

export default processDrawing("Cells, tissues and living organisms", [
  {
    outline: [
      ["green", "M207 190Q208 140 208 98Q198 83 194 63Q192 39 214 28Q231 47 222 69Q215 87 216 108Q224 77 258 70Q260 96 237 117Q220 137 218 167L217 194Z"],
      ["green", "M205 133Q182 128 165 110Q157 101 151 95Q162 87 175 91Q198 101 205 118Z"],
      ["amber", "M180 225Q187 199 205 186L218 187Q244 202 251 225Q249 249 216 253Q185 252 180 225Z"],
      ["ink", "M200 251l-10 15m25-14l-3 16m12-16l8 14m-26-53Q215 195 230 216Q239 236 221 246Q198 244 198 231ZM210 224Q218 208 226 224Q229 236 216 239"],
      ["zoom", "M93 93L165 101M93 157L180 119"],
      ["paper", "M23 81H97V163H23Z"],
      ["ink", "M24 109H96M24 136H96M46 82v81m24-81v81"],
    ],
    parts: [
      {
        cue: 'part-0-0', label: "Cell", at: [16,61], tip: [58,121], align: 'start',
        strokes: [
          ["green", "M46 108H71V136H46Z"],
          ["ink", "M55 120a4 4 0 1 0 8 0a4 4 0 1 0-8 0Z"],
        ],
      },
      {
        cue: 'part-0-1', label: "Epidermal|tissue", at: [16,191], tip: [79,111], align: 'start',
        strokes: [
          ["lead", "M81 180L77 160"],
        ],
        flows: [
          ["blue", "M59 123H84"],
        ],
      },
      {
        cue: 'part-0-2', label: "Leaf organ", at: [301,104], tip: [243,91], align: 'end',
        strokes: [
          ["lead", "M264 98L247 91"],
        ],
        flows: [
          ["blue", "M88 113Q118 108 152 106"],
        ],
      },
      {
        cue: 'part-0-3', label: "Shoot system", at: [19,24], tip: [211,46], align: 'start',
        strokes: [
          ["lead", "M112 22L207 35"],
        ],
        flows: [
          ["blue", "M171 103Q198 91 208 62"],
        ],
      },
      {
        cue: 'part-1-0', label: "Onion bulb", at: [41,249], tip: [213,226], align: 'start',
        strokes: [
          ["lead", "M101 241L181 227"],
        ],
      },
      {
        cue: 'part-2-0', label: "Growth towards|light", at: [302,18], tip: [223,47], align: 'end',
        strokes: [
          ["amber", "M273 18a9 9 0 1 0 18 0a9 9 0 1 0-18 0Z"],
        ],
        flows: [
          ["blue", "M218 95Q225 69 249 54"],
        ],
        motion: [
          ["green", "M216 108Q208 87 206 65Q207 54 218 48Q224 68 215 87L221 108Z", "M216 108Q215 88 222 70Q226 56 239 54Q236 73 227 84L221 108Z"],
        ],
      },
    ],
  },
])
