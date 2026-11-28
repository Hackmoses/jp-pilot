import { processDrawing } from '../../biology/AnatomyBoard'

// Collision theory, catalyst pathway, and dynamic equilibrium for chem-rates-equilibrium.
// Checked against OpenStax Chemistry 2e §12.5 (Figs. 12.14 & 12.16, collision theory & Ea),
// §12.7 (Fig. 12.22, catalyst lowering Ea), §13.1 (Fig. 13.2, dynamic equilibrium), and
// §13.3 (Le Chatelier's principle); Understanding Chemistry pp. 195, 198–203, 207–214.
export default processDrawing("Rates and equilibrium", [
  {
    outline: [
      ["ink", "M30 114V218H292"],
    ],
    parts: [
      {
        cue: 'part-1-0', label: "More surface|faster hits", at: [8,24], tip: [108,74], align: 'start',
        strokes: [
          ["paper", "M26 56H58V88H26Z"],
          ["amber", "M84 56H98V70H84ZM104 56H118V70H104ZM84 76H98V90H84ZM104 76H118V90H104Z"],
          ["ink", "M64 72H78"],
        ],
        flows: [
          ["blue", "M128 62H118"],
          ["blue", "M128 84H118"],
        ],
      },
      {
        cue: 'part-2-0', label: "Effective|collision", at: [312,24], tip: [236,74], align: 'end',
        strokes: [
          ["red", "M204 64a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"],
          ["blue", "M250 64a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"],
          ["ink", "M236 56L238 66L244 60M236 86L238 76L230 82"],
        ],
        flows: [
          ["red", "M222 73H234"],
          ["blue", "M250 73H238"],
        ],
      },
      {
        cue: 'part-2-1', label: "Uncatalysed|Eₐ hill", at: [160,104], tip: [142,150], align: 'middle',
        strokes: [
          ["ink", "M38 176H74Q144 82 212 204H272"],
          ["zoom", "M74 176H212"],
        ],
        flows: [
          ["red", "M138 174V128"],
        ],
      },
      {
        cue: 'part-4-0', label: "Catalyst path|lower Eₐ", at: [8,248], tip: [158,158], align: 'start',
        strokes: [
          ["zoom", "M74 176Q144 126 212 204"],
          ["lead", "M84 232L126 164"],
        ],
        flows: [
          ["green", "M96 168Q144 136 188 180"],
        ],
      },
      {
        cue: 'part-4-1', label: "Same yield", at: [312,248], tip: [272,204], align: 'end',
        strokes: [
          ["green", "M256 200H280V208H256Z"],
          ["lead", "M276 232L270 208"],
        ],
      },
    ],
  },
  {
    scenes: [5, 6, 16, 17, 18],
    outline: [
      ["ink", "M76 64H244V212H76Z"],
    ],
    parts: [
      {
        cue: 'part-5-2', label: "Closed|vessel", at: [160,24], tip: [160,56], align: 'middle',
        strokes: [
          ["shade", "M134 52H186V64H134Z"],
        ],
      },
      {
        cue: 'part-5-0', label: "Forward|rate", at: [8,136], tip: [160,112], align: 'start',
        strokes: [
          ["blue", "M88 98a8 8 0 1 0 16 0a8 8 0 1 0 -16 0M88 132a8 8 0 1 0 16 0a8 8 0 1 0 -16 0M88 166a8 8 0 1 0 16 0a8 8 0 1 0 -16 0"],
          ["lead", "M64 136L76 136"],
        ],
        flows: [
          ["blue", "M116 114H204"],
        ],
      },
      {
        cue: 'part-5-1', label: "Reverse|rate", at: [312,136], tip: [160,162], align: 'end',
        strokes: [
          ["green", "M214 114a10 10 0 1 0 20 0a10 10 0 1 0 -20 0M214 154a10 10 0 1 0 20 0a10 10 0 1 0 -20 0"],
          ["lead", "M256 136L244 136"],
        ],
        flows: [
          ["red", "M204 162H116"],
        ],
      },
      {
        cue: 'part-6-0', label: "Shift opposes|stress", at: [160,248], tip: [160,192], align: 'middle',
        strokes: [
          ["lead", "M160 232L160 200"],
        ],
        flows: [
          ["amber", "M118 190H202"],
        ],
      },
    ],
  },
])
