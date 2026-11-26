import { processDrawing } from '../AnatomyBoard'

export default processDrawing("Insect growth and feeding", [
  {
    outline: [
      ["paper", "M20 178Q68 168 109 179Q163 189 207 172Q246 158 300 174V244H20Z"],
      ["green", "M35 179Q56 118 129 100Q129 155 70 185Z"],
      ["ink", "M30 188Q69 171 113 116"],
    ],
    parts: [
      {
        cue: 'part-0-0', label: "Egg", at: [25,103], tip: [78,130], align: 'start',
        strokes: [
          ["amber", "M64 130a7 10 0 1 0 14 0a7 10 0 1 0-14 0ZM81 137a5 7 0 1 0 10 0a5 7 0 1 0-10 0Z"],
        ],
      },
      {
        cue: 'part-0-1', label: "Larva", at: [22,232], tip: [118,185], align: 'start',
        strokes: [
          ["green", "M84 181Q85 164 99 169Q109 157 121 169Q135 164 145 181Q141 196 113 195Q96 194 84 181Z"],
          ["ink", "M99 171l-2 15m14-18l-1 18m12-16l-1 20m11-16l-2 14"],
        ],
        flows: [
          ["blue", "M81 140Q101 146 110 170"],
        ],
      },
      {
        cue: 'part-0-2', label: "Pupa", at: [176,239], tip: [189,183],
        strokes: [
          ["amber", "M189 163Q208 169 205 187Q201 204 192 209Q176 198 178 181Q179 171 189 163Z"],
          ["ink", "M181 181l20 6m-21 3l18 6m-15 1l12 6"],
        ],
        flows: [
          ["blue", "M145 186L177 186"],
        ],
      },
      {
        cue: 'part-0-3', label: "Adult", at: [302,45], tip: [253,99], align: 'end',
        strokes: [
          ["amber", "M235 128Q230 110 246 99L257 78L265 80L256 107Q242 130 235 128Z"],
          ["blue", "M251 101Q227 60 200 70Q205 95 248 108ZM252 104Q269 67 296 68Q299 96 254 109Z"],
          ["ink", "M253 104l27 10l13 24m-41-31l9 28m-10-30l-20 22l-22 0m43-24l-4-26m15 3l15-11m-20 13l1-21"],
        ],
        flows: [
          ["blue", "M205 178Q223 151 237 124"],
        ],
      },
      {
        cue: 'part-1-0', label: "Shed cuticle", at: [14,152], tip: [115,163], align: 'start',
        strokes: [
          ["zoom", "M103 164Q96 148 111 149Q143 147 152 166"],
        ],
        flows: [
          ["blue", "M110 163L123 148"],
        ],
      },
    ],
  },
  {
    scenes: [2],
    outline: [
      ["green", "M18 173Q98 142 160 166Q233 160 303 186Q203 250 96 213Z"],
      ["ink", "M19 175Q120 177 237 187"],
    ],
    parts: [
      {
        cue: 'part-2-0', label: "Chewing mandibles", at: [15,31], tip: [120,129], align: 'start',
        strokes: [
          ["amber", "M28 102Q46 62 83 68Q120 75 128 104Q132 135 104 149Q74 160 46 137Z"],
          ["ink", "M76 72L63 47m23 30l16-31M99 104h2M118 116l24 13l-18 26l5-18l-17-5m11-21l21 8l-11 15"],
        ],
        flows: [
          ["blue", "M151 163L135 135"],
        ],
      },
      {
        cue: 'part-2-1', label: "Piercing mouthparts", at: [306,44], tip: [218,147], align: 'end',
        strokes: [
          ["paper", "M244 87Q268 65 293 82Q309 101 297 119Q279 144 244 123Z"],
          ["ink", "M247 115L204 176m40-58l-28 56M258 85l-4-25m8 27l20-19M248 103h2"],
        ],
        flows: [
          ["blue", "M204 172L247 115"],
        ],
      },
    ],
  },
])
