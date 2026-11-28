import { processDrawing } from '../../biology/AnatomyBoard'

// OpenStax College Physics 2e §7.1 Fig. 7.2 (work and direction),
// §9.5 Figs. 9.21, 9.23–9.24 (lever arms and pulleys).
// Inclined planes: Physics Demystified (Dr Aifuwa Timothy), pp. 79–80.
// OpenStax College Physics 2e §7.3 Fig. 7.5 (energy stored by lifting a weight).
export default processDrawing("Work along a path and distance traded by machines", [
  {
    scenes: [1, 16],
    outline: [
      ["ink", "M43 204L247 109V204Z"],
    ],
    parts: [
      {
        cue: 'part-1-0', label: "Crate", at: [71, 119], tip: [106, 153],
        strokes: [
          ["paper", "M85 149l29-14 13 29-29 14Z"],
          ["lead", "M75 126l21 21"],
        ],
      },
      {
        cue: 'part-1-1', label: "Vertical rise", at: [268, 72], tip: [261, 146],
        flows: [
          ["red", "M261 203v-92"],
        ],
      },
      {
        cue: 'part-1-2', label: "Ramp distance", at: [159, 91], tip: [200, 125],
        flows: [
          ["green", "M128 161L232 112"],
        ],
      },
    ],
  },
  {
    scenes: [2, 14],
    outline: [
      ["ink", "M34 186h254"],
      ["paper", "M78 138h61v47H78Z"],
    ],
    parts: [
      {
        cue: 'part-2-0', label: "Pull", at: [257, 54], tip: [229, 75],
        flows: [
          ["red", "M139 138l95-67"],
        ],
      },
      {
        cue: 'part-2-1', label: "Angle θ", at: [228, 121], tip: [193, 122],
        strokes: [
          ["ink", "M184 138q0-15-9-26"],
          ["lead", "M205 124l-19 1"],
        ],
      },
      {
        cue: 'part-2-2', label: "Along the path", at: [204, 223], tip: [205, 138],
        strokes: [
          ["lead", "M207 204l-1-58"],
        ],
        flows: [
          ["green", "M139 138h133"],
        ],
      },
      {
        cue: 'part-2-3', label: "Across the path", at: [86, 65], tip: [139, 78],
        strokes: [
          ["lead", "M111 70l22 4"],
        ],
        flows: [
          ["blue", "M139 138V78"],
        ],
      },
    ],
  },
  {
    scenes: [5, 6, 11],
    outline: [
      ["ink", "M46 133h236"],
      ["paper", "M110 176l16-43 17 43Z"],
      ["lead", "M46 116L282 166"],
    ],
    parts: [
      {
        cue: 'part-5-0', label: "Effort travel", at: [270, 218], tip: [281, 163],
        flows: [
          ["blue", "M281 136v30"],
        ],
      },
      {
        cue: 'part-5-1', label: "Load travel", at: [58, 218], tip: [49, 112],
        flows: [
          ["green", "M49 132v-16"],
        ],
      },
      {
        cue: 'part-6-0', label: "Pivot", at: [125, 207], tip: [126, 174],
        strokes: [
          ["lead", "M125 190v-12"],
        ],
      },
      {
        cue: 'part-6-1', label: "Effort arm", at: [206, 55], tip: [207, 86],
        strokes: [
          ["lead", "M126 99V86h155v13m-75-36v18"],
        ],
      },
      {
        cue: 'part-6-2', label: "Load arm", at: [76, 55], tip: [86, 86],
        strokes: [
          ["lead", "M48 99V86h78m-40-22v18"],
        ],
      },
    ],
  },
  {
    scenes: [7],
    outline: [
      ["ink", "M66 56h123m-116-7-7 7m32-7-7 7m32-7-7 7m32-7-7 7m32-7-7 7"],
      ["paper", "M75 148a27 27 0 1 0 54 0a27 27 0 1 0 -54 0Z M129 80a26 26 0 1 0 52 0a26 26 0 1 0 -52 0Z"],
      ["ink", "M75 56v92a27 27 0 0 0 54 0V80a26 26 0 0 1 52 0v119M155 56v14m-53 88v36"],
      ["paper", "M82 194h40v28H82Z"],
    ],
    parts: [
      {
        cue: 'part-7-0', label: "Pull down", at: [251, 112], tip: [181, 175],
        strokes: [
          ["lead", "M216 115l-31 40"],
        ],
        flows: [
          ["red", "M181 108v87"],
        ],
      },
      {
        cue: 'part-7-1', label: "Two supports", at: [55, 249], tip: [129, 110],
        strokes: [
          ["lead", "M43 228V143l27-8"],
        ],
        flows: [
          ["blue", "M75 141V79"],
          ["blue", "M129 141v-39"],
        ],
      },
      {
        cue: 'part-7-2', label: "Load rises", at: [243, 232], tip: [143, 179],
        strokes: [
          ["lead", "M207 225l-59-36"],
        ],
        flows: [
          ["green", "M141 209v-43"],
        ],
      },
    ],
  },
  {
    scenes: [3],
    outline: [
      ["ink", "M36 221h246"],
    ],
    parts: [
      {
        cue: 'part-3-0', label: "Kinetic energy", at: [83, 57], tip: [111, 134],
        strokes: [
          ["paper", "M51 129h40v23H51Z M55 157a4 4 0 1 0 8 0a4 4 0 1 0 -8 0Z M79 157a4 4 0 1 0 8 0a4 4 0 1 0 -8 0Z"],
          ["lead", "M86 65l18 66"],
        ],
        flows: [
          ["blue", "M94 139h38"],
        ],
      },
      {
        cue: 'part-3-1', label: "Double the speed", at: [104, 198], tip: [163, 155],
        flows: [
          ["blue", "M94 155h75"],
        ],
      },
      {
        cue: 'part-3-2', label: "Gravitational potential|energy increases", at: [230, 39], tip: [227, 119],
        strokes: [
          ["paper", "M209 168h35v31h-35Z"],
          ["zoom", "M209 102h35v31h-35Z"],
          ["lead", "M230 59v39"],
        ],
        flows: [
          ["green", "M227 166v-55"],
        ],
      },
    ],
  },
])
