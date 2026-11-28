import { processDrawing } from '../../biology/AnatomyBoard'

// OpenStax College Physics 2e §20.4 Fig. 20.13 (lamp ratings and power),
// §21.1 Figs. 21.3–21.4 (conventional current and parallel branches),
// §23.8 Fig. 23.30 (fuse or breaker in the live conductor).
export default processDrawing("Electrical power in parallel branches and protection on live", [
  {
    scenes: [1, 2, 3],
    outline: [
      ["ink", "M151 50H59V167h79m44 0h78V50H169M59 110h86m30 0h85M151 37v26m18-20v14"],
      ["shade", "M56 110a3 3 0 1 0 6 0a3 3 0 1 0 -6 0Z M257 110a3 3 0 1 0 6 0a3 3 0 1 0 -6 0Z M56 167a3 3 0 1 0 6 0a3 3 0 1 0 -6 0Z M257 167a3 3 0 1 0 6 0a3 3 0 1 0 -6 0Z"],
    ],
    parts: [
      {
        cue: 'part-1-0', label: "Lamp", at: [160, 87], tip: [160, 110],
        strokes: [
          ["paper", "M145 110a15 15 0 1 0 30 0a15 15 0 1 0 -30 0Z"],
          ["ink", "M150 100l20 20m0-20-20 20"],
        ],
      },
      {
        cue: 'part-1-1', label: "Transfers energy", at: [160, 201], tip: [160, 126],
        until: 'part-2-0',
        strokes: [
          ["lead", "M160 183v-37"],
        ],
        flows: [
          ["amber", "M152 124l-17 15"],
          ["amber", "M168 124l17 15"],
        ],
      },
      {
        cue: 'part-2-0', label: "Same voltage", at: [160, 23], tip: [151, 49],
        strokes: [
          ["ink", "M138 39h8m-4-4v8m32-4h7"],
        ],
      },
      {
        cue: 'part-2-1', label: "Branch currents", at: [160, 152], tip: [114, 110],
        flows: [
          ["red", "M151 50H59v60h79"],
          ["red", "M59 117v50h71"],
          ["red", "M183 110h71"],
          ["red", "M188 167h66"],
        ],
      },
      {
        cue: 'part-2-2', label: "Heater", at: [160, 216], tip: [160, 167],
        strokes: [
          ["paper", "M138 160h44v14h-44Z"],
          ["lead", "M160 198v-20"],
        ],
      },
      {
        cue: 'part-3-0', label: "Resistive heating", at: [255, 244], tip: [184, 188],
        strokes: [
          ["lead", "M246 224l-44-32"],
        ],
        flows: [
          ["amber", "M177 175l18 15"],
          ["amber", "M183 171l26 9"],
        ],
      },
    ],
  },
  {
    scenes: [6, 14],
    outline: [
      ["paper", "M209 73h65v126h-65Z"],
      ["ink", "M61 91h53m57 0h56v16m0 44v31H61"],
      ["paper", "M220 107h14v44h-14Z"],
    ],
    parts: [
      {
        cue: 'part-6-0', label: "Fuse on live", at: [142, 41], tip: [143, 91],
        until: 'part-14-1',
        strokes: [
          ["paper", "M114 83h57v16h-57Z"],
          ["ink", "M114 91h57"],
          ["lead", "M142 47v30"],
        ],
      },
      {
        cue: 'part-6-1', label: "Normal current", at: [126, 130], tip: [198, 91],
        until: 'part-14-1',
        strokes: [
          ["lead", "M165 116l28-22"],
        ],
      },
      {
        cue: 'part-14-0', label: "Neutral", at: [51, 212], tip: [99, 182],
        strokes: [
          ["lead", "M66 196l24-10"],
        ],
      },
      {
        cue: 'part-14-1', label: "Live break", at: [143, 41], tip: [143, 91],
        strokes: [
          ["shade", "M111 91a3 3 0 1 0 6 0a3 3 0 1 0 -6 0Z M168 91a3 3 0 1 0 6 0a3 3 0 1 0 -6 0Z"],
          ["ink", "M114 91l43-25"],
          ["lead", "M143 47v20"],
        ],
      },
      {
        cue: 'part-14-2', label: "Appliance", at: [264, 235], tip: [240, 148],
        strokes: [
          ["lead", "M258 215l-4-13"],
        ],
      },
    ],
  },
  {
    scenes: [4, 5, 15],
    outline: [
      ["ink", "M51 216V61m-5 8 5-8 5 8m-5 147h241m-8-5 8 5-8 5"],
    ],
    parts: [
      {
        cue: 'part-4-0', label: "Running time", at: [162, 252], tip: [161, 216],
        strokes: [
          ["lead", "M160 233v-13"],
        ],
      },
      {
        cue: 'part-4-1', label: "Energy used", at: [169, 63], tip: [152, 157],
        strokes: [
          ["blue", "M52 117h183v98H52Z"],
          ["lead", "M173 69l-18 78"],
        ],
        flows: [
          ["green", "M70 180h146"],
        ],
      },
      {
        cue: 'part-4-2', label: "Power rating", at: [72, 49], tip: [52, 117],
        strokes: [
          ["ink", "M52 117h183"],
          ["lead", "M76 57l-18 52"],
        ],
      },
    ],
  },
])
