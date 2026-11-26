import { processDrawing } from '../AnatomyBoard'

export default processDrawing("Water and nutrient cycling in soil", [
  {
    outline: [
      ["paper", "M18 124Q83 104 119 130Q155 149 197 120Q237 112 304 130V257H18Z"],
      ["blue", "M18 134Q72 119 114 143Q96 158 44 161H18Z"],
      ["amber", "M121 142Q167 164 199 127Q240 119 304 136V257H18V165Q82 169 121 142Z"],
      ["ink", "M18 186Q84 188 112 168Q141 164 169 176Q226 187 305 162M18 218Q80 227 121 207Q159 200 174 213Q239 228 307 203"],
      ["green", "M207 124Q215 89 211 63Q188 72 176 56Q190 47 210 56Q227 36 245 48Q241 69 216 68Q221 98 215 124ZM209 127Q213 145 221 158Q224 171 239 176M209 130Q193 142 187 158M215 144L239 150"],
    ],
    parts: [
      {
        cue: 'part-0-0', label: "Evaporation", at: [20,83], tip: [74,126], align: 'start',
        flows: [
          ["blue", "M68 129Q62 96 68 65L93 46"],
        ],
      },
      {
        cue: 'part-0-1', label: "Condensation", at: [102,22], tip: [106,54],
        strokes: [
          ["paper", "M41 61Q41 46 61 46Q73 30 92 39Q110 34 125 47Q146 47 148 62Q136 74 60 72Q41 73 41 61Z"],
        ],
        flows: [
          ["blue", "M133 73Q150 94 140 113L128 137"],
        ],
      },
      {
        cue: 'part-1-0', label: "Nitrogen fixation", at: [309,77], tip: [220,147], align: 'end',
        strokes: [
          ["red", "M218 148a5 5 0 1 0 10 0a5 5 0 1 0-10 0ZM185 151a4 4 0 1 0 8 0a4 4 0 1 0-8 0Z"],
        ],
        flows: [
          ["blue", "M252 84Q243 111 241 130Q234 146 223 149"],
        ],
      },
      {
        cue: 'part-1-1', label: "Nitrification", at: [303,193], tip: [205,174], align: 'end',
        flows: [
          ["blue", "M227 158Q219 176 190 183L163 188"],
        ],
      },
      {
        cue: 'part-2-0', label: "Sandy soil", at: [22,242], tip: [63,194], align: 'start',
        strokes: [
          ["ink", "M37 178h3m9 7h3m13-6h4m14 8h3m5 8h4m-48-1h4m16 13h3m10-3h4"],
        ],
        flows: [
          ["blue", "M62 157L61 206L62 227"],
        ],
      },
      {
        cue: 'part-2-1', label: "Fallow", at: [301,104], tip: [277,123], align: 'end',
        strokes: [
          ["green", "M268 129Q264 115 256 108Q270 111 275 123Q283 108 296 111Q291 121 277 130Z"],
          ["ink", "M276 129l-1 12m1-8l-7 5m6-5l9 5"],
        ],
      },
    ],
  },
])
