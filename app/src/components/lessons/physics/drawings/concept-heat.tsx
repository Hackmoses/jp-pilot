import { processDrawing } from '../../biology/AnatomyBoard'

// OpenStax College Physics 2e §14.1 Fig. 14.2 (hot to cold and equilibrium),
// §13.2 Fig. 13.12 (expansion from original dimensions), §14.3 Fig. 14.8 (heating curve).
export default processDrawing("Heat transfer, expansion and change of state", [
  {
    scenes: [1],
    outline: [],
    parts: [
      {
        cue: 'part-1-0', label: "Hot cup", at: [96, 52], tip: [104, 101],
        strokes: [
          ["paper", "M58 96h92l-8 78q-36 12-75 0Z"],
          ["red", "M61 111h87l-3 30H64Z"],
          ["lead", "M99 58l4 32"],
        ],
      },
      {
        cue: 'part-1-1', label: "Cooler hand", at: [238, 226], tip: [205, 165],
        strokes: [
          ["paper", "M280 185l-45-12-23-32-38-12q-9 0-11 7t8 12l20 10-41 5q-7 2-7 8t8 7l34-2 22 14 58 18"],
          ["lead", "M231 210l-21-19"],
        ],
      },
      {
        cue: 'part-1-2', label: "Heat transfer", at: [182, 81], tip: [181, 119],
        strokes: [
          ["lead", "M181 88v13"],
        ],
        flows: [
          ["red", "M134 130q24-21 50-12"],
        ],
      },
    ],
  },
  {
    scenes: [7, 8],
    outline: [
      ["ink", "M39 103l9 90h64l10-90m75 0 9 90h64l10-90"],
    ],
    parts: [
      {
        cue: 'part-1-0', label: "Hotter", at: [77, 75], tip: [82, 115],
        strokes: [
          ["red", "M44 140h73l-5 50H49Z"],
          ["lead", "M77 82l5 53"],
        ],
      },
      {
        cue: 'part-1-1', label: "Cooler", at: [240, 75], tip: [241, 152],
        strokes: [
          ["blue", "M203 140h70l-6 50h-59Z"],
          ["lead", "M241 82v54"],
        ],
      },
      {
        cue: 'part-1-2', label: "Heat transfer", at: [163, 209], tip: [160, 143],
        strokes: [
          ["lead", "M162 189v-37"],
        ],
        flows: [
          ["red", "M116 144h86"],
        ],
      },
      {
        cue: 'part-7-0', label: "Thermal equilibrium", at: [161, 29], tip: [160, 109],
        until: 'part-8-0',
        strokes: [
          ["lead", "M96 42h130m-65 0v61"],
        ],
      },
      {
        cue: 'part-8-0', label: "More hot water", at: [79, 252], tip: [82, 120],
        strokes: [
          ["red", "M43 112h75l-6 27H45Z"],
          ["lead", "M81 233l-1-41"],
        ],
      },
    ],
  },
  {
    scenes: [3, 4],
    outline: [
      ["ink", "M52 121h6v45h-6Z"],
      ["lead", "M62 187v10h133v-10"],
    ],
    parts: [
      {
        cue: 'part-3-0', label: "Original length", at: [127, 234], tip: [130, 197],
        strokes: [
          ["paper", "M58 132h137v24H58Z"],
          ["lead", "M129 215v-14"],
        ],
      },
      {
        cue: 'part-3-1', label: "Heating", at: [228, 51], tip: [224, 97],
        flows: [
          ["red", "M197 96h50"],
        ],
      },
      {
        cue: 'part-3-2', label: "Longer", at: [262, 115], tip: [247, 145],
        strokes: [
          ["zoom", "M195 131h52v26h-52Z"],
          ["lead", "M255 121l-8 8"],
        ],
      },
      {
        cue: 'part-4-0', label: "Width", at: [142, 97], tip: [141, 129],
        flows: [
          ["blue", "M139 131v-25"],
        ],
      },
      {
        cue: 'part-4-1', label: "Depth", at: [261, 213], tip: [214, 169],
        strokes: [
          ["ink", "M62 156l14 13h158l13-12M195 156l13 13"],
          ["lead", "M253 194l-35-23"],
        ],
      },
    ],
  },
  {
    scenes: [5, 6, 14, 16, 17],
    outline: [
      ["ink", "M51 223V51m-5 8 5-8 5 8M51 223h241m-7-5 7 5-7 5"],
    ],
    parts: [
      {
        cue: 'part-5-0', label: "Temperature", at: [67, 31], tip: [51, 55],
        strokes: [
          ["lead", "M64 36l-9 14"],
        ],
      },
      {
        cue: 'part-5-1', label: "Warming", at: [104, 79], tip: [85, 183],
        strokes: [
          ["lead", "M97 86l-12 68-1 22"],
        ],
        flows: [
          ["red", "M52 210l54-55"],
        ],
      },
      {
        cue: 'part-5-2', label: "Energy added", at: [189, 257], tip: [204, 223],
        strokes: [
          ["lead", "M190 239l10-13"],
        ],
      },
      {
        cue: 'part-6-0', label: "Melting", at: [151, 189], tip: [153, 155],
        strokes: [
          ["lead", "M153 171v-12"],
        ],
        flows: [
          ["blue", "M106 155h89"],
        ],
      },
      {
        cue: 'part-6-1', label: "Temperature holds", at: [152, 120], tip: [115, 155],
        strokes: [
          ["lead", "M151 126l-16 25"],
        ],
      },
      {
        cue: 'part-6-2', label: "Freezing releases heat", at: [171, 50], tip: [140, 103],
        strokes: [
          ["lead", "M193 59l-9 42"],
        ],
        flows: [
          ["green", "M197 105h-85"],
        ],
      },
      {
        cue: 'part-6-3', label: "Liquid warms", at: [253, 193], tip: [233, 116],
        strokes: [
          ["lead", "M250 176l-11-39"],
        ],
        flows: [
          ["red", "M195 155l49-77"],
        ],
      },
      {
        cue: 'part-16-0', label: "Boiling", at: [273, 49], tip: [268, 78],
        strokes: [
          ["lead", "M272 57l-4 16"],
        ],
        flows: [
          ["blue", "M244 78h51"],
        ],
      },
    ],
  },
  {
    scenes: [11],
    outline: [
      ["ink", "M52 121h6v45h-6Z"],
      ["lead", "M62 187v10h133v-10"],
    ],
    parts: [
      {
        cue: 'part-3-0', label: "Original length", at: [76, 234], tip: [130, 197],
        strokes: [
          ["paper", "M58 132h137v24H58Z"],
          ["lead", "M81 215l12-14"],
        ],
      },
      {
        cue: 'part-11-0', label: "Cooling", at: [102, 53], tip: [107, 102],
        flows: [
          ["blue", "M146 102H91"],
        ],
      },
      {
        cue: 'part-11-1', label: "Shorter", at: [239, 238], tip: [160, 144],
        strokes: [
          ["zoom", "M58 132h102v24H58Z"],
          ["lead", "M226 220l-60-62"],
        ],
      },
    ],
  },
])
