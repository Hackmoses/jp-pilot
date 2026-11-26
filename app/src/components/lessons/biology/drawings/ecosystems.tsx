import { processDrawing } from '../AnatomyBoard'

export default processDrawing("Ecosystems, climate and forest habitats", [
  {
    outline: [
      ["amber", "M15 167Q90 162 126 174Q189 178 220 161Q264 145 305 157V258H15Z"],
      ["ink", "M17 211Q65 208 107 222Q147 235 197 212Q257 183 304 201M16 230Q61 226 119 240Q152 249 202 230Q255 202 304 220"],
      ["blue", "M14 160Q48 142 84 153Q110 158 136 175Q89 190 47 180Q26 176 14 180Z"],
      ["green", "M168 170Q176 118 169 76L185 75Q192 110 189 168L205 179Q188 183 179 175Q160 182 151 177ZM224 162L226 83H236L238 159L253 169L235 168L228 165L217 170Z"],
    ],
    parts: [
      {
        cue: 'part-0-0', label: "Pond community", at: [18,126], tip: [78,162], align: 'start',
        strokes: [
          ["green", "M45 166L47 143m0 13l-10-10m10 10l11-12M103 171l-7-17m7 17l12-14"],
          ["paper", "M65 169q10-11 22-5l10-6l-1 6l3 8l-12-3q-13 7-22 0z"],
        ],
      },
      {
        cue: 'part-0-1', label: "Edaphic factors", at: [16,248], tip: [147,208], align: 'start',
        strokes: [
          ["lead", "M94 238L146 218"],
        ],
        flows: [
          ["blue", "M138 178Q145 190 146 219"],
        ],
      },
      {
        cue: 'part-1-0', label: "Rainforest", at: [305,48], tip: [184,74], align: 'end',
        strokes: [
          ["green", "M120 85Q106 71 124 63Q131 48 152 54Q165 35 181 52Q198 43 208 57Q229 59 222 78Q213 95 192 88Q168 97 153 90Q133 97 120 85ZM192 75Q198 54 217 60Q227 46 240 57Q261 44 272 66Q283 75 265 90Q242 96 226 84Z"],
        ],
      },
      {
        cue: 'part-1-1', label: "Lithosphere", at: [303,252], tip: [216,231], align: 'end',
        strokes: [
          ["lead", "M231 243L217 230"],
        ],
      },
      {
        cue: 'part-2-0', label: "Rainfall", at: [19,51], tip: [49,95], align: 'start',
        strokes: [
          ["paper", "M16 68Q19 57 30 61Q36 50 48 61Q68 53 74 67Q65 80 20 77Z"],
        ],
        flows: [
          ["blue", "M47 79L47 146"],
        ],
      },
      {
        cue: 'part-2-1', label: "CFC leak", at: [301,127], tip: [277,129], align: 'end',
        strokes: [
          ["paper", "M267 124H291V157H267ZM267 136H291Z"],
        ],
        flows: [
          ["blue", "M291 145Q306 134 297 114"],
        ],
      },
    ],
  },
])
