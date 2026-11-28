import { processDrawing } from '../../biology/AnatomyBoard'

// Mole concept and stoichiometry for chem-mole. Checked against OpenStax Chemistry 2e §3.1
// (Figs. 3.5–3.6, mass-mole-particle conversions), §4.1 (Fig. 4.2, atom conservation in
// 2H2 + O2 -> 2H2O), and §4.4 (Fig. 4.13, limiting reactant); Understanding Chemistry
// pp. 63, 65–66, 69, 76, 81, 94 (22.4 dm^3 at s.t.p., N_A = 6.02 x 10^23 mol^-1).
export default processDrawing("The mole and stoichiometry", [
  {
    outline: [
      ["ink", "M122 104H198V166H122Z"],
    ],
    parts: [
      {
        cue: 'part-1-0', label: "1 mole|crate", at: [160,185], tip: [160,135], align: 'middle',
        strokes: [
          ["amber", "M126 108H194V162H126Z"],
          ["ink", "M126 126H194M126 144H194M149 108V162M171 108V162"],
          ["shade", "M135 117a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0 -5 0M157.5 117a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0 -5 0M180 117a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0 -5 0M135 135a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0 -5 0M157.5 135a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0 -5 0M180 135a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0 -5 0M135 153a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0 -5 0M157.5 153a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0 -5 0M180 153a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0 -5 0"],
        ],
      },
      {
        cue: 'part-1-1', label: "Particles|6.02×10²³", at: [312,24], tip: [264,52], align: 'end',
        strokes: [
          ["amber", "M248 48a5 5 0 1 0 10 0a5 5 0 1 0 -10 0M266 56a5 5 0 1 0 10 0a5 5 0 1 0 -10 0M250 66a5 5 0 1 0 10 0a5 5 0 1 0 -10 0M272 42a4.5 4.5 0 1 0 9 0a4.5 4.5 0 1 0 -9 0"],
          ["lead", "M290 36L282 42"],
        ],
      },
      {
        cue: 'part-2-0', label: "Mass (g)", at: [8,24], tip: [56,56], align: 'start',
        strokes: [
          ["paper", "M32 66Q56 76 80 66L76 74Q56 83 36 74Z"],
          ["ink", "M56 36V66M36 66L56 36L76 66M42 82H70"],
          ["red", "M45 58h22l-3 8h-16Z"],
        ],
        flows: [
          ["red", "M84 72Q106 86 122 106"],
        ],
      },
      {
        cue: 'part-2-1', label: "Gas s.t.p.|22.4 dm³", at: [8,248], tip: [54,196], align: 'start',
        strokes: [
          ["blue", "M46 168H62V182L76 208Q56 216 36 208L50 182Z"],
          ["ink", "M45 168H63"],
          ["lead", "M44 232L50 212"],
        ],
        flows: [
          ["blue", "M78 188Q102 172 122 154"],
        ],
      },
      {
        cue: 'part-2-2', label: "÷ Nₐ", at: [212,68], tip: [216,88], align: 'middle',
        flows: [
          ["amber", "M244 74Q222 90 200 106"],
        ],
      },
      {
        cue: 'part-6-0', label: "Equation|ratio", at: [312,248], tip: [242,172], align: 'end',
        strokes: [
          ["green", "M256 172H272V184L286 208Q264 216 242 208L256 184Z"],
          ["ink", "M255 172H273"],
          ["lead", "M264 232L264 212"],
        ],
        flows: [
          ["green", "M200 152Q224 168 248 184"],
        ],
      },
    ],
  },
  {
    scenes: [5, 7, 17],
    outline: [
      ["ink", "M16 40H304M16 174H304"],
    ],
    parts: [
      {
        cue: 'part-5-0', label: "2 H₂ + O₂", at: [72,26], tip: [74,90], align: 'middle',
        strokes: [
          ["blue", "M36 66a8 8 0 1 0 16 0a8 8 0 1 0 -16 0M50 66a8 8 0 1 0 16 0a8 8 0 1 0 -16 0M36 96a8 8 0 1 0 16 0a8 8 0 1 0 -16 0M50 96a8 8 0 1 0 16 0a8 8 0 1 0 -16 0"],
          ["ink", "M68 81h10m-5-5v10"],
          ["red", "M84 81a11 11 0 1 0 22 0a11 11 0 1 0 -22 0M104 81a11 11 0 1 0 22 0a11 11 0 1 0 -22 0"],
        ],
      },
      {
        cue: 'part-5-1', label: "2 H₂O", at: [252,26], tip: [242,84], align: 'middle',
        strokes: [
          ["red", "M212 66a11 11 0 1 0 22 0a11 11 0 1 0 -22 0M262 66a11 11 0 1 0 22 0a11 11 0 1 0 -22 0"],
          ["blue", "M202 82a7 7 0 1 0 14 0a7 7 0 1 0 -14 0M229 82a7 7 0 1 0 14 0a7 7 0 1 0 -14 0M252 82a7 7 0 1 0 14 0a7 7 0 1 0 -14 0M279 82a7 7 0 1 0 14 0a7 7 0 1 0 -14 0"],
        ],
        flows: [
          ["amber", "M138 86H194"],
        ],
      },
      {
        cue: 'part-5-2', label: "Coefficients|2 : 1 : 2", at: [160,142], tip: [160,118], align: 'middle',
        strokes: [
          ["ink", "M36 112v6h30v-6M84 112v6h42v-6M202 112v6h90v-6"],
        ],
      },
      {
        cue: 'part-7-0', label: "Excess O₂|left over", at: [312,248], tip: [254,206], align: 'end',
        strokes: [
          ["zoom", "M206 184H296V228H206Z"],
          ["red", "M228 206a11 11 0 1 0 22 0a11 11 0 1 0 -22 0M248 206a11 11 0 1 0 22 0a11 11 0 1 0 -22 0"],
          ["lead", "M272 232L262 222"],
        ],
      },
      {
        cue: 'part-7-1', label: "Limiting H₂|runs out", at: [8,248], tip: [122,204], align: 'start',
        strokes: [
          ["blue", "M30 206a8 8 0 1 0 16 0a8 8 0 1 0 -16 0M44 206a8 8 0 1 0 16 0a8 8 0 1 0 -16 0"],
          ["ink", "M68 206h12m-8-4l8 4-8 4"],
          ["lead", "M54 232L48 216"],
        ],
        flows: [
          ["red", "M84 206H188"],
        ],
      },
    ],
  },
])
