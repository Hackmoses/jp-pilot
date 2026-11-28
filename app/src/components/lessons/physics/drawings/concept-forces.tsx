import { processDrawing } from '../../biology/AnatomyBoard'

// OpenStax College Physics 2e §4.3 Figs. 4.5 and 4.8 (free-body forces),
// §8.5 Figs. 8.7–8.8 (sticking and momentum), §9.5 Fig. 9.21 (lever).
export default processDrawing("Inertia, forces and momentum", [
  {
    scenes: [1, 14],
    outline: [
      ["ink", "M38 177H281"],
    ],
    parts: [
      {
        cue: 'part-1-0', label: "Tray", at: [155, 94], tip: [155, 154],
        strokes: [
          ["paper", "M114 151h80l-6 9h-69Z"],
          ["lead", "M155 100v47"],
        ],
      },
      {
        cue: 'part-1-1', label: "Motion", at: [239, 135], tip: [254, 155],
        flows: [
          ["blue", "M198 155h63"],
        ],
      },
      {
        cue: 'part-1-2', label: "Braking push", at: [81, 218], tip: [74, 158],
        strokes: [
          ["lead", "M79 200l-5-34"],
        ],
        flows: [
          ["red", "M114 155H61"],
        ],
      },
    ],
  },
  {
    scenes: [2, 8, 9, 16],
    outline: [
      ["paper", "M131 127h58v33h-58Z M135 167a6 6 0 1 0 12 0a6 6 0 1 0 -12 0Z M173 167a6 6 0 1 0 12 0a6 6 0 1 0 -12 0Z"],
      ["ink", "M48 177h225"],
    ],
    parts: [
      {
        cue: 'part-2-0', label: "System", at: [232, 35], tip: [194, 123],
        strokes: [
          ["zoom", "M122 119h76v56h-76Z"],
          ["lead", "M225 43L198 116"],
        ],
      },
      {
        cue: 'part-2-1', label: "Balanced pushes", at: [160, 236], tip: [118, 145],
        until: 'part-2-2',
        strokes: [
          ["lead", "M110 218L95 151"],
        ],
        flows: [
          ["blue", "M160 145h58"],
          ["blue", "M160 145h-58"],
        ],
      },
      {
        cue: 'part-2-2', label: "Unbalanced|push", at: [271, 194], tip: [244, 145],
        strokes: [
          ["lead", "M251 178l-5-26"],
        ],
        flows: [
          ["red", "M160 145h84"],
          ["blue", "M160 145h-35"],
        ],
      },
      {
        cue: 'part-8-0', label: "Right is positive", at: [163, 257], tip: [228, 226],
        flows: [
          ["green", "M93 227h135"],
        ],
      },
      {
        cue: 'part-8-1', label: "Weight", at: [125, 209], tip: [160, 205],
        strokes: [
          ["lead", "M148 204h6"],
        ],
        flows: [
          ["red", "M160 145v58"],
        ],
      },
      {
        cue: 'part-8-2', label: "Support", at: [112, 59], tip: [160, 87],
        strokes: [
          ["lead", "M120 66l34 18"],
        ],
        flows: [
          ["blue", "M160 145V87"],
        ],
      },
      {
        cue: 'part-9-0', label: "Net force", at: [246, 91], tip: [236, 108],
        flows: [
          ["green", "M181 108h57"],
        ],
      },
    ],
  },
  {
    scenes: [5],
    outline: [
      ["ink", "M39 108H283M39 222H283"],
    ],
    parts: [
      {
        cue: 'part-5-0', label: "Before impact", at: [154, 27], tip: [118, 70],
        strokes: [
          ["paper", "M56 76h40v22h-40Z M61 102a4 4 0 1 0 8 0a4 4 0 1 0 -8 0Z M83 102a4 4 0 1 0 8 0a4 4 0 1 0 -8 0Z"],
          ["lead", "M123 32L97 72"],
        ],
        flows: [
          ["blue", "M100 86h65"],
        ],
      },
      {
        cue: 'part-5-1', label: "At rest", at: [264, 55], tip: [228, 72],
        strokes: [
          ["paper", "M207 76h40v22h-40Z M212 102a4 4 0 1 0 8 0a4 4 0 1 0 -8 0Z M234 102a4 4 0 1 0 8 0a4 4 0 1 0 -8 0Z"],
          ["lead", "M252 60l-21 13"],
        ],
      },
      {
        cue: 'part-5-2', label: "Move together", at: [129, 253], tip: [180, 188],
        strokes: [
          ["paper", "M99 190h40v22h-40Z M104 216a4 4 0 1 0 8 0a4 4 0 1 0 -8 0Z M126 216a4 4 0 1 0 8 0a4 4 0 1 0 -8 0Z M139 190h40v22h-40Z M144 216a4 4 0 1 0 8 0a4 4 0 1 0 -8 0Z M166 216a4 4 0 1 0 8 0a4 4 0 1 0 -8 0Z"],
          ["lead", "M130 235l19-12"],
        ],
        flows: [
          ["green", "M185 199h33"],
        ],
      },
    ],
  },
  {
    scenes: [6, 11, 12],
    outline: [
      ["ink", "M43 127h234"],
      ["paper", "M129 169l17-42 18 42Z"],
      ["ink", "M119 170h54"],
    ],
    parts: [
      {
        cue: 'part-6-0', label: "Pivot", at: [146, 204], tip: [146, 167],
        strokes: [
          ["lead", "M146 185v-13"],
        ],
      },
      {
        cue: 'part-6-1', label: "Long arm", at: [205, 55], tip: [209, 85],
        strokes: [
          ["lead", "M146 94v-9h128v9m-65-30v16"],
        ],
      },
      {
        cue: 'part-6-2', label: "Short arm", at: [98, 55], tip: [99, 85],
        strokes: [
          ["lead", "M60 94v-9h86m-47-22v17"],
        ],
      },
      {
        cue: 'part-6-3', label: "Opposing turns", at: [145, 249], tip: [173, 152],
        flows: [
          ["green", "M96 157q8 44 33 63"],
          ["red", "M196 157q-8 44-33 63"],
        ],
      },
      {
        cue: 'part-12-0', label: "Load", at: [60, 221], tip: [60, 186],
        flows: [
          ["red", "M60 129v57"],
        ],
      },
      {
        cue: 'part-12-1', label: "Effort", at: [274, 220], tip: [274, 171],
        flows: [
          ["blue", "M274 129v41"],
        ],
      },
    ],
  },
])
