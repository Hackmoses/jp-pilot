import { processDrawing } from '../AnatomyBoard'

export default processDrawing("Pollination and fertilisation in flowers", [
  {
    outline: [
      ["green", "M146 182Q129 202 140 238L157 258H171L182 237Q191 209 172 186Z"],
      ["paper", "M151 173Q145 130 150 84V59H167V85Q168 129 164 172Q191 184 191 207Q187 241 159 242Q129 241 127 211Q129 181 151 173Z"],
      ["red", "M145 186Q120 175 94 152Q64 135 52 112Q44 83 67 78Q88 78 108 111Q123 125 139 135M171 183Q197 175 219 152Q251 136 269 105Q277 80 253 78Q232 77 212 109Q191 133 177 137"],
      ["amber", "M126 196Q104 163 106 102M187 197Q214 165 214 107M94 95Q103 85 115 93L116 106Q101 111 94 102ZM204 94Q215 85 227 95V105Q216 112 204 104Z"],
      ["green", "M143 201Q154 183 174 198Q189 211 178 223Q165 237 149 226Q137 216 143 201Z"],
    ],
    parts: [
      {
        cue: 'part-0-0', label: "Anther", at: [13,65], tip: [102,97], align: 'start',
        strokes: [
          ["lead", "M58 66L95 95"],
        ],
      },
      {
        cue: 'part-0-1', label: "Stigma", at: [299,42], tip: [158,56], align: 'end',
        strokes: [
          ["green", "M137 55Q150 43 159 50Q169 40 182 53Q184 65 164 66Q143 68 136 63Z"],
          ["lead", "M247 42L176 52"],
        ],
        flows: [
          ["blue", "M104 93Q124 60 151 54"],
        ],
      },
      {
        cue: 'part-1-0', label: "Wind", at: [22,25], tip: [117,48], align: 'start',
        flows: [
          ["blue", "M23 42Q79 20 130 33Q146 37 156 50"],
        ],
      },
      {
        cue: 'part-1-1', label: "Pollen tube", at: [301,139], tip: [158,140], align: 'end',
        strokes: [
          ["lead", "M230 137L167 140"],
        ],
        flows: [
          ["blue", "M158 55Q159 89 157 121L157 174Q157 194 150 209"],
        ],
      },
      {
        cue: 'part-2-0', label: "Ovule", at: [13,221], tip: [149,214], align: 'start',
        strokes: [
          ["lead", "M56 216L136 213"],
        ],
      },
      {
        cue: 'part-2-1', label: "Egg", at: [304,189], tip: [254,217], align: 'end',
        strokes: [
          ["zoom", "M182 203L233 181M181 226L239 257"],
          ["green", "M232 213Q232 181 260 183Q290 183 301 213Q308 243 285 254Q253 265 232 234Z"],
          ["red", "M255 219a6 6 0 1 0 12 0a6 6 0 1 0-12 0Z"],
          ["amber", "M266 233a3 3 0 1 0 6 0a3 3 0 1 0-6 0ZM272 232a3 3 0 1 0 6 0a3 3 0 1 0-6 0Z"],
        ],
        flows: [
          ["blue", "M225 225L245 222L256 220"],
          ["blue", "M225 225Q251 230 268 233"],
        ],
      },
      {
        cue: 'part-2-n', label: "Polar nuclei", at: [307,268], tip: [276,233], align: 'end',
        strokes: [
          ["lead", "M270 256L272 239"],
        ],
      },
    ],
  },
])
