import { processDrawing } from '../AnatomyBoard'

export default processDrawing("Plant growth and hormones", [
  {
    outline: [
      ["amber", "M24 156H296V248H24Z"],
      ["ink", "M24 156H296"],
      ["green", "M154 62L152 156H168L166 62ZM154 114Q124 96 106 108Q122 126 154 126ZM166 100Q196 82 214 94Q198 112 166 112Z"],
      ["paper", "M152 156L144 196L122 216M168 156L176 196L198 214M160 156V218"],
    ],
    parts: [
      {
        cue: 'part-0-0', label: "Shoot apical|meristem", at: [18,40], tip: [160,54], align: 'start',
        strokes: [
          ["green", "M150 64Q160 38 170 64Z"],
        ],
        flows: [
          ["green", "M160 72V40"],
        ],
      },
      {
        cue: 'part-0-1', label: "Root apical|meristem", at: [18,236], tip: [160,224], align: 'start',
        strokes: [
          ["green", "M154 212Q160 240 166 212Z"],
        ],
        flows: [
          ["blue", "M160 202V238"],
        ],
      },
      {
        cue: 'part-0-2', label: "Growth|throughout life", at: [302,130], tip: [214,106], align: 'end',
        strokes: [
          ["zoom", "M160 40Q216 56 226 104"],
        ],
        flows: [
          ["green", "M172 98Q198 78 224 72"],
        ],
      },
    ],
  },
  {
    scenes: [1],
    outline: [
      ["amber", "M20 206H300V236H20Z"],
      ["ink", "M20 206H300"],
    ],
    parts: [
      {
        cue: 'part-1-0', label: "Auxin: bends|toward light", at: [16,32], tip: [76,130], align: 'start',
        strokes: [
          ["amber", "M118 46a10 10 0 1 0 20 0a10 10 0 1 0-20 0Z"],
          ["green", "M54 206Q50 144 82 96L90 102Q66 148 68 206Z"],
          ["ink", "M114 62L92 88"],
        ],
        flows: [
          ["blue", "M84 100Q56 144 60 194"],
        ],
      },
      {
        cue: 'part-1-1', label: "Gibberellin:|stem bolting", at: [160,250], tip: [160,118], align: 'middle',
        strokes: [
          ["green", "M154 206V74H166V206ZM154 166Q136 154 128 164Q140 174 154 174ZM166 128Q184 116 192 126Q180 136 166 136Z"],
          ["red", "M150 68Q160 48 170 68Z"],
        ],
        flows: [
          ["green", "M160 174V78"],
        ],
      },
      {
        cue: 'part-1-2', label: "Cytokinin:|bud growth", at: [304,34], tip: [252,134], align: 'end',
        strokes: [
          ["green", "M242 206V102H254V206Z"],
          ["amber", "M254 148Q278 134 282 146Q268 160 254 156ZM242 128Q218 114 214 126Q228 140 242 136Z"],
        ],
        flows: [
          ["green", "M254 150L280 138"],
        ],
      },
    ],
  },
  {
    scenes: [2],
    outline: [
      ["ink", "M36 146Q154 128 274 148"],
    ],
    parts: [
      {
        cue: 'part-2-0', label: "Abscisic acid:|dormancy & stress", at: [16,38], tip: [88,136], align: 'start',
        strokes: [
          ["amber", "M60 112Q84 82 118 112Q94 142 60 112ZM78 174a14 10 0 1 0 28 0a14 10 0 1 0-28 0Z"],
          ["ink", "M78 112H100M82 108Q89 102 96 108M82 116Q89 122 96 116"],
        ],
      },
      {
        cue: 'part-2-1', label: "Ethylene:|fruit ripening", at: [304,38], tip: [224,140], align: 'end',
        strokes: [
          ["red", "M202 106a18 20 0 1 0 36 0a18 20 0 1 0-36 0Z"],
          ["amber", "M236 178Q264 162 274 190Q246 202 236 178Z"],
        ],
        flows: [
          ["amber", "M256 148L256 174"],
        ],
      },
    ],
  },
])
