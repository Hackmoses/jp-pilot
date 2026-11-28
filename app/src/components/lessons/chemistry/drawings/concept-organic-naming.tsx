import { processDrawing } from '../../biology/AnatomyBoard'

// IUPAC organic naming, ester splitting, and structural/geometric isomerism for
// chem-organic-naming. Checked against OpenStax Chemistry 2e §20.1 (Figs. 20.4 & 20.8,
// alkane chains, structural isomers, cis-trans alkenes), §20.2 (alcohols), and §20.3
// (esters); Lamlad Chemistry 2 pp. 227–238, 259–262, 315–316; New School Chemistry pp. 506–513.
export default processDrawing("Naming organic compounds", [
  {
    outline: [
      ["ink", "M24 174H296"],
    ],
    parts: [
      {
        cue: 'part-1-0', label: "4-C chain|(but-)", at: [8,112], tip: [148,88], align: 'start',
        strokes: [
          ["paper", "M68 74a12 12 0 1 0 24 0a12 12 0 1 0 -24 0M124 74a12 12 0 1 0 24 0a12 12 0 1 0 -24 0M180 74a12 12 0 1 0 24 0a12 12 0 1 0 -24 0M236 74a12 12 0 1 0 24 0a12 12 0 1 0 -24 0"],
          ["ink", "M92 74H124M148 74H180M204 74H236"],
          ["lead", "M54 108L72 84"],
        ],
      },
      {
        cue: 'part-1-1', label: "Number 1→4|lowest locant", at: [160,22], tip: [164,48], align: 'middle',
        flows: [
          ["blue", "M78 50H252"],
        ],
      },
      {
        cue: 'part-3-0', label: "—OH at C2|(-ol)", at: [160,144], tip: [136,114], align: 'middle',
        strokes: [
          ["ink", "M136 86V102"],
          ["red", "M124 114a12 12 0 1 0 24 0a12 12 0 1 0 -24 0Z"],
        ],
        flows: [
          ["red", "M136 124V100"],
        ],
      },
      {
        cue: 'part-4-0', label: "-ane   -ene   -yne", at: [160,256], tip: [160,210], align: 'middle',
        strokes: [
          ["green", "M32 188H288V230H32Z"],
          ["ink", "M54 209H94M140 206H180M140 212H180M226 204H266M226 209H266M226 214H266"],
          ["lead", "M160 240L160 230"],
        ],
      },
    ],
  },
  {
    scenes: [6, 10, 16],
    outline: [
      ["ink", "M176 118H204"],
    ],
    parts: [
      {
        cue: 'part-6-0', label: "Cut at —O—", at: [190,26], tip: [190,118], align: 'middle',
        strokes: [
          ["zoom", "M190 48V186"],
        ],
        flows: [
          ["amber", "M190 46V82"],
        ],
      },
      {
        cue: 'part-6-1', label: "1st: methyl|(alcohol)", at: [312,242], tip: [244,162], align: 'end',
        strokes: [
          ["blue", "M196 96H294V142H196Z"],
          ["ink", "M224 118H264"],
          ["paper", "M204 106h20v24h-20ZM262 106h24v24h-24Z"],
          ["lead", "M264 226L248 144"],
        ],
        flows: [
          ["blue", "M244 146V192"],
        ],
      },
      {
        cue: 'part-6-2', label: "2nd: propanoate|(3-C acid)", at: [8,242], tip: [104,162], align: 'start',
        strokes: [
          ["red", "M20 44H182V142H20Z"],
          ["ink", "M48 118H90M108 118H150M156 104V76M162 104V76"],
          ["paper", "M28 106h20v24h-20ZM88 106h20v24h-20ZM149 106h20v24h-20ZM149 52h20v24h-20Z"],
          ["lead", "M72 226L100 144"],
        ],
        flows: [
          ["red", "M102 146V192"],
        ],
      },
    ],
  },
  {
    scenes: [7, 17, 18],
    outline: [
      ["ink", "M18 134H302"],
    ],
    parts: [
      {
        cue: 'part-7-0', label: "C₄H₁₀ isomers:|straight vs branched", at: [160,24], tip: [160,84], align: 'middle',
        strokes: [
          ["paper", "M32 76a8 8 0 1 0 16 0a8 8 0 1 0 -16 0M64 76a8 8 0 1 0 16 0a8 8 0 1 0 -16 0M96 76a8 8 0 1 0 16 0a8 8 0 1 0 -16 0M128 76a8 8 0 1 0 16 0a8 8 0 1 0 -16 0"],
          ["ink", "M48 76H64M80 76H96M112 76H128"],
          ["amber", "M196 76a8 8 0 1 0 16 0a8 8 0 1 0 -16 0M228 76a8 8 0 1 0 16 0a8 8 0 1 0 -16 0M260 76a8 8 0 1 0 16 0a8 8 0 1 0 -16 0M228 106a8 8 0 1 0 16 0a8 8 0 1 0 -16 0"],
          ["ink", "M212 76H228M244 76H260M236 84V106"],
        ],
        flows: [
          ["amber", "M154 76H188"],
        ],
      },
      {
        cue: 'part-7-1', label: "Rigid C=C:|cis vs trans", at: [160,250], tip: [160,188], align: 'middle',
        strokes: [
          ["ink", "M72 186H104M72 192H104M66 184L46 168M110 184L130 168M66 194L46 210M110 194L130 210"],
          ["green", "M36 164a7 7 0 1 0 14 0a7 7 0 1 0 -14 0M126 164a7 7 0 1 0 14 0a7 7 0 1 0 -14 0"],
          ["ink", "M210 186H242M210 192H242M204 184L184 168M248 184L268 168M204 194L184 210M248 194L268 210"],
          ["green", "M174 164a7 7 0 1 0 14 0a7 7 0 1 0 -14 0M264 210a7 7 0 1 0 14 0a7 7 0 1 0 -14 0"],
        ],
        flows: [
          ["red", "M146 189H172"],
        ],
      },
    ],
  },
])
