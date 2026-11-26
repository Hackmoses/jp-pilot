import { processDrawing } from '../AnatomyBoard'

export default processDrawing("Variation, selection and adaptation", [
  {
    outline: [
      ["blue", "M17 97Q88 85 150 105Q214 122 304 105V219Q249 236 174 224Q93 205 17 226Z"],
      ["ink", "M28 123Q73 110 112 121m112 80q41 10 68-1M15 211q62-10 109 4"],
    ],
    parts: [
      {
        cue: 'part-1-0', label: "Selected variants", at: [17,26], tip: [83,72], align: 'start',
        strokes: [
          ["paper", "M20 33H179V81H20Z"],
          ["ink", "M67 39V74M119 39V74"],
          ["shade", "M29 48h7v5h-7ZM78 48h7v5h-7Zm11 7h7v5h-7ZM129 45h7v5h-7Zm13 11h7v5h-7Zm12-9h7v5h-7Zm12 10h7v5h-7Z"],
          ["blue", "M40 48h7v5h-7Zm10 9h7v5h-7Zm-17 5h7v5h-7Zm65 0h7v5h-7Zm8-13h7v5h-7Z"],
        ],
        flows: [
          ["blue", "M29 73H173"],
        ],
      },
      {
        cue: 'part-1-1', label: "Countershading", at: [305,77], tip: [225,133], align: 'end',
        strokes: [
          ["paper", "M125 144Q153 112 195 120Q228 116 248 137L282 112L274 141L283 165L249 150Q231 168 197 171Q152 176 125 144Z"],
          ["shade", "M125 144Q153 112 195 120Q228 116 248 137L282 112L274 141Q239 141 199 144Q151 148 125 144Z"],
          ["ink", "M143 147h2m25-17q5 12-1 27"],
        ],
      },
      {
        cue: 'part-2-0', label: "Whale flipper", at: [16,263], tip: [133,196], align: 'start',
        strokes: [
          ["paper", "M35 193Q72 168 115 178Q149 188 172 179L185 163L183 180L194 187L174 188Q152 201 132 203Q109 232 101 218L109 203Q62 218 35 193Z"],
          ["lead", "M93 247L117 211"],
        ],
        flows: [
          ["blue", "M104 201L114 220"],
        ],
      },
    ],
  },
  {
    scenes: [0],
    outline: [
      ["paper", "M129 227Q114 199 97 181Q75 156 68 131Q66 116 79 111Q92 107 105 134L115 150V58Q117 44 127 49Q136 50 136 65V111L145 40Q149 27 161 33Q170 39 166 52L160 121L177 49Q181 35 191 41Q202 45 197 63L185 130L202 86Q207 74 218 81Q226 87 218 106L202 174Q198 196 177 224Z"],
    ],
    parts: [
      {
        cue: 'part-0-0', label: "PTC taste classes", at: [20,245], tip: [78,204], align: 'start',
        strokes: [
          ["amber", "M32 173H49L54 211H27ZM60 173H77L82 211H55Z"],
          ["ink", "M28 201H50M58 201H79"],
        ],
        flows: [
          ["blue", "M57 164L108 193"],
        ],
      },
      {
        cue: 'part-0-1', label: "Fingerprint ridges", at: [305,53], tip: [151,55], align: 'end',
        strokes: [
          ["zoom", "M150 53L232 60M165 61L224 95"],
          ["paper", "M219 95a40 40 0 1 0 80 0a40 40 0 1 0-80 0Z"],
          ["ink", "M231 112Q227 83 248 73Q270 63 286 83Q296 104 280 121M238 112Q234 89 253 81Q270 76 280 90Q288 108 270 119M246 115Q243 94 259 89Q272 90 273 104Q270 114 260 115"],
        ],
      },
    ],
  },
])
