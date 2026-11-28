import { processDrawing } from '../../biology/AnatomyBoard'

// Energy profiles, Hess's law cycle, and bond energy diagrams for chem-energy.
// Checked against OpenStax Chemistry 2e §5.3 (Fig. 5.18, enthalpy and Hess's law),
// §7.5 (bond breaking vs bond forming), and §12.5 (Fig. 12.16, reaction energy profiles);
// Understanding Chemistry pp. 180–181, 188–191, 198.
export default processDrawing("Energy changes", [
  {
    outline: [
      ["ink", "M26 42V226H146M176 42V226H296"],
    ],
    parts: [
      {
        cue: 'part-1-0', label: "Exothermic|heat out", at: [86,26], tip: [86,66], align: 'middle',
        strokes: [
          ["ink", "M30 124H56Q86 20 112 188H142"],
        ],
        flows: [
          ["red", "M108 148Q128 134 144 126"],
        ],
      },
      {
        cue: 'part-1-1', label: "Endothermic|heat in", at: [236,26], tip: [236,66], align: 'middle',
        strokes: [
          ["ink", "M180 186H206Q236 20 262 122H292"],
        ],
        flows: [
          ["blue", "M288 164Q270 152 254 142"],
        ],
      },
      {
        cue: 'part-3-0', label: "Eₐ", at: [54,104], tip: [74,98], align: 'middle',
        strokes: [
          ["zoom", "M56 124H112M206 186H262"],
        ],
        flows: [
          ["amber", "M74 122V84"],
        ],
      },
      {
        cue: 'part-3-1', label: "ΔH < 0", at: [86,248], tip: [98,158], align: 'middle',
        strokes: [
          ["zoom", "M56 124H106"],
        ],
        flows: [
          ["red", "M98 126V186"],
        ],
      },
      {
        cue: 'part-3-2', label: "ΔH > 0", at: [236,248], tip: [248,154], align: 'middle',
        strokes: [
          ["zoom", "M206 186H256"],
        ],
        flows: [
          ["blue", "M248 184V124"],
        ],
      },
    ],
  },
  {
    scenes: [5],
    outline: [
      ["ink", "M24 218H296"],
    ],
    parts: [
      {
        cue: 'part-5-0', label: "Lattice (+)|pull apart", at: [8,26], tip: [82,114], align: 'start',
        strokes: [
          ["paper", "M38 178H82V210H38Z"],
          ["red", "M44 186a5 5 0 1 0 10 0a5 5 0 1 0 -10 0M64 198a5 5 0 1 0 10 0a5 5 0 1 0 -10 0"],
          ["blue", "M64 186a5 5 0 1 0 10 0a5 5 0 1 0 -10 0M44 198a5 5 0 1 0 10 0a5 5 0 1 0 -10 0"],
          ["red", "M140 58a6 6 0 1 0 12 0a6 6 0 1 0 -12 0"],
          ["blue", "M168 58a6 6 0 1 0 12 0a6 6 0 1 0 -12 0"],
        ],
        flows: [
          ["blue", "M66 174Q94 114 134 66"],
        ],
      },
      {
        cue: 'part-5-1', label: "Hydration (−)|water surrounds", at: [312,26], tip: [238,114], align: 'end',
        strokes: [
          ["blue", "M228 174H284V212H228Z"],
          ["red", "M250 193a6 6 0 1 0 12 0a6 6 0 1 0 -12 0"],
          ["paper", "M236 183a4 4 0 1 0 8 0a4 4 0 1 0 -8 0M268 183a4 4 0 1 0 8 0a4 4 0 1 0 -8 0M236 203a4 4 0 1 0 8 0a4 4 0 1 0 -8 0M268 203a4 4 0 1 0 8 0a4 4 0 1 0 -8 0"],
        ],
        flows: [
          ["red", "M186 66Q224 114 252 170"],
        ],
      },
      {
        cue: 'part-5-2', label: "Direct route|same ΔH", at: [160,248], tip: [154,194], align: 'middle',
        flows: [
          ["green", "M90 194H220"],
        ],
      },
    ],
  },
  {
    scenes: [6],
    outline: [
      ["ink", "M28 40V226H294"],
    ],
    parts: [
      {
        cue: 'part-6-0', label: "Break bonds|absorb (+)", at: [8,24], tip: [108,96], align: 'start',
        strokes: [
          ["paper", "M40 122H92V148H40Z"],
          ["ink", "M50 135h16m10 0h10"],
          ["amber", "M126 52H194V78H126Z"],
          ["red", "M138 65a4 4 0 1 0 8 0a4 4 0 1 0 -8 0M150 65a4 4 0 1 0 8 0a4 4 0 1 0 -8 0M166 65a4 4 0 1 0 8 0a4 4 0 1 0 -8 0M178 65a4 4 0 1 0 8 0a4 4 0 1 0 -8 0"],
        ],
        flows: [
          ["blue", "M78 118Q100 84 124 68"],
        ],
      },
      {
        cue: 'part-6-1', label: "Form bonds|release (−)", at: [312,24], tip: [230,118], align: 'end',
        strokes: [
          ["green", "M220 176H282V202H220Z"],
          ["ink", "M232 189h16m10 0h16"],
        ],
        flows: [
          ["red", "M198 68Q228 110 248 172"],
        ],
      },
      {
        cue: 'part-6-2', label: "Net ΔH|broken − formed", at: [160,250], tip: [160,164], align: 'middle',
        strokes: [
          ["zoom", "M92 135H216"],
        ],
        flows: [
          ["amber", "M160 138V188"],
        ],
      },
    ],
  },
])
