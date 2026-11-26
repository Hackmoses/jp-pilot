import { processDrawing } from '../AnatomyBoard'

export default processDrawing("Populations, sampling and dispersal", [
  {
    outline: [
      ["paper", "M18 156Q70 140 107 158Q154 177 193 163Q238 142 302 147V249H18Z"],
      ["amber", "M30 219Q38 176 67 155Q94 146 115 181Q130 203 134 219Z"],
      ["ink", "M52 214q8-20 21-18q9 0 17 14m-55 12h107"],
    ],
    parts: [
      {
        cue: 'part-0-0', label: "One colony", at: [16,244], tip: [81,202], align: 'start',
        strokes: [
          ["amber", "M58 203l6-3m5 10l6-3m6-4l6 1m8 7l5-2m-43 5l4-2"],
        ],
      },
      {
        cue: 'part-0-1', label: "Crowding", at: [302,225], tip: [113,220], align: 'end',
        strokes: [
          ["ink", "M47 211l4-2m9 4l4-1m15 0l3-3m8 4l4-2m12 3l5-2"],
          ["lead", "M234 223L132 220"],
        ],
      },
      {
        cue: 'part-1-0', label: "Quadrat", at: [302,117], tip: [231,187], align: 'end',
        strokes: [
          ["ink", "M178 179L265 160L290 194L193 218ZM196 175L213 214M218 170L241 205M242 166L268 199M186 196L277 175"],
          ["green", "M193 205l-4-12l10 6l3-14l6 16ZM234 182L231 168L239 173L247 165L244 180ZM255 194L252 184L259 187L265 176L269 193Z"],
        ],
      },
      {
        cue: 'part-2-0', label: "Winged termites", at: [17,55], tip: [146,92], align: 'start',
        strokes: [
          ["green", "M103 133q12-15 21-14q-4 10-21 15Zm38-28q9-14 20-12q-5 8-20 12Zm26-23q7-13 19-12q-4 9-19 12Zm30 15q9-15 19-13q-5 10-19 13Zm25-39q12-16 21-13q-5 9-21 13Z"],
        ],
        flows: [
          ["blue", "M104 168Q137 103 195 87L250 59"],
        ],
      },
      {
        cue: 'part-2-1', label: "Some escape", at: [307,28], tip: [249,61], align: 'end',
        strokes: [
          ["paper", "M204 119Q218 104 234 106Q245 92 257 98L271 103Q259 116 244 118L221 128Z"],
        ],
        flows: [
          ["blue", "M157 110Q216 59 274 38"],
        ],
      },
    ],
  },
])
