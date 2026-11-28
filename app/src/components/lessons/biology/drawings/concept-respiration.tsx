// OpenStax Biology 2e, Figs. 7.4, 7.6–7.7, 7.10–7.11 and 7.16–7.17.
// ATP, mitochondrion, glycolysis, Krebs cycle and fermentation.
import { processDrawing } from '../AnatomyBoard'

export default processDrawing("Cellular respiration and fermentation", [
  {
    outline: [
      ["paper","M88 152Q103 114 167 115Q234 112 255 145Q280 184 248 209Q224 232 170 227Q106 221 88 193Q78 178 88 152Z"],
      ["red","M97 156Q112 123 168 123Q223 121 244 147Q268 179 242 202Q217 221 169 218Q116 214 98 190Q87 175 97 156Z"],
      ["ink","M104 144q1 19 11 29q6 7 10 1q4-5 0-12l-9-23m21-10q2 16 14 27q7 6 11 0q4-7-3-14l-7-17m25-2q3 13 11 22q7 7 13 1q3-5-4-12l-5-9m33 13q-3 15 7 25q6 6 11 0m-2 33q-10-16-21-15q-8 1-6 8q3 8 11 15m-30 10q-7-22-17-24q-9-2-10 7q0 6 6 17m-36-7q-1-15-13-20q-9-4-11 5"],
    ],
    parts: [
      {
        cue: 'part-1-0', label: "Glucose", at: [95,33], tip: [89,51],
        strokes: [
          ["amber","M78 53l11-7 12 7v13l-12 7-11-7Z"],
          ["lead","M94 38L91 46"],
        ],
      },
      {
        cue: 'part-2-0', label: "ATP to cell work", at: [309,52], tip: [218,69],
        strokes: [
          ["amber","M189 72a5 5 0 1 0 10 0a5 5 0 1 0 -10 0ZM203 72a5 5 0 1 0 10 0a5 5 0 1 0 -10 0ZM217 72a5 5 0 1 0 10 0a5 5 0 1 0 -10 0Z"],
          ["ink","M199 72h4m10 0h4"],
          ["lead","M267 55L226 70"],
        ],
      },
      {
        cue: 'part-3-0', label: "Glycolysis|in cytosol", at: [309,98], tip: [159,75],
        strokes: [
          ["lead","M231 102L168 78"],
        ],
        flows: [
          ["amber","M112 70Q144 68 178 72"],
        ],
      },
      {
        cue: 'part-4-0', label: "Mitochondrion", at: [7,219], tip: [98,201],
        strokes: [
          ["lead","M73 221L99 204"],
        ],
        flows: [
          ["red","M111 84Q135 96 156 123"],
        ],
      },
      {
        cue: 'part-9-0', label: "Krebs cycle|in matrix", at: [212,247], tip: [178,179],
        strokes: [
          ["lead","M205 234L190 195"],
        ],
        flows: [
          ["red","M158 185Q149 174 164 166Q185 158 194 174Q200 190 179 195Q169 197 162 191"],
        ],
      },
      {
        cue: 'part-10-0', label: "NADH", at: [307,166], tip: [213,173],
        strokes: [
          ["lead","M267 169L227 170"],
        ],
        flows: [
          ["amber","M195 181Q207 180 222 171"],
        ],
      },
    ],
  },
  {
    scenes: [5,14],
    outline: [
      ["paper","M45 58Q97 39 153 63Q193 57 275 69Q293 125 277 207Q219 226 160 214Q98 228 45 203Q28 140 45 58Z"],
    ],
    parts: [
      {
        cue: 'part-3-0', label: "Glycolysis", at: [19,40], tip: [104,106],
        strokes: [
          ["amber","M65 98l10-6 11 6v12l-11 6-10-6ZM130 97l8 7-8 7-7-7ZM151 97l8 7-8 7-7-7Z"],
          ["lead","M78 45L103 91"],
        ],
        flows: [
          ["amber","M88 104H120"],
        ],
      },
      {
        cue: 'part-2-0', label: "ATP", at: [40,184], tip: [104,162],
        strokes: [
          ["amber","M90 167a4 4 0 1 0 8 0a4 4 0 1 0 -8 0ZM103 167a4 4 0 1 0 8 0a4 4 0 1 0 -8 0ZM116 167a4 4 0 1 0 8 0a4 4 0 1 0 -8 0Z"],
          ["lead","M67 179L91 170"],
        ],
        flows: [
          ["amber","M107 116L107 153"],
        ],
      },
      {
        cue: 'part-7-0', label: "Ethanol", at: [301,231], tip: [220,146],
        strokes: [
          ["green","M211 145l10-7 11 7-11 8ZM240 145l10-7 11 7-11 8Z"],
          ["lead","M260 218L250 158"],
        ],
        flows: [
          ["green","M159 112Q189 119 208 144"],
        ],
      },
      {
        cue: 'part-6-0', label: "CO₂ bubbles", at: [308,40], tip: [237,91],
        strokes: [
          ["blue","M219 86a6 6 0 1 0 12 0a6 6 0 1 0 -12 0ZM233 98a6 6 0 1 0 12 0a6 6 0 1 0 -12 0ZM248 82a6 6 0 1 0 12 0a6 6 0 1 0 -12 0Z"],
          ["lead","M263 45L242 84"],
        ],
        flows: [
          ["blue","M175 104Q194 90 215 89"],
        ],
      },
      {
        cue: 'part-5-0', label: "Pyruvate", at: [164,80], tip: [146,104],
        strokes: [
          ["lead","M163 85L150 96"],
        ],
        flows: [
        ],
      },
    ],
  },
  {
    scenes: [8,15],
    outline: [
      ["paper","M45 58Q97 39 153 63Q193 57 275 69Q293 125 277 207Q219 226 160 214Q98 228 45 203Q28 140 45 58Z"],
    ],
    parts: [
      {
        cue: 'part-3-0', label: "Glycolysis", at: [19,40], tip: [104,106],
        strokes: [
          ["amber","M65 98l10-6 11 6v12l-11 6-10-6ZM130 97l8 7-8 7-7-7ZM151 97l8 7-8 7-7-7Z"],
          ["lead","M78 45L103 91"],
        ],
        flows: [
          ["amber","M88 104H120"],
        ],
      },
      {
        cue: 'part-2-0', label: "ATP", at: [40,184], tip: [104,162],
        strokes: [
          ["amber","M90 167a4 4 0 1 0 8 0a4 4 0 1 0 -8 0ZM103 167a4 4 0 1 0 8 0a4 4 0 1 0 -8 0ZM116 167a4 4 0 1 0 8 0a4 4 0 1 0 -8 0Z"],
          ["lead","M67 179L91 170"],
        ],
        flows: [
          ["amber","M107 116L107 153"],
        ],
      },
      {
        cue: 'part-8-0', label: "Lactate", at: [301,231], tip: [220,146],
        strokes: [
          ["green","M211 145l10-7 11 7-11 8ZM240 145l10-7 11 7-11 8Z"],
          ["lead","M260 218L250 158"],
        ],
        flows: [
          ["green","M159 112Q189 119 208 144"],
        ],
      },
      {
        cue: 'part-5-0', label: "Pyruvate", at: [164,80], tip: [146,104],
        strokes: [
          ["lead","M163 85L150 96"],
        ],
        flows: [
        ],
      },
    ],
  },
  {
    scenes: [16],
    outline: [
      ["paper","M61 116l22-16 24 10-4 27-27 6Z"],
      ["ink","M69 103L58 83L71 63L97 66L110 88L98 105M71 63L69 44L91 35L109 52L97 66M107 111L122 98L141 111"],
      ["amber","M138 110a13 13 0 1 0 26 0a13 13 0 1 0 -26 0ZM170 110a13 13 0 1 0 26 0a13 13 0 1 0 -26 0ZM202 110a13 13 0 1 0 26 0a13 13 0 1 0 -26 0Z"],
      ["ink","M164 110H170M196 110H202M90 143l5 17m-31-25l-8 18"],
    ],
    parts: [
      {
        cue: 'part-2-0', label: "ATP", at: [160,227], tip: [183,121],
        strokes: [
          ["lead","M160 214L182 124"],
        ],
      },
      {
        cue: 'part-12-0', label: "Three phosphates", at: [200,59], tip: [216,113],
        strokes: [
          ["lead","M204 66L215 94"],
        ],
      },
      {
        cue: 'part-11-0', label: "Adenosine", at: [57,200], tip: [80,126],
        strokes: [
          ["lead","M63 186L78 146"],
        ],
      },
    ],
  },
])
