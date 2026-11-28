import { processDrawing } from '../../biology/AnatomyBoard'

// Electron transfer and oxidation-number scale for chem-redox.
// Checked against OpenStax Chemistry 2e §4.2 (oxidation numbers and redox reactions) and
// §17.1 (electron transfer half-reactions); Understanding Chemistry pp. 58–59, 238–240;
// Lamlad Chemistry 1 pp. 100–103.
export default processDrawing("Oxidation numbers and redox", [
  {
    outline: [
      ["ink", "M36 192H284"],
    ],
    parts: [
      {
        cue: 'part-1-0', label: "Zn → Zn²⁺|loses e⁻", at: [8,24], tip: [76,88], align: 'start',
        strokes: [
          ["amber", "M54 88a22 22 0 1 0 44 0a22 22 0 1 0 -44 0Z"],
          ["lead", "M52 46L64 68"],
        ],
      },
      {
        cue: 'part-1-1', label: "Cu²⁺ → Cu|gains e⁻", at: [312,24], tip: [244,88], align: 'end',
        strokes: [
          ["blue", "M222 88a22 22 0 1 0 44 0a22 22 0 1 0 -44 0Z"],
          ["lead", "M268 46L256 68"],
        ],
      },
      {
        cue: 'part-1-2', label: "2e⁻ transfer", at: [160,44], tip: [160,64], align: 'middle',
        flows: [
          ["amber", "M102 80Q160 44 218 80"],
        ],
      },
      {
        cue: 'part-4-0', label: "Reducing|agent", at: [8,136], tip: [76,112], align: 'start',
        strokes: [
          ["lead", "M54 128L68 112"],
        ],
      },
      {
        cue: 'part-4-1', label: "Oxidising|agent", at: [312,136], tip: [244,112], align: 'end',
        strokes: [
          ["lead", "M266 128L252 112"],
        ],
      },
      {
        cue: 'part-2-0', label: "O.N. scale|free = 0", at: [8,248], tip: [136,192], align: 'start',
        strokes: [
          ["ink", "M48 186V198M92 186V198M136 184V200M180 186V198M224 186V198M268 186V198"],
          ["green", "M130 186H142V198H130Z"],
          ["lead", "M66 234L130 200"],
        ],
      },
      {
        cue: 'part-3-0', label: "O.N. ↑|(oxidised)", at: [182,150], tip: [180,166], align: 'middle',
        flows: [
          ["red", "M138 180Q180 156 222 180"],
        ],
      },
      {
        cue: 'part-3-1', label: "O.N. ↓|(reduced)", at: [250,248], tip: [180,218], align: 'middle',
        flows: [
          ["blue", "M222 204Q180 228 138 204"],
        ],
      },
    ],
  },
])
