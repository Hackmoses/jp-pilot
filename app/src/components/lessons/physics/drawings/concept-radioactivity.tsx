import { processDrawing } from '../../biology/AnatomyBoard'

// OpenStax College Physics 2e §31.5 Fig. 31.19 (successive half-lives),
// §31.1 Fig. 31.5 (material and penetration), §31.4 Figs. 31.15 and 31.17 (decay).
// Gamma attenuation is shown qualitatively; transmission depends on energy and thickness.
export default processDrawing("Radioactive emission, penetration and half-life", [
  {
    scenes: [1],
    outline: [
      ["lead", "M99 86v97m97-97v97"],
    ],
    parts: [
      {
        cue: 'part-1-0', label: "Start", at: [53, 206], tip: [53, 139],
        strokes: [
          ["paper", "M27 124a5 5 0 1 0 10 0a5 5 0 1 0 -10 0Z M41 124a5 5 0 1 0 10 0a5 5 0 1 0 -10 0Z M55 124a5 5 0 1 0 10 0a5 5 0 1 0 -10 0Z M69 124a5 5 0 1 0 10 0a5 5 0 1 0 -10 0Z M27 140a5 5 0 1 0 10 0a5 5 0 1 0 -10 0Z M41 140a5 5 0 1 0 10 0a5 5 0 1 0 -10 0Z M55 140a5 5 0 1 0 10 0a5 5 0 1 0 -10 0Z M69 140a5 5 0 1 0 10 0a5 5 0 1 0 -10 0Z"],
        ],
      },
      {
        cue: 'part-1-1', label: "Half remains", at: [149, 206], tip: [150, 137],
        strokes: [
          ["paper", "M125 132a5 5 0 1 0 10 0a5 5 0 1 0 -10 0Z M139 132a5 5 0 1 0 10 0a5 5 0 1 0 -10 0Z M153 132a5 5 0 1 0 10 0a5 5 0 1 0 -10 0Z M167 132a5 5 0 1 0 10 0a5 5 0 1 0 -10 0Z"],
        ],
        flows: [
          ["green", "M84 133h35"],
        ],
      },
      {
        cue: 'part-1-2', label: "Half again", at: [253, 206], tip: [252, 138],
        strokes: [
          ["paper", "M239 132a5 5 0 1 0 10 0a5 5 0 1 0 -10 0Z M253 132a5 5 0 1 0 10 0a5 5 0 1 0 -10 0Z"],
        ],
        flows: [
          ["green", "M181 133h51"],
        ],
      },
    ],
  },
  {
    scenes: [2],
    outline: [
      ["lead", "M104 36v190"],
    ],
    parts: [
      {
        cue: 'part-2-0', label: "Alpha", at: [53, 68], tip: [158, 66],
        strokes: [
          ["red", "M141 60a7 7 0 1 0 14 0a7 7 0 1 0 -14 0Z M155 73a7 7 0 1 0 14 0a7 7 0 1 0 -14 0Z"],
          ["blue", "M155 60a7 7 0 1 0 14 0a7 7 0 1 0 -14 0Z M141 73a7 7 0 1 0 14 0a7 7 0 1 0 -14 0Z"],
        ],
        flows: [
          ["red", "M112 65h26"],
        ],
      },
      {
        cue: 'part-2-1', label: "2 protons", at: [260, 45], tip: [162, 72],
        strokes: [
          ["lead", "M229 50l-61 21"],
        ],
      },
      {
        cue: 'part-2-2', label: "2 neutrons", at: [264, 100], tip: [148, 73],
        strokes: [
          ["lead", "M226 95L155 75"],
        ],
      },
      {
        cue: 'part-2-3', label: "Beta (electron)", at: [10, 145], tip: [177, 140],
        strokes: [
          ["blue", "M172 140a5 5 0 1 0 10 0a5 5 0 1 0 -10 0Z"],
        ],
        flows: [
          ["blue", "M112 140h55"],
        ],
      },
      {
        cue: 'part-2-4', label: "Gamma", at: [10, 218], tip: [204, 211],
        flows: [
          ["amber", "M112 211q8-16 16 0t16 0t16 0t16 0t16 0t16 0"],
        ],
      },
    ],
  },
  {
    scenes: [4, 5, 15],
    outline: [
      ["ink", "M58 215V56m-5 7 5-7 5 7M58 215h231m-7-5 7 5-7 5"],
    ],
    parts: [
      {
        cue: 'part-4-0', label: "Nuclei remaining", at: [133, 34], tip: [66, 81],
        strokes: [
          ["lead", "M101 41L69 74"],
          ["shade", "M55 83a4 4 0 1 0 8 0a4 4 0 1 0 -8 0Z"],
        ],
      },
      {
        cue: 'part-4-1', label: "First half-life", at: [106, 248], tip: [127, 149],
        strokes: [
          ["lead", "M58 149h69v64m-9 18 8-11"],
          ["shade", "M123 149a4 4 0 1 0 8 0a4 4 0 1 0 -8 0Z"],
        ],
        flows: [
          ["green", "M59 83C80 115 101 135 127 149"],
        ],
      },
      {
        cue: 'part-4-2', label: "Second half-life", at: [221, 248], tip: [195, 182],
        strokes: [
          ["lead", "M58 182h137v31m12 18-11-11"],
          ["shade", "M191 182a4 4 0 1 0 8 0a4 4 0 1 0 -8 0Z"],
        ],
        flows: [
          ["green", "M127 149C147 162 169 173 195 182"],
        ],
      },
      {
        cue: 'part-4-3', label: "Time", at: [270, 183], tip: [283, 214],
        flows: [
          ["green", "M195 182C218 189 244 197 273 202"],
        ],
      },
      {
        cue: 'part-5-0', label: "Activity falls too", at: [211, 91], tip: [147, 159],
        strokes: [
          ["lead", "M193 97l-43 57"],
        ],
      },
    ],
  },
  {
    scenes: [6],
    outline: [],
    parts: [
      {
        cue: 'part-6-0', label: "Radiation", at: [59, 44], tip: [62, 108],
        strokes: [
          ["paper", "M36 72h32v135H36Z"],
          ["lead", "M68 60v9"],
        ],
        flows: [
          ["red", "M69 101h36"],
          ["blue", "M69 139h90"],
          ["amber", "M69 177h157"],
        ],
      },
      {
        cue: 'part-6-1', label: "Paper", at: [110, 232], tip: [109, 205],
        strokes: [
          ["paper", "M107 72h7v135h-7Z"],
          ["lead", "M110 214v-5"],
        ],
      },
      {
        cue: 'part-6-2', label: "Aluminium", at: [165, 258], tip: [169, 204],
        strokes: [
          ["blue", "M161 72h15v135h-15Z"],
          ["lead", "M166 240l2-29"],
        ],
      },
      {
        cue: 'part-6-3', label: "Lead", at: [244, 232], tip: [246, 205],
        strokes: [
          ["shade", "M229 72h31v135h-31Z"],
          ["lead", "M244 214v-5"],
          ["lead", "M260 177h7m5 0h7m5 0h7"],
        ],
      },
      {
        cue: 'part-6-4', label: "α", at: [82, 91], tip: [96, 101],
      },
      {
        cue: 'part-6-5', label: "β", at: [129, 128], tip: [148, 139],
      },
      {
        cue: 'part-6-6', label: "γ", at: [202, 166], tip: [214, 177],
      },
    ],
  },
  {
    scenes: [3],
    outline: [
      ["paper", "M83 88h82v109H83Z"],
      ["ink", "M86 141h75"],
    ],
    parts: [
      {
        cue: 'part-3-0', label: "Mass number drops by 4", at: [207, 56], tip: [165, 111],
        strokes: [
          ["lead", "M184 64l-18 39"],
        ],
        flows: [
          ["red", "M100 116h49"],
        ],
      },
      {
        cue: 'part-3-1', label: "Proton number drops by 2", at: [208, 231], tip: [165, 166],
        strokes: [
          ["lead", "M190 215l-20-39"],
        ],
        flows: [
          ["blue", "M100 169h49"],
        ],
      },
    ],
  },
])
