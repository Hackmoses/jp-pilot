import { processDrawing } from '../../biology/AnatomyBoard'

// Acids, bases, neutralisation, pH scale, and salt hydrolysis for chem-acids-bases.
// Checked against OpenStax Chemistry 2e §14.1 (proton transfer), §14.2 (Fig. 14.5, pH 0–14),
// §14.3 (Fig. 14.7, strong vs weak acid ionisation), and §14.4 (salt hydrolysis);
// Understanding Chemistry pp. 136–138, 142–150, 157–158; Lamlad Chemistry 2 pp. 165–168, 178–186.
export default processDrawing("Acids, bases and salts", [
  {
    outline: [
      ["ink", "M36 168H284V192H36Z"],
    ],
    parts: [
      {
        cue: 'part-1-0', label: "Acid (H⁺)", at: [8,28], tip: [76,74], align: 'start',
        strokes: [
          ["red", "M58 74a18 18 0 1 0 36 0a18 18 0 1 0 -36 0Z"],
          ["ink", "M72 74h8m-4-4v8"],
          ["lead", "M42 36L64 58"],
        ],
      },
      {
        cue: 'part-1-1', label: "Alkali (OH⁻)", at: [312,28], tip: [244,74], align: 'end',
        strokes: [
          ["blue", "M226 74a18 18 0 1 0 36 0a18 18 0 1 0 -36 0Z"],
          ["ink", "M240 74h8"],
          ["lead", "M274 36L254 58"],
        ],
      },
      {
        cue: 'part-4-0', label: "Water (H₂O)", at: [160,118], tip: [160,74], align: 'middle',
        strokes: [
          ["green", "M142 74a18 18 0 1 0 36 0a18 18 0 1 0 -36 0Z"],
        ],
        flows: [
          ["red", "M96 74H138"],
          ["blue", "M224 74H182"],
        ],
      },
      {
        cue: 'part-3-0', label: "Acidic|pH 0–6", at: [8,248], tip: [88,180], align: 'start',
        strokes: [
          ["red", "M36 168H142V192H36Z"],
          ["lead", "M48 232L72 194"],
        ],
      },
      {
        cue: 'part-3-1', label: "Neutral|pH 7", at: [160,248], tip: [160,180], align: 'middle',
        strokes: [
          ["green", "M142 168H178V192H142Z"],
          ["lead", "M160 232L160 194"],
        ],
      },
      {
        cue: 'part-3-2', label: "Alkaline|pH 8–14", at: [312,248], tip: [230,180], align: 'end',
        strokes: [
          ["blue", "M178 168H284V192H178Z"],
          ["lead", "M272 232L248 194"],
        ],
      },
      {
        cue: 'part-6-0', label: "NH₄Cl|(acidic)", at: [76,126], tip: [76,156], align: 'middle',
        flows: [
          ["red", "M76 148V166"],
        ],
      },
      {
        cue: 'part-6-1', label: "Na₂CO₃|(alkaline)", at: [244,126], tip: [244,156], align: 'middle',
        flows: [
          ["blue", "M244 148V166"],
        ],
      },
    ],
  },
  {
    scenes: [2, 15],
    outline: [
      ["ink", "M34 52V150H136V52M184 52V150H286V52"],
    ],
    parts: [
      {
        cue: 'part-2-0', label: "Strong HCl|all split (→)", at: [8,24], tip: [85,104], align: 'start',
        strokes: [
          ["blue", "M36 80H134V148H36Z"],
          ["red", "M54 102a7 7 0 1 0 14 0a7 7 0 1 0 -14 0M102 102a7 7 0 1 0 14 0a7 7 0 1 0 -14 0"],
          ["paper", "M54 130a7 7 0 1 0 14 0a7 7 0 1 0 -14 0M102 130a7 7 0 1 0 14 0a7 7 0 1 0 -14 0"],
        ],
        flows: [
          ["red", "M70 116H100"],
        ],
      },
      {
        cue: 'part-2-1', label: "Weak acid|few split (⇌)", at: [312,24], tip: [235,104], align: 'end',
        strokes: [
          ["amber", "M186 80H284V148H186Z"],
          ["paper", "M200 100h22v14h-22ZM248 100h22v14h-22ZM200 126h22v14h-22Z"],
          ["red", "M256 132a6 6 0 1 0 12 0a6 6 0 1 0 -12 0"],
        ],
        flows: [
          ["amber", "M226 122H250"],
          ["amber", "M250 132H226"],
        ],
      },
      {
        cue: 'part-2-2', label: "Dibasic H₂SO₄|gives 2 H⁺", at: [160,248], tip: [160,198], align: 'middle',
        strokes: [
          ["red", "M76 198a12 12 0 1 0 24 0a12 12 0 1 0 -24 0M204 184a8 8 0 1 0 16 0a8 8 0 1 0 -16 0M204 206a8 8 0 1 0 16 0a8 8 0 1 0 -16 0"],
          ["lead", "M160 232L160 206"],
        ],
        flows: [
          ["red", "M104 198H198", "split"],
        ],
      },
    ],
  },
])
