import { processDrawing } from '../AnatomyBoard'

export default processDrawing("Freshwater, marine and estuary habitats", [
  {
    outline: [
      ["amber", "M15 87Q48 56 92 81Q119 98 134 118Q168 144 196 152Q254 160 308 139V240Q251 269 199 258Q120 233 16 253Z"],
      ["blue", "M16 91Q55 81 81 103Q107 127 127 134Q159 135 183 147Q224 161 308 141V219Q250 239 195 225Q158 216 115 188Q74 150 46 148L16 153Z"],
      ["ink", "M18 107Q64 99 90 132Q106 151 136 155M170 174Q230 195 303 170M205 207Q252 221 300 205"],
    ],
    parts: [
      {
        cue: 'part-0-0', label: "Land", at: [19,34], tip: [50,76], align: 'start',
        strokes: [
          ["green", "M53 79L52 52Q38 47 32 34Q44 31 52 40Q62 23 74 28Q72 46 56 53L59 78Z"],
        ],
      },
      {
        cue: 'part-0-1', label: "Aquatic habitat", at: [20,185], tip: [70,135], align: 'start',
        strokes: [
          ["lead", "M65 169L68 146"],
        ],
      },
      {
        cue: 'part-1-0', label: "Freshwater", at: [20,117], tip: [88,126], align: 'start',
        flows: [
          ["blue", "M39 106Q88 110 114 149L151 163"],
        ],
      },
      {
        cue: 'part-1-1', label: "Estuary", at: [167,136], tip: [166,175],
        strokes: [
          ["lead", "M168 141L168 162"],
        ],
      },
      {
        cue: 'part-1-2', label: "Seawater", at: [306,155], tip: [248,183], align: 'end',
        strokes: [
          ["ink", "M229 205Q246 195 261 200L273 192L271 200L280 207L263 205Q245 215 229 205Z"],
        ],
        flows: [
          ["blue", "M291 175Q218 191 175 172"],
        ],
      },
      {
        cue: 'part-2-0', label: "Tide", at: [305,249], tip: [262,221], align: 'end',
        flows: [
          ["blue", "M164 191Q227 224 296 195"],
        ],
      },
      {
        cue: 'part-2-1', label: "Mangrove roots", at: [309,69], tip: [231,126], align: 'end',
        strokes: [
          ["green", "M206 83Q220 68 240 81Q257 67 274 82Q268 96 242 95Q219 104 206 83Z"],
          ["ink", "M238 94V124Q232 143 214 153M240 124Q247 143 270 147M234 114Q216 128 203 141M241 113Q255 118 265 135"],
        ],
      },
    ],
  },
])
