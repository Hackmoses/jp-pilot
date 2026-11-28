import { processDrawing } from '../../biology/AnatomyBoard'

// Gas laws (piston cylinder, Kelvin scale, Dalton's law over water, Graham's diffusion) for
// chem-gas-laws. Checked against OpenStax Chemistry 2e §9.2 (Figs. 9.10, 9.12–9.13), §9.3
// (Fig. 9.21, collecting gas over water), and §9.4 (Fig. 9.27, effusion/diffusion);
// Understanding Chemistry pp. 84–99.
export default processDrawing("Gas laws", [
  {
    outline: [
      ["ink", "M118 44V208H210V44"],
      ["shade", "M120 82H208V94H120Z"],
      ["ink", "M160 36V82"],
    ],
    parts: [
      {
        cue: 'part-1-0', label: "Wall hits|(pressure)", at: [312,150], tip: [198,148], align: 'end',
        strokes: [
          ["blue", "M140 128a5 5 0 1 0 10 0a5 5 0 1 0 -10 0M176 140a5 5 0 1 0 10 0a5 5 0 1 0 -10 0M148 172a5 5 0 1 0 10 0a5 5 0 1 0 -10 0M182 180a5 5 0 1 0 10 0a5 5 0 1 0 -10 0"],
          ["lead", "M246 152L212 152"],
        ],
        flows: [
          ["red", "M156 144L206 144"],
          ["red", "M144 176L120 176"],
        ],
      },
      {
        cue: 'part-1-1', label: "Heat (T)", at: [164,258], tip: [164,226], align: 'middle',
        strokes: [
          ["red", "M146 232Q164 214 182 232Q164 238 146 232Z"],
        ],
        flows: [
          ["amber", "M164 220V200"],
        ],
      },
      {
        cue: 'part-2-0', label: "Kelvin scale|°C + 273", at: [8,26], tip: [68,146], align: 'start',
        strokes: [
          ["paper", "M58 76H70V198H58Z"],
          ["ink", "M58 76H70V198H58ZM54 96H74M54 146H74M54 196H74"],
          ["red", "M60 128H68V196H60Z"],
          ["lead", "M44 46L58 84"],
        ],
      },
      {
        cue: 'part-3-0', label: "Boyle:|P↑ V↓", at: [312,48], tip: [188,68], align: 'end',
        strokes: [
          ["lead", "M258 52L194 64"],
        ],
        flows: [
          ["red", "M186 50V78"],
        ],
      },
      {
        cue: 'part-3-1', label: "Charles:|T↑ V↑", at: [312,98], tip: [142,68], align: 'end',
        strokes: [
          ["lead", "M258 98L212 88"],
        ],
        flows: [
          ["green", "M142 80V52"],
        ],
      },
    ],
  },
  {
    scenes: [5, 15],
    outline: [
      ["blue", "M54 172H228V226H54Z"],
      ["ink", "M54 142V226H228V142"],
      ["ink", "M104 196V64Q141 56 178 64V196"],
    ],
    parts: [
      {
        cue: 'part-5-0', label: "Dry gas|P_dry", at: [8,30], tip: [128,96], align: 'start',
        strokes: [
          ["blue", "M124 94a5 5 0 1 0 10 0a5 5 0 1 0 -10 0M152 88a5 5 0 1 0 10 0a5 5 0 1 0 -10 0M136 116a5 5 0 1 0 10 0a5 5 0 1 0 -10 0"],
          ["lead", "M66 36L114 82"],
        ],
        flows: [
          ["blue", "M138 98L174 84"],
        ],
      },
      {
        cue: 'part-5-1', label: "Water vapour|P_water", at: [8,250], tip: [144,152], align: 'start',
        strokes: [
          ["lead", "M96 244L138 176"],
        ],
        flows: [
          ["amber", "M128 170V134"],
          ["amber", "M154 170V134"],
        ],
      },
      {
        cue: 'part-5-2', label: "P_total =|P_dry + P_water", at: [312,114], tip: [192,114], align: 'end',
        strokes: [
          ["ink", "M188 68H198V166H188"],
          ["lead", "M222 114L198 114"],
        ],
      },
    ],
  },
  {
    scenes: [7],
    outline: [
      ["ink", "M36 96H284V176H36Z"],
      ["shade", "M154 96H166V176H154Z"],
    ],
    parts: [
      {
        cue: 'part-7-0', label: "Light H₂|4× faster", at: [8,34], tip: [130,124], align: 'start',
        strokes: [
          ["blue", "M56 122a5 5 0 1 0 10 0a5 5 0 1 0 -10 0M72 148a5 5 0 1 0 10 0a5 5 0 1 0 -10 0M94 118a5 5 0 1 0 10 0a5 5 0 1 0 -10 0"],
          ["lead", "M52 52L62 114"],
        ],
        flows: [
          ["blue", "M108 122H238"],
        ],
      },
      {
        cue: 'part-7-1', label: "Heavy O₂|slower", at: [312,244], tip: [212,152], align: 'end',
        strokes: [
          ["red", "M246 124a9 9 0 1 0 18 0a9 9 0 1 0 -18 0M248 150a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"],
          ["lead", "M264 230L256 168"],
        ],
        flows: [
          ["red", "M238 154H186"],
        ],
      },
    ],
  },
])
