import { processDrawing } from '../AnatomyBoard'

export default processDrawing("Blood components and clotting", [
  {
    outline: [
      ["red", "M25 84Q65 63 124 72Q165 83 183 76L199 68L203 88L214 91L220 70Q264 61 298 79V179Q251 190 218 181Q160 169 118 180Q63 193 25 170Z"],
      ["paper", "M25 94Q64 75 122 83Q166 94 186 86L199 81L207 100L216 98L223 83Q262 71 298 89V168Q253 183 220 171Q165 157 116 169Q66 182 25 160Z"],
      ["ink", "M25 84v86m273-91v100"],
    ],
    parts: [
      {
        cue: 'part-0-0', label: "Plasma", at: [24,36], tip: [59,139], align: 'start',
        strokes: [
          ["lead", "M61 39L68 124"],
        ],
        flows: [
          ["blue", "M33 145Q99 156 143 138Q186 125 230 148Q264 150 292 135"],
        ],
      },
      {
        cue: 'part-0-1', label: "Erythrocyte", at: [23,212], tip: [121,120], align: 'start',
        strokes: [
          ["red", "M46 113a15 8 0 1 0 30 0a15 8 0 1 0-30 0ZM95 117a23 12 0 1 0 46 0a23 12 0 1 0-46 0ZM237 127a19 10 0 1 0 38 0a19 10 0 1 0-38 0ZM149 146a18 7 0 1 0 36 0a18 7 0 1 0-36 0Z"],
          ["ink", "M104 118Q119 127 133 117M243 127Q255 133 270 124M50 113q9 6 18 0m86 32q10 5 22 0"],
          ["lead", "M92 200L110 130"],
        ],
        flows: [
          ["blue", "M82 103Q96 105 113 112"],
        ],
      },
      {
        cue: 'part-1-0', label: "Platelet plug", at: [299,35], tip: [204,95], align: 'end',
        strokes: [
          ["amber", "M191 89l5-9l7 9l-2 8l-9 1ZM200 93l8-6l8 2l2 8l-13 4ZM213 93l5-9l7 5l-1 9l-7 5ZM179 125l7-8l8 4l-2 8l-9 1ZM155 104l7-7l9 3l-4 8l-7 1ZM241 107l6-5l7 3l-3 7l-7 2Z"],
          ["lead", "M243 36L214 83"],
        ],
        flows: [
          ["blue", "M177 132Q195 118 207 98"],
          ["blue", "M247 109L219 98"],
        ],
      },
      {
        cue: 'part-2-0', label: "Fibrin mesh", at: [299,211], tip: [214,111], align: 'end',
        strokes: [
          ["ink", "M184 86l36 28m-25-32l28 20m-25-15l10 29m9-36l-6 35m15-36l-27 28m20-18l-24 5m-8 9l36-12"],
          ["lead", "M255 200L217 113"],
        ],
      },
    ],
  },
])
