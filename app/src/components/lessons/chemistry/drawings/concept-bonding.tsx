import { processDrawing } from '../../biology/AnatomyBoard'

// Chemical bonding, VSEPR geometry, and intermolecular forces for chem-bonding.
// Checked against OpenStax Chemistry 2e §7.1 (ionic transfer), §7.2 (covalent sharing),
// §7.6 (Figs. 7.16 & 7.19, VSEPR shapes & dipole cancellation), §10.1 (Fig. 10.10, H-bonds),
// and §10.5 (Fig. 10.40, metallic solids); Understanding Chemistry pp. 42–52, 273–277.
export default processDrawing("Chemical bonding", [
  {
    outline: [
      ["ink", "M22 152H298"],
    ],
    parts: [
      {
        cue: 'part-1-0', label: "Metal (Na)|2, 8, 1", at: [8,26], tip: [76,92], align: 'start',
        strokes: [
          ["paper", "M76 54a38 38 0 1 0 0.1 0Z"],
          ["red", "M66 92a10 10 0 1 0 20 0a10 10 0 1 0 -20 0Z"],
          ["ink", "M76 68a24 24 0 1 0 0.1 0Z"],
          ["amber", "M110 92a4.5 4.5 0 1 0 9 0a4.5 4.5 0 1 0 -9 0"],
        ],
      },
      {
        cue: 'part-1-1', label: "Non-metal (Cl)|2, 8, 7", at: [312,26], tip: [242,92], align: 'end',
        strokes: [
          ["paper", "M242 54a38 38 0 1 0 0.1 0Z"],
          ["blue", "M232 92a10 10 0 1 0 20 0a10 10 0 1 0 -20 0Z"],
          ["ink", "M242 68a24 24 0 1 0 0.1 0Z"],
          ["blue", "M238 50a4 4 0 1 0 8 0a4 4 0 1 0 -8 0M238 126a4 4 0 1 0 8 0a4 4 0 1 0 -8 0M276 88a4 4 0 1 0 8 0a4 4 0 1 0 -8 0M268 62a4 4 0 1 0 8 0a4 4 0 1 0 -8 0M268 114a4 4 0 1 0 8 0a4 4 0 1 0 -8 0M210 62a4 4 0 1 0 8 0a4 4 0 1 0 -8 0M210 114a4 4 0 1 0 8 0a4 4 0 1 0 -8 0"],
        ],
      },
      {
        cue: 'part-2-0', label: "e⁻ transfer", at: [160,54], tip: [160,82], align: 'middle',
        flows: [
          ["amber", "M118 86Q160 64 202 88"],
        ],
      },
      {
        cue: 'part-2-1', label: "Ionic lattice|Na⁺ Cl⁻", at: [160,250], tip: [160,200], align: 'middle',
        strokes: [
          ["red", "M72 194a12 12 0 1 0 24 0a12 12 0 1 0 -24 0M148 194a12 12 0 1 0 24 0a12 12 0 1 0 -24 0M224 194a12 12 0 1 0 24 0a12 12 0 1 0 -24 0"],
          ["blue", "M108 194a14 14 0 1 0 28 0a14 14 0 1 0 -28 0M184 194a14 14 0 1 0 28 0a14 14 0 1 0 -28 0"],
          ["lead", "M160 235L160 210"],
        ],
        flows: [
          ["red", "M97 194H108"],
          ["blue", "M147 194H136"],
        ],
      },
    ],
  },
  {
    scenes: [3, 12, 13],
    outline: [
      ["ink", "M20 132H300"],
    ],
    parts: [
      {
        cue: 'part-3-0', label: "Covalent|shared pair", at: [8,32], tip: [176,72], align: 'start',
        strokes: [
          ["paper", "M144 40a32 32 0 1 0 0.1 0ZM208 40a32 32 0 1 0 0.1 0Z"],
          ["ink", "M144 40a32 32 0 1 0 0.1 0ZM208 40a32 32 0 1 0 0.1 0Z"],
          ["amber", "M171.5 64a4.5 4.5 0 1 0 9 0a4.5 4.5 0 1 0 -9 0M171.5 76a4.5 4.5 0 1 0 9 0a4.5 4.5 0 1 0 -9 0"],
          ["lead", "M84 44L116 58"],
        ],
        flows: [
          ["blue", "M144 72H170"],
          ["blue", "M208 72H182"],
        ],
      },
      {
        cue: 'part-3-1', label: "Dative bond|H₃N: → H⁺", at: [8,244], tip: [182,196], align: 'start',
        strokes: [
          ["paper", "M142 162a34 34 0 1 0 0.1 0Z"],
          ["blue", "M130 196a12 12 0 1 0 24 0a12 12 0 1 0 -24 0Z"],
          ["red", "M220 196a12 12 0 1 0 24 0a12 12 0 1 0 -24 0Z"],
          ["amber", "M166 190a4.5 4.5 0 1 0 9 0a4.5 4.5 0 1 0 -9 0M166 202a4.5 4.5 0 1 0 9 0a4.5 4.5 0 1 0 -9 0"],
          ["zoom", "M212 172a24 24 0 1 0 0.1 0Z"],
          ["lead", "M88 232L120 214"],
        ],
        flows: [
          ["amber", "M176 196H212"],
        ],
      },
    ],
  },
  {
    scenes: [4],
    outline: [
      ["paper", "M54 50H266V214H54Z"],
    ],
    parts: [
      {
        cue: 'part-4-0', label: "Metal ions (+)", at: [8,30], tip: [96,86], align: 'start',
        strokes: [
          ["red", "M82 86a14 14 0 1 0 28 0a14 14 0 1 0 -28 0M146 86a14 14 0 1 0 28 0a14 14 0 1 0 -28 0M210 86a14 14 0 1 0 28 0a14 14 0 1 0 -28 0M82 134a14 14 0 1 0 28 0a14 14 0 1 0 -28 0M146 134a14 14 0 1 0 28 0a14 14 0 1 0 -28 0M210 134a14 14 0 1 0 28 0a14 14 0 1 0 -28 0M82 182a14 14 0 1 0 28 0a14 14 0 1 0 -28 0M146 182a14 14 0 1 0 28 0a14 14 0 1 0 -28 0M210 182a14 14 0 1 0 28 0a14 14 0 1 0 -28 0"],
          ["ink", "M92 86h8m-4-4v8M156 86h8m-4-4v8M220 86h8m-4-4v8M92 134h8m-4-4v8M156 134h8m-4-4v8M220 134h8m-4-4v8M92 182h8m-4-4v8M156 182h8m-4-4v8M220 182h8m-4-4v8"],
          ["lead", "M66 36L86 72"],
        ],
      },
      {
        cue: 'part-4-1', label: "Delocalised|e⁻ sea", at: [312,248], tip: [220,158], align: 'end',
        strokes: [
          ["lead", "M264 234L246 206"],
        ],
        flows: [
          ["amber", "M64 110Q128 102 192 114Q232 120 256 108"],
          ["amber", "M256 158Q192 166 128 154Q88 148 64 160"],
        ],
      },
    ],
  },
  {
    scenes: [5, 6, 15, 17],
    outline: [
      ["ink", "M18 122H302"],
    ],
    parts: [
      {
        cue: 'part-6-0', label: "Linear CO₂|180° (cancels)", at: [8,24], tip: [82,76], align: 'start',
        strokes: [
          ["shade", "M74 76a8 8 0 1 0 16 0a8 8 0 1 0 -16 0"],
          ["red", "M32 76a8 8 0 1 0 16 0a8 8 0 1 0 -16 0M116 76a8 8 0 1 0 16 0a8 8 0 1 0 -16 0"],
          ["ink", "M50 74h22m-22 4h22M92 74h22m-22 4h22"],
        ],
        flows: [
          ["blue", "M72 94H38"],
          ["blue", "M92 94H126"],
        ],
      },
      {
        cue: 'part-6-1', label: "Tetrahedral|CH₄ (109.5°)", at: [312,24], tip: [236,76], align: 'end',
        strokes: [
          ["shade", "M228 78a8 8 0 1 0 16 0a8 8 0 1 0 -16 0"],
          ["blue", "M230 48a6 6 0 1 0 12 0a6 6 0 1 0 -12 0M200 96a6 6 0 1 0 12 0a6 6 0 1 0 -12 0M256 98a6 6 0 1 0 12 0a6 6 0 1 0 -12 0M262 66a6 6 0 1 0 12 0a6 6 0 1 0 -12 0"],
          ["ink", "M236 60V70M230 82L210 96M242 84L258 98"],
          ["zoom", "M244 76L262 72"],
        ],
      },
      {
        cue: 'part-5-0', label: "Intramolecular|O—H bonds", at: [8,248], tip: [98,194], align: 'start',
        strokes: [
          ["red", "M84 180a10 10 0 1 0 20 0a10 10 0 1 0 -20 0M214 180a10 10 0 1 0 20 0a10 10 0 1 0 -20 0"],
          ["blue", "M60 202a7 7 0 1 0 14 0a7 7 0 1 0 -14 0M114 198a7 7 0 1 0 14 0a7 7 0 1 0 -14 0M190 202a7 7 0 1 0 14 0a7 7 0 1 0 -14 0M244 198a7 7 0 1 0 14 0a7 7 0 1 0 -14 0"],
          ["ink", "M86 186L72 198M102 186L116 196M216 186L202 198M232 186L246 196"],
          ["lead", "M58 232L66 210"],
        ],
      },
      {
        cue: 'part-5-1', label: "Hydrogen bond|between H₂O", at: [312,248], tip: [172,188], align: 'end',
        strokes: [
          ["zoom", "M128 198L214 184"],
          ["lead", "M210 232L172 192"],
        ],
        flows: [
          ["green", "M134 196Q172 182 212 186"],
        ],
      },
      {
        cue: 'part-6-2', label: "Lone pairs|bend to 105°", at: [160,144], tip: [94,160], align: 'middle',
        strokes: [
          ["amber", "M83 158a4 4 0 1 0 8 0a4 4 0 1 0 -8 0M97 158a4 4 0 1 0 8 0a4 4 0 1 0 -8 0"],
        ],
        flows: [
          ["amber", "M76 164Q68 176 66 190"],
        ],
      },
    ],
  },
])
