import { processDrawing } from '../../biology/AnatomyBoard'

// OpenStax College Physics 2e §25.2 Fig. 25.4 (normal and reflection angles),
// §25.3 Fig. 25.12 and §25.4 Fig. 25.13 (refraction and total internal reflection),
// §25.6 Figs. 25.29–25.31 (converging lens), §25.7 Figs. 25.39, 25.41 and 25.43 (concave mirrors).
export default processDrawing("Reflection, refraction and images", [
  {
    scenes: [2],
    outline: [
      ["ink", "M42 179h235m-228 12 12-12m14 12 12-12m14 12 12-12m14 12 12-12m14 12 12-12m14 12 12-12m14 12 12-12m14 12 12-12m14 12 12-12"],
    ],
    parts: [
      {
        cue: 'part-2-0', label: "Incident ray", at: [76, 40], tip: [128, 123],
        flows: [
          ["blue", "M91 61l69 118"],
        ],
      },
      {
        cue: 'part-2-1', label: "Normal", at: [160, 27], tip: [160, 78],
        strokes: [
          ["lead", "M160 35v144m0-13h13v13"],
        ],
      },
      {
        cue: 'part-2-2', label: "Reflected ray", at: [248, 40], tip: [204, 104],
        flows: [
          ["green", "M160 179l69-118"],
        ],
      },
      {
        cue: 'part-2-3', label: "θᵢ = θᵣ", at: [159, 231], tip: [160, 151],
        strokes: [
          ["ink", "M146 155a28 28 0 0 1 28 0"],
        ],
      },
    ],
  },
  {
    scenes: [3],
    outline: [
      ["lead", "M25 132h270"],
      ["ink", "M192 49Q229 132 192 215m6-156 10-6m-4 23 10-4m-5 22 10-3m-6 20 10-2m-9 23h10m-11 21 10 2m-14 18 10 3m-15 15 10 4m-16 14 10 6"],
      ["shade", "M150 132a3 3 0 1 0 6 0a3 3 0 1 0 -6 0Z"],
    ],
    parts: [
      {
        cue: 'part-1-0', label: "Concave mirror", at: [241, 239], tip: [206, 182],
        strokes: [
          ["lead", "M235 221l-24-33"],
        ],
      },
      {
        cue: 'part-1-1', label: "Reflected rays", at: [93, 41], tip: [154, 132],
        until: 'part-3-1',
        flows: [
          ["blue", "M39 92H206L153 132 92 178"],
          ["blue", "M39 172H206L153 132 92 86"],
        ],
      },
      {
        cue: 'part-3-0', label: "Focus F", at: [95, 234], tip: [153, 132],
        strokes: [
          ["lead", "M115 218l34-81"],
        ],
      },
      {
        cue: 'part-3-1', label: "Closer object", at: [162, 28], tip: [183, 106],
        until: 'part-3-2',
        strokes: [
          ["ink", "M183 132v-27l-4 6m4-6 4 6"],
          ["lead", "M167 36l13 63"],
        ],
      },
      {
        cue: 'part-3-2', label: "Virtual image", at: [261, 43], tip: [258, 85],
        strokes: [
          ["ink", "M183 132v-26l-4 6m4-6 4 6"],
          ["zoom", "M210 106L261 83M212 132L261 83M261 132v-49l-5 8m5-8 5 8"],
        ],
        flows: [
          ["green", "M183 106h27l-96 44"],
          ["blue", "M183 106l29 26-80 80"],
        ],
      },
    ],
  },
  {
    scenes: [4, 8, 16],
    outline: [
      ["lead", "M25 132h270"],
      ["paper", "M160 44Q129 132 160 220Q191 132 160 44Z"],
      ["shade", "M101 132a3 3 0 1 0 6 0a3 3 0 1 0 -6 0Z M213 132a3 3 0 1 0 6 0a3 3 0 1 0 -6 0Z"],
    ],
    parts: [
      {
        cue: 'part-4-0', label: "Object", at: [48, 213], tip: [48, 100],
        strokes: [
          ["ink", "M48 132V92l-5 7m5-7 5 7"],
          ["lead", "M48 195v-55"],
        ],
      },
      {
        cue: 'part-4-1', label: "Focus F", at: [217, 55], tip: [216, 132],
        strokes: [
          ["lead", "M217 62v57"],
        ],
      },
      {
        cue: 'part-4-2', label: "Real image", at: [272, 220], tip: [272, 172],
        strokes: [
          ["ink", "M272 132v40l-5-7m5 7 5-7"],
          ["lead", "M272 201v-23"],
        ],
        flows: [
          ["green", "M48 92H160L293 187"],
          ["blue", "M48 92l245 87"],
        ],
      },
      {
        cue: 'part-8-0', label: "Converging lens", at: [160, 23], tip: [160, 44],
        strokes: [
          ["lead", "M160 28v11"],
        ],
      },
    ],
  },
  {
    scenes: [5],
    outline: [
      ["blue", "M39 125h244v105H39Z"],
      ["ink", "M39 125h244"],
    ],
    parts: [
      {
        cue: 'part-5-0', label: "Boundary", at: [267, 103], tip: [249, 125],
        strokes: [
          ["lead", "M255 108l-5 13"],
        ],
      },
      {
        cue: 'part-5-1', label: "From air", at: [66, 29], tip: [82, 56],
        flows: [
          ["blue", "M80 44l80 81"],
        ],
      },
      {
        cue: 'part-5-2', label: "Toward normal", at: [255, 253], tip: [190, 205],
        strokes: [
          ["lead", "M223 234l-28-24M160 48v175"],
        ],
        flows: [
          ["green", "M160 125l35 91"],
        ],
      },
    ],
  },
  {
    scenes: [6],
    outline: [
      ["blue", "M34 116h253v111H34Z"],
      ["ink", "M34 116h253"],
      ["lead", "M154 46v169"],
    ],
    parts: [
      {
        cue: 'part-6-3', label: "Lower index", at: [244, 42], tip: [221, 70],
        strokes: [
          ["lead", "M240 49l-15 16"],
        ],
      },
      {
        cue: 'part-6-0', label: "Higher index", at: [80, 251], tip: [90, 202],
        until: 'part-6-2',
        strokes: [
          ["lead", "M81 234l8-27"],
        ],
        flows: [
          ["blue", "M93 221l61-105"],
        ],
      },
      {
        cue: 'part-6-1', label: "Critical angle", at: [219, 78], tip: [210, 116],
        until: 'part-6-2',
        strokes: [
          ["lead", "M219 84l-9 24"],
        ],
        flows: [
          ["green", "M154 116h126"],
        ],
      },
      {
        cue: 'part-6-2', label: "Total internal reflection", at: [160, 255], tip: [233, 190],
        strokes: [
          ["lead", "M191 241l65-29"],
        ],
        flows: [
          ["red", "M39 211l115-95 115 95"],
        ],
      },
    ],
  },
  {
    scenes: [14],
    outline: [
      ["lead", "M25 132h270"],
      ["ink", "M192 49Q229 132 192 215m6-156 10-6m-4 23 10-4m-5 22 10-3m-6 20 10-2m-9 23h10m-11 21 10 2m-14 18 10 3m-15 15 10 4m-16 14 10 6"],
      ["shade", "M150 132a3 3 0 1 0 6 0a3 3 0 1 0 -6 0Z"],
    ],
    parts: [
      {
        cue: 'part-14-0', label: "Beyond focus", at: [73, 78], tip: [114, 102],
        until: 'part-14-1',
        strokes: [
          ["ink", "M114 132v-31l-5 7m5-7 5 7"],
          ["lead", "M78 83l30 15"],
          ["ink", "M58 132v50l-5-7m5 7 5-7"],
        ],
        flows: [
          ["blue", "M114 101h96L58 182"],
          ["green", "M114 101l98 31L58 182"],
        ],
      },
      {
        cue: 'part-14-1', label: "Inside focus", at: [138, 244], tip: [182, 104],
        strokes: [
          ["ink", "M183 132v-26l-4 6m4-6 4 6"],
          ["lead", "M142 225l35-87"],
        ],
        flows: [
          ["green", "M183 106h27l-96 44"],
          ["blue", "M183 106l29 26-80 80"],
        ],
      },
      {
        cue: 'part-14-2', label: "Upright image", at: [264, 42], tip: [261, 83],
        strokes: [
          ["zoom", "M210 106L261 83M212 132L261 83M261 132v-49l-5 8m5-8 5 8"],
        ],
      },
    ],
  },
  {
    scenes: [1],
    outline: [
      ["lead", "M25 132h270"],
      ["ink", "M192 49Q229 132 192 215m6-156 10-6m-4 23 10-4m-5 22 10-3m-6 20 10-2m-9 23h10m-11 21 10 2m-14 18 10 3m-15 15 10 4m-16 14 10 6"],
      ["shade", "M150 132a3 3 0 1 0 6 0a3 3 0 1 0 -6 0Z"],
    ],
    parts: [
      {
        cue: 'part-1-0', label: "Concave mirror", at: [241, 239], tip: [206, 182],
        strokes: [
          ["lead", "M235 221l-24-33"],
        ],
      },
      {
        cue: 'part-1-1', label: "Reflected rays", at: [93, 41], tip: [154, 132],
        flows: [
          ["blue", "M39 92H206L153 132 92 178"],
          ["blue", "M39 172H206L153 132 92 86"],
        ],
      },
    ],
  },
])
