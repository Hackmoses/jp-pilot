import { processDrawing } from '../../biology/AnatomyBoard'

// OpenStax College Physics 2e §2.4 Fig. 2.19 (speed increases from rest),
// §2.8 Fig. 2.46 (velocity–time axes), §2.7 Fig. 2.41 (vertical throw),
// and §3.4 Fig. 3.35 (projectile components). For the rectangle, the lesson’s
// constant velocity makes its area equal to velocity multiplied by time.
export default processDrawing("Motion along a road and through the air", [
  {
    scenes: [1],
    outline: [
      ["ink", "M24 170H295"],
      ["lead", "M40 182v8m48-8v8m76-8v8m104-8v8"],
    ],
    parts: [
      {
        cue: 'part-1-0', label: "Danfo", at: [40, 116], tip: [40, 141],
        strokes: [
          ["paper", "M21 160v-14q0-7 6-7h20l12 10v11Z M26 145h18l7 5h-25Z M28 163a4 4 0 1 0 8 0a4 4 0 1 0 -8 0Z M47 163a4 4 0 1 0 8 0a4 4 0 1 0 -8 0Z"],
          ["lead", "M40 121v17"],
        ],
      },
      {
        cue: 'part-1-1', label: "More road each second", at: [160, 225], tip: [164, 186],
        strokes: [
          ["ink", "M69 160v-14q0-7 6-7h20l12 10v11Z M74 145h18l7 5h-25Z M76 163a4 4 0 1 0 8 0a4 4 0 1 0 -8 0Z M95 163a4 4 0 1 0 8 0a4 4 0 1 0 -8 0Z M145 160v-14q0-7 6-7h20l12 10v11Z M150 145h18l7 5h-25Z M152 163a4 4 0 1 0 8 0a4 4 0 1 0 -8 0Z M171 163a4 4 0 1 0 8 0a4 4 0 1 0 -8 0Z M249 160v-14q0-7 6-7h20l12 10v11Z M254 145h18l7 5h-25Z M256 163a4 4 0 1 0 8 0a4 4 0 1 0 -8 0Z M275 163a4 4 0 1 0 8 0a4 4 0 1 0 -8 0Z"],
          ["lead", "M160 207l4-16"],
        ],
        flows: [
          ["blue", "M40 187H268"],
        ],
      },
      {
        cue: 'part-1-2', label: "Speed increases", at: [192, 92], tip: [232, 120],
        flows: [
          ["green", "M54 120h15"],
          ["green", "M101 120h29"],
          ["green", "M177 120h52"],
        ],
      },
    ],
  },
  {
    scenes: [4],
    outline: [
      ["ink", "M63 207V54m-5 7 5-7 5 7M63 207h210m-7-5 7 5-7 5"],
    ],
    parts: [
      {
        cue: 'part-4-0', label: "Velocity (m/s)", at: [75, 31], tip: [63, 60],
        strokes: [
          ["lead", "M75 38l-10 13"],
        ],
      },
      {
        cue: 'part-4-1', label: "Displacement", at: [214, 68], tip: [159, 151],
        strokes: [
          ["blue", "M64 106H211V206H64Z"],
          ["ink", "M64 106H211"],
          ["lead", "M209 75l-47 70"],
        ],
      },
      {
        cue: 'part-4-2', label: "Time (s)", at: [145, 256], tip: [142, 206],
        strokes: [
          ["lead", "M146 239l-4-28"],
          ["ink", "M211 203v8"],
        ],
      },
      {
        cue: 'part-4-3', label: "2", at: [25, 111], tip: [63, 106],
        strokes: [
          ["lead", "M39 106h20"],
        ],
      },
      {
        cue: 'part-4-4', label: "3", at: [211, 232], tip: [211, 207],
        strokes: [
          ["lead", "M211 215v-3"],
        ],
      },
    ],
  },
  {
    scenes: [5],
    outline: [
      ["ink", "M67 227h170"],
    ],
    parts: [
      {
        cue: 'part-5-0', label: "Launch", at: [78, 192], tip: [135, 203],
        strokes: [
          ["paper", "M135 203a6 6 0 1 0 12 0a6 6 0 1 0 -12 0Z"],
          ["lead", "M102 190l31 10"],
        ],
        flows: [
          ["blue", "M141 194V99"],
        ],
      },
      {
        cue: 'part-5-1', label: "Gravity", at: [254, 137], tip: [191, 164],
        strokes: [
          ["lead", "M225 140l-29 20"],
        ],
        flows: [
          ["red", "M189 92v92"],
        ],
      },
      {
        cue: 'part-5-2', label: "Top: v = 0", at: [122, 49], tip: [141, 80],
        strokes: [
          ["paper", "M135 80a6 6 0 1 0 12 0a6 6 0 1 0 -12 0Z"],
          ["lead", "M122 55l16 18"],
        ],
      },
      {
        cue: 'part-5-3', label: "Acceleration stays down", at: [163, 253], tip: [189, 186],
        strokes: [
          ["lead", "M189 233v-42"],
        ],
        flows: [
          ["red", "M189 92v92"],
        ],
      },
    ],
  },
  {
    scenes: [6, 7, 16],
    outline: [
      ["ink", "M28 213h265"],
    ],
    parts: [
      {
        cue: 'part-6-0', label: "Projectile", at: [55, 41], tip: [65, 176],
        strokes: [
          ["lead", "M38 47v105l26 22"],
        ],
        flows: [
          ["green", "M48 211Q160 -28 272 211"],
        ],
      },
      {
        cue: 'part-6-1', label: "Horizontal velocity", at: [161, 173], tip: [159, 141],
        strokes: [
          ["lead", "M161 155v-10"],
        ],
        flows: [
          ["blue", "M104 139h56"],
        ],
      },
      {
        cue: 'part-6-2', label: "Vertical velocity", at: [98, 79], tip: [104, 101],
        strokes: [
          ["lead", "M97 85l6 21"],
        ],
        flows: [
          ["red", "M104 139V94"],
        ],
      },
      {
        cue: 'part-7-0', label: "Same landing level", at: [164, 250], tip: [270, 213],
        strokes: [
          ["lead", "M207 233l56-17"],
        ],
      },
      {
        cue: 'part-7-1', label: "Top", at: [161, 60], tip: [160, 91],
        strokes: [
          ["paper", "M156 91.5a4 4 0 1 0 8 0a4 4 0 1 0 -8 0Z"],
          ["lead", "M161 67v18"],
        ],
      },
      {
        cue: 'part-7-2', label: "Whole flight", at: [241, 42], tip: [220, 126],
        flows: [
          ["green", "M48 211Q160 -28 272 211"],
        ],
      },
    ],
  },
])
