import { processDrawing } from '../AnatomyBoard'

export default processDrawing("Spores, seeds and plant life cycles", [
  {
    outline: [
      ["amber", "M15 216Q71 199 119 207Q158 214 195 198Q238 180 304 202V256H15Z"],
      ["ink", "M144 212Q166 155 190 113Q215 58 261 31"],
      ["green", "M157 183Q124 166 108 136Q148 137 166 167ZM169 164Q204 169 239 143Q214 138 181 146ZM183 139Q144 122 139 100Q171 100 195 120ZM195 117Q238 114 261 91Q228 87 204 103ZM212 92Q186 68 189 52Q217 60 224 77ZM230 71Q262 69 282 48Q254 45 241 56Z"],
    ],
    parts: [
      {
        cue: 'part-0-0', label: "Moss gametophyte", at: [17,148], tip: [57,187], align: 'start',
        strokes: [
          ["green", "M31 209L29 196L36 193L39 175L47 185L52 170L59 187L67 176L73 196L90 188L95 205Z"],
          ["ink", "M53 195Q50 175 50 163m18 27q3-19 13-26"],
        ],
      },
      {
        cue: 'part-0-1', label: "Fern sporophyte", at: [307,19], tip: [240,63], align: 'end',
        strokes: [
          ["amber", "M204 155a3 3 0 1 0 6 0a3 3 0 1 0-6 0ZM218 150a3 3 0 1 0 6 0a3 3 0 1 0-6 0ZM231 145a3 3 0 1 0 6 0a3 3 0 1 0-6 0Z"],
        ],
      },
      {
        cue: 'part-1-0', label: "Prothallus", at: [20,253], tip: [133,223], align: 'start',
        strokes: [
          ["green", "M139 239Q97 224 102 207Q108 193 129 202Q144 178 165 193Q179 206 154 226Z"],
          ["ink", "M139 238l-13 9m13-10l2 14m0-14l14 6"],
        ],
        flows: [
          ["blue", "M215 151Q203 182 163 199"],
        ],
      },
      {
        cue: 'part-1-1', label: "Sperm in water", at: [306,230], tip: [142,214], align: 'end',
        strokes: [
          ["blue", "M114 208Q137 196 156 207Q151 218 137 220Q125 223 114 208Z"],
        ],
        flows: [
          ["blue", "M120 210Q132 202 143 211"],
        ],
      },
    ],
  },
  {
    scenes: [2],
    outline: [
      ["green", "M161 248Q158 164 165 61L172 56Q169 143 178 245ZM165 118Q131 87 96 100Q109 129 163 137ZM169 145Q201 112 241 115Q228 144 173 163Z"],
      ["ink", "M24 239Q82 224 132 234Q177 242 225 230Q268 222 301 233"],
    ],
    parts: [
      {
        cue: 'part-2-0', label: "Maize endosperm", at: [20,25], tip: [88,96], align: 'start',
        strokes: [
          ["amber", "M81 129Q59 111 63 85Q68 54 96 50Q122 57 124 92Q120 127 98 139Z"],
          ["green", "M83 130Q75 114 83 103Q98 103 100 124L92 135Z"],
        ],
        flows: [
          ["blue", "M99 78L90 119"],
        ],
      },
      {
        cue: 'part-2-1', label: "Bean pod", at: [302,66], tip: [231,175], align: 'end',
        strokes: [
          ["green", "M184 184Q204 148 257 153L282 166Q276 183 255 194Q221 205 197 201Z"],
          ["amber", "M207 183a7 8 0 1 0 14 0a7 8 0 1 0-14 0ZM231 175a7 8 0 1 0 14 0a7 8 0 1 0-14 0ZM254 169a7 8 0 1 0 14 0a7 8 0 1 0-14 0Z"],
          ["lead", "M260 70L250 151"],
        ],
      },
    ],
  },
])
