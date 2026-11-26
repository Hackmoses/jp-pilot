import { processDrawing } from '../AnatomyBoard'

export default processDrawing("Energy flow and feeding relationships", [
  {
    outline: [
      ["paper", "M19 172Q80 155 127 188Q166 189 188 180Q239 172 300 194L303 239Q269 259 217 245Q151 252 104 241Q51 243 18 222Z"],
      ["green", "M46 216Q50 188 23 162Q52 159 60 183Q73 162 93 166Q74 188 67 214ZM73 219Q89 203 107 200Q100 217 85 225Z"],
      ["amber", "M211 234Q217 182 216 137Q216 105 229 76L241 79Q224 115 232 156Q238 186 250 235ZM226 126L174 140L164 133L214 111ZM231 114L269 86L275 94L235 132Z"],
      ["green", "M178 125Q166 113 169 98Q184 91 193 101Q204 109 204 124ZM238 83Q231 61 247 46Q264 46 270 66Q285 49 300 63L306 85Q273 115 238 83Z"],
    ],
    parts: [
      {
        cue: 'part-0-0', label: "Producer", at: [18,252], tip: [57,207], align: 'start',
        flows: [
          ["amber", "M36 120L49 180"],
        ],
      },
      {
        cue: 'part-0-1', label: "Grasshopper", at: [133,206], tip: [126,187],
        strokes: [
          ["green", "M98 179Q104 167 116 171L144 156Q158 153 160 162L145 175L120 185Q106 189 98 179Z"],
          ["ink", "M123 178L115 197L151 192M147 168l15-21M154 160l16-6M113 181l-17 13"],
        ],
        flows: [
          ["blue", "M65 211Q84 187 104 178"],
        ],
      },
      {
        cue: 'part-0-2', label: "Insect-eating bird", at: [68,44], tip: [194,106], align: 'start',
        strokes: [
          ["paper", "M149 135Q157 119 171 118Q168 97 184 92Q207 85 211 103L225 107L209 116Q192 132 181 138L170 150L163 142Z"],
          ["ink", "M172 120Q180 124 197 111M201 101h1m-19 37l1 6"],
        ],
        flows: [
          ["blue", "M147 160Q151 131 182 115"],
        ],
      },
      {
        cue: 'part-1-0', label: "Mistletoe", at: [303,139], tip: [253,106], align: 'end',
        strokes: [
          ["green", "M250 110Q240 95 242 89Q255 92 260 102Q264 87 278 88Q280 100 263 109Z"],
        ],
        flows: [
          ["blue", "M228 166Q226 140 256 106"],
        ],
      },
    ],
  },
  {
    scenes: [2],
    outline: [
      ["paper", "M29 142Q73 101 118 114Q167 99 218 122L280 81L266 126L284 164L218 143Q165 166 99 158L41 153Z"],
      ["ink", "M47 136h8m43-19q-12 18-4 36m10-38q-11 21-3 36m9-35q-10 17-5 32m35-34l12-25l-1 23m22 26l-18 32l40-39"],
    ],
    parts: [
      {
        cue: 'part-2-0', label: "Remora on a shark", at: [300,64], tip: [158,163], align: 'end',
        strokes: [
          ["green", "M115 167Q144 152 179 158L198 151L191 164L203 173L176 170Q151 182 119 176Z"],
          ["ink", "M124 166q10-7 29-9"],
        ],
        flows: [
          ["blue", "M184 184Q149 190 112 181"],
        ],
      },
    ],
  },
])
