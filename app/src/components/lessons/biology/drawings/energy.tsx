import { processDrawing } from '../AnatomyBoard'

export default processDrawing("Cellular respiration and fermentation", [
  {
    outline: [
      ["paper", "M26 115Q15 54 69 41Q134 20 202 46Q271 54 294 104Q314 154 286 201Q254 247 164 245Q66 251 34 203Q16 170 26 115Z"],
      ["ink", "M29 111Q18 66 74 48Q139 31 202 52Q262 62 287 102"],
      ["red", "M104 153Q89 119 120 101Q162 72 219 106Q251 124 241 156Q237 185 194 198Q142 207 113 177Z"],
      ["ink", "M115 148Q104 125 123 113Q146 100 156 116Q164 124 150 133Q135 146 151 158Q164 169 176 151Q187 130 175 120Q165 108 177 102Q199 104 218 121Q234 138 216 146Q194 150 200 166Q212 177 225 164Q204 189 182 189Q128 197 115 148Z"],
    ],
    parts: [
      {
        cue: 'part-0-0', label: "Glucose", at: [20,67], tip: [76,88], align: 'start',
        strokes: [
          ["amber", "M63 83l10-7l10 7v12l-10 7l-10-7Z"],
        ],
        flows: [
          ["blue", "M81 97Q74 119 71 135", "split"],
        ],
      },
      {
        cue: 'part-0-p', label: "Pyruvate", at: [28,163], tip: [72,140], align: 'start',
        strokes: [
          ["amber", "M64 132l5-4l5 4v6l-5 4l-5-4ZM75 136l5-4l5 4v6l-5 4l-5-4Z"],
          ["lead", "M69 149L72 142"],
        ],
        flows: [
          ["blue", "M85 140Q101 143 118 147"],
        ],
      },
      {
        cue: 'part-0-1', label: "ATP", at: [301,67], tip: [238,109], align: 'end',
        strokes: [
          ["amber", "M239 103l6-6l6 6l-6 6ZM255 92l6-6l6 6l-6 6ZM263 111l6-6l6 6l-6 6Z"],
        ],
        flows: [
          ["blue", "M219 128Q233 112 246 103"],
        ],
      },
      {
        cue: 'part-1-0', label: "Krebs cycle|in matrix", at: [37,220], tip: [143,162], align: 'start',
        strokes: [
          ["lead", "M93 204L146 167"],
        ],
        flows: [
          ["blue", "M141 125Q118 126 120 150Q123 170 143 171Q160 162 157 146Q155 130 141 125"],
        ],
      },
    ],
  },
  {
    scenes: [2],
    outline: [
      ["green", "M48 126Q38 75 91 61Q153 40 191 81Q225 118 200 167Q178 211 122 216Q67 218 48 166Z"],
      ["green", "M189 82Q192 55 221 46Q253 42 266 71Q276 102 246 120Q228 131 213 121Z"],
      ["ink", "M59 129Q46 88 88 73Q131 55 173 72"],
    ],
    parts: [
      {
        cue: 'part-2-0', label: "Yeast cell", at: [17,46], tip: [99,68], align: 'start',
        strokes: [
          ["amber", "M90 115l10-7l10 7v11l-10 7l-10-7Z"],
        ],
        flows: [
          ["blue", "M98 131Q117 145 144 137L163 117"],
        ],
      },
      {
        cue: 'part-2-1', label: "CO₂ bubbles", at: [304,221], tip: [242,170], align: 'end',
        strokes: [
          ["paper", "M205 155a9 9 0 1 0 18 0a9 9 0 1 0-18 0ZM225 173a11 11 0 1 0 22 0a11 11 0 1 0-22 0ZM250 154a7 7 0 1 0 14 0a7 7 0 1 0-14 0Z"],
        ],
        flows: [
          ["blue", "M154 122Q176 145 209 151"],
        ],
      },
      {
        cue: 'part-2-e', label: "Ethanol", at: [29,229], tip: [136,171], align: 'start',
        flows: [
          ["blue", "M147 137L143 172"],
        ],
      },
    ],
  },
])
