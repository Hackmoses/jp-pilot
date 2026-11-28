import { processDrawing } from '../../biology/AnatomyBoard'

// Atomic structure, isotopes, electron shells, and periodic trends for chem-atomic-structure.
// Checked against OpenStax Chemistry 2e §2.3 (Fig. 2.11, atomic structure and isotopes) and
// §6.5 (Fig. 6.30, covalent radius trends); Understanding Chemistry pp. 26–33, 36–40.
export default processDrawing("Atomic structure and the periodic table", [
  {
    outline: [
      ["paper", "M168 68a70 70 0 1 0 0.1 0Z"],
    ],
    parts: [
      {
        cue: 'part-1-0', label: "Nucleus", at: [168,256], tip: [168,152], align: 'middle',
        strokes: [
          ["lead", "M168 242L168 156"],
        ],
      },
      {
        cue: 'part-1-1', label: "Electrons (−)", at: [312,30], tip: [226,90], align: 'end',
        strokes: [
          ["lead", "M264 34L224 82"],
        ],
        flows: [
          ["blue", "M168 68A70 70 0 1 1 98 138"],
        ],
      },
      {
        cue: 'part-2-0', label: "Protons (+)|Z = 17", at: [8,30], tip: [160,130], align: 'start',
        strokes: [
          ["red", "M156 134a5 5 0 1 0 10 0a5 5 0 1 0 -10 0M168 128a5 5 0 1 0 10 0a5 5 0 1 0 -10 0M163 142a5 5 0 1 0 10 0a5 5 0 1 0 -10 0"],
          ["lead", "M72 44L156 130"],
        ],
      },
      {
        cue: 'part-2-1', label: "Neutrons (0)|A − Z", at: [8,248], tip: [160,146], align: 'start',
        strokes: [
          ["shade", "M156 143a5 5 0 1 0 10 0a5 5 0 1 0 -10 0M170 139a5 5 0 1 0 10 0a5 5 0 1 0 -10 0M160 126a5 5 0 1 0 10 0a5 5 0 1 0 -10 0"],
          ["lead", "M72 234L156 148"],
        ],
      },
      {
        cue: 'part-4-0', label: "Inner shells|2, 8", at: [8,134], tip: [120,124], align: 'start',
        strokes: [
          ["ink", "M168 110a28 28 0 1 0 0.1 0ZM168 90a48 48 0 1 0 0.1 0Z"],
          ["blue", "M164 110a4 4 0 1 0 8 0a4 4 0 1 0 -8 0M164 166a4 4 0 1 0 8 0a4 4 0 1 0 -8 0M164 90a4 4 0 1 0 8 0a4 4 0 1 0 -8 0M164 186a4 4 0 1 0 8 0a4 4 0 1 0 -8 0M116 138a4 4 0 1 0 8 0a4 4 0 1 0 -8 0M212 138a4 4 0 1 0 8 0a4 4 0 1 0 -8 0M130 104a4 4 0 1 0 8 0a4 4 0 1 0 -8 0M198 104a4 4 0 1 0 8 0a4 4 0 1 0 -8 0M130 172a4 4 0 1 0 8 0a4 4 0 1 0 -8 0M198 172a4 4 0 1 0 8 0a4 4 0 1 0 -8 0"],
          ["lead", "M84 138L114 138"],
        ],
        flows: [
          ["blue", "M168 90A48 48 0 0 1 216 138"],
        ],
      },
      {
        cue: 'part-5-0', label: "Outer shell|7 e⁻ (Gp VII)", at: [312,244], tip: [232,162], align: 'end',
        strokes: [
          ["ink", "M168 68a70 70 0 1 0 0.1 0Z"],
          ["amber", "M160 68a4.5 4.5 0 1 0 9 0a4.5 4.5 0 1 0 -9 0M170 68a4.5 4.5 0 1 0 9 0a4.5 4.5 0 1 0 -9 0M160 208a4.5 4.5 0 1 0 9 0a4.5 4.5 0 1 0 -9 0M170 208a4.5 4.5 0 1 0 9 0a4.5 4.5 0 1 0 -9 0M93 128a4.5 4.5 0 1 0 9 0a4.5 4.5 0 1 0 -9 0M93 148a4.5 4.5 0 1 0 9 0a4.5 4.5 0 1 0 -9 0M234 138a4.5 4.5 0 1 0 9 0a4.5 4.5 0 1 0 -9 0"],
          ["lead", "M264 230L230 176"],
        ],
        flows: [
          ["amber", "M238 138A70 70 0 0 1 168 208"],
        ],
      },
    ],
  },
  {
    scenes: [3],
    outline: [
      ["paper", "M84 54a48 48 0 1 0 0.1 0ZM236 54a48 48 0 1 0 0.1 0Z"],
    ],
    parts: [
      {
        cue: 'part-3-0', label: "³⁵Cl (75%)|17p, 18n", at: [84,26], tip: [84,102], align: 'middle',
        strokes: [
          ["ink", "M84 54a48 48 0 1 0 0.1 0Z"],
          ["red", "M72 98a5 5 0 1 0 10 0a5 5 0 1 0 -10 0M86 96a5 5 0 1 0 10 0a5 5 0 1 0 -10 0"],
          ["shade", "M78 107a5 5 0 1 0 10 0a5 5 0 1 0 -10 0M69 106a5 5 0 1 0 10 0a5 5 0 1 0 -10 0"],
        ],
      },
      {
        cue: 'part-3-1', label: "³⁷Cl (25%)|17p, 20n", at: [236,26], tip: [236,102], align: 'middle',
        strokes: [
          ["ink", "M236 54a48 48 0 1 0 0.1 0Z"],
          ["red", "M224 98a5 5 0 1 0 10 0a5 5 0 1 0 -10 0M238 96a5 5 0 1 0 10 0a5 5 0 1 0 -10 0"],
          ["shade", "M230 107a5 5 0 1 0 10 0a5 5 0 1 0 -10 0M221 106a5 5 0 1 0 10 0a5 5 0 1 0 -10 0"],
          ["amber", "M240 108a5.5 5.5 0 1 0 11 0a5.5 5.5 0 1 0 -11 0M231 87a5.5 5.5 0 1 0 11 0a5.5 5.5 0 1 0 -11 0"],
        ],
      },
      {
        cue: 'part-3-2', label: "Weighted Aᵣ|35.5", at: [160,248], tip: [120,204], align: 'middle',
        strokes: [
          ["ink", "M160 198L148 222H172ZM64 206L256 190"],
          ["lead", "M142 232L118 206"],
        ],
        flows: [
          ["amber", "M210 182Q160 176 92 192"],
        ],
      },
    ],
  },
  {
    scenes: [6, 15],
    outline: [
      ["ink", "M46 42H248M46 42V224"],
    ],
    parts: [
      {
        cue: 'part-6-0', label: "Across period:|radius ↓", at: [312,20], tip: [184,74], align: 'end',
        strokes: [
          ["paper", "M90 62a20 20 0 1 0 0.1 0ZM160 66a16 16 0 1 0 0.1 0ZM222 70a12 12 0 1 0 0.1 0Z"],
          ["red", "M86 82a4 4 0 1 0 8 0a4 4 0 1 0 -8 0M156 82a4 4 0 1 0 8 0a4 4 0 1 0 -8 0M218 82a4 4 0 1 0 8 0a4 4 0 1 0 -8 0"],
        ],
        flows: [
          ["red", "M114 54H206"],
        ],
      },
      {
        cue: 'part-6-1', label: "Down group:|more shells", at: [8,248], tip: [90,192], align: 'start',
        strokes: [
          ["paper", "M90 116a22 22 0 1 0 0.1 0ZM90 162a28 28 0 1 0 0.1 0Z"],
          ["ink", "M90 124a14 14 0 1 0 0.1 0ZM90 172a18 18 0 1 0 0.1 0ZM90 181a9 9 0 1 0 0.1 0Z"],
          ["lead", "M46 232L66 214"],
        ],
        flows: [
          ["blue", "M54 96V206"],
        ],
      },
      {
        cue: 'part-6-2', label: "Easier e⁻|loss", at: [236,196], tip: [148,190], align: 'middle',
        strokes: [
          ["amber", "M114 190a4.5 4.5 0 1 0 9 0a4.5 4.5 0 1 0 -9 0"],
        ],
        flows: [
          ["green", "M124 190Q160 184 186 190"],
        ],
      },
    ],
  },
])
