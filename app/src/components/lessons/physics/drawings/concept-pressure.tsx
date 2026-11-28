import { processDrawing } from '../../biology/AnatomyBoard'

// OpenStax College Physics 2e §11.3 Fig. 11.5 (contact area), §11.4 Fig. 11.8 (fluid column),
// §11.5 Fig. 11.11 (hydraulic pistons), §11.7 Figs. 11.18–11.19 and 11.23 (buoyancy).
export default processDrawing("Pressure at a depth, in a hydraulic lift and on a floating block", [
  {
    scenes: [1, 2],
    outline: [
      ["ink", "M35 186h105m24 0h118m-244 8 10-8m14 8 10-8m103 8 10-8m14 8 10-8"],
    ],
    parts: [
      {
        cue: 'part-1-0', label: "Wide contact", at: [79, 228], tip: [79, 185],
        strokes: [
          ["paper", "M46 151h67v35H46Z"],
          ["lead", "M79 211v-22"],
        ],
        flows: [
          ["red", "M79 96v51"],
        ],
      },
      {
        cue: 'part-1-1', label: "Narrow contact", at: [222, 228], tip: [222, 188],
        strokes: [
          ["paper", "M198 150h42v13h-12v28h-12v-28h-18Z"],
          ["lead", "M222 211v-17"],
        ],
        flows: [
          ["red", "M222 96v51"],
        ],
      },
      {
        cue: 'part-1-2', label: "Same weight", at: [150, 49], tip: [150, 74],
        strokes: [
          ["lead", "M150 57v13m0 0-61 19m61-19 62 19"],
        ],
      },
    ],
  },
  {
    scenes: [3, 8, 16],
    outline: [
      ["blue", "M48 100h222v114H48Z"],
      ["ink", "M46 78v138h226V78"],
    ],
    parts: [
      {
        cue: 'part-3-0', label: "Water above", at: [146, 51], tip: [147, 135],
        strokes: [
          ["zoom", "M119 100h55v86h-55Z"],
          ["lead", "M146 58v38"],
        ],
      },
      {
        cue: 'part-3-1', label: "Depth h", at: [245, 145], tip: [201, 155],
        strokes: [
          ["lead", "M191 101h9v85h-9m13-33 16-8"],
        ],
      },
      {
        cue: 'part-3-2', label: "Point", at: [145, 248], tip: [146, 186],
        strokes: [
          ["shade", "M142 186a4 4 0 1 0 8 0a4 4 0 1 0 -8 0Z"],
          ["lead", "M145 228v-36"],
        ],
      },
      {
        cue: 'part-3-3', label: "Air pressure", at: [76, 29], tip: [77, 85],
        flows: [
          ["red", "M77 40v49"],
        ],
      },
    ],
  },
  {
    scenes: [5],
    outline: [
      ["blue", "M50 102h44v92h101v-92h75v121H50Z"],
      ["ink", "M49 76v148h222V76m-77 0v117H95V76"],
    ],
    parts: [
      {
        cue: 'part-5-0', label: "Narrow piston", at: [74, 24], tip: [72, 98],
        strokes: [
          ["paper", "M50 97h44v10H50Z"],
        ],
        flows: [
          ["red", "M72 61v32"],
        ],
      },
      {
        cue: 'part-5-1', label: "Pressure change", at: [153, 254], tip: [150, 208],
        flows: [
          ["blue", "M72 115v92h155v-91"],
        ],
      },
      {
        cue: 'part-5-2', label: "Wider piston", at: [233, 22], tip: [233, 99],
        strokes: [
          ["paper", "M195 97h75v10h-75Z"],
        ],
        flows: [
          ["green", "M233 95V31"],
        ],
      },
    ],
  },
  {
    scenes: [6, 11],
    outline: [
      ["blue", "M48 100h222v114H48Z"],
      ["ink", "M46 78v138h226V78"],
    ],
    parts: [
      {
        cue: 'part-6-0', label: "Submerged block", at: [148, 241], tip: [150, 160],
        strokes: [
          ["paper", "M128 144h46v38h-46Z"],
          ["lead", "M146 222v-35"],
        ],
      },
      {
        cue: 'part-6-1', label: "Upthrust", at: [230, 93], tip: [151, 144],
        strokes: [
          ["lead", "M206 102l-48 40"],
        ],
        flows: [
          ["green", "M151 163V144"],
        ],
      },
      {
        cue: 'part-6-2', label: "Weight", at: [236, 192], tip: [151, 211],
        strokes: [
          ["lead", "M209 190l-51 12"],
        ],
        flows: [
          ["red", "M151 163v48"],
        ],
      },
      {
        cue: 'part-6-3', label: "Scale support", at: [147, 26], tip: [151, 61],
        strokes: [
          ["paper", "M127 40h48v23h-48Z"],
          ["ink", "M151 63v80m-13-91h25"],
          ["lead", "M147 30l3 7"],
        ],
        flows: [
          ["blue", "M151 122V93"],
        ],
      },
    ],
  },
  {
    scenes: [7],
    outline: [
      ["blue", "M48 100h222v114H48Z"],
      ["ink", "M46 78v138h226V78"],
    ],
    parts: [
      {
        cue: 'part-7-0', label: "Floating block", at: [161, 234], tip: [144, 117],
        strokes: [
          ["paper", "M127 72h66v56h-66Z"],
          ["lead", "M156 215l-11-82"],
        ],
      },
      {
        cue: 'part-7-3', label: "Submerged|part", at: [86, 194], tip: [129, 115],
        strokes: [
          ["blue", "M128 100h64v27h-64Z"],
          ["lead", "M92 175l34-54"],
        ],
      },
      {
        cue: 'part-7-1', label: "Upthrust", at: [236, 35], tip: [160, 43],
        strokes: [
          ["lead", "M212 42l-42 2"],
        ],
        flows: [
          ["green", "M160 100V43"],
        ],
      },
      {
        cue: 'part-7-2', label: "Weight", at: [240, 167], tip: [160, 157],
        strokes: [
          ["lead", "M211 160l-44-3"],
        ],
        flows: [
          ["red", "M160 100v57"],
        ],
      },
    ],
  },
])
