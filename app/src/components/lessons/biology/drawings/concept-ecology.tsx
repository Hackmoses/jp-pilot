// OpenStax Biology 2e, Figs. 44.2, 46.4–46.5, 46.14–46.15 and 46.17.
// The feeding sequence uses the grass, grasshopper and bird named in this lesson.
import { processDrawing } from '../AnatomyBoard'

export default processDrawing("Food chains and nutrient cycles", [
  {
    outline: [
      ["paper","M18 190Q73 182 111 188Q155 197 191 189Q244 179 302 186L303 229Q259 239 214 228Q155 220 112 232Q63 238 18 227Z"],
      ["ink","M34 208l13-2m24 17l12-8m35-10l12 7m34-7l8 8m33-10l14 3m31 8l10-5m22 7l9-4"],
      ["green","M26 151Q31 130 22 101Q40 113 42 137Q43 111 37 88Q52 100 53 137Q58 112 69 103Q64 121 61 144Q74 128 82 125Q74 141 69 151Z"],
      ["ink","M28 154Q53 150 76 154"],
      ["green","M116 140Q132 125 158 121L170 124Q166 115 175 109Q183 105 190 111Q198 118 191 126L177 131Q159 147 119 145Z"],
      ["ink","M120 141Q144 130 170 126M159 138Q140 122 137 132L151 153L134 158M176 132L167 151L177 156M183 129L187 146L197 147M184 111l18-24m-11 29l15-17"],
      ["ink","M184 115a2 2 0 1 0 4 0a2 2 0 1 0 -4 0Z"],
    ],
    parts: [
      {
        cue: 'part-1-0', label: "Living community", at: [155,52], tip: [156,132],
        strokes: [
          ["lead","M151 59L157 110M114 59L57 101"],
        ],
      },
      {
        cue: 'part-2-0', label: "Soil and water", at: [260,258], tip: [234,210],
        strokes: [
          ["blue","M191 188Q208 183 240 181Q272 183 277 187Q261 196 238 196Q208 195 191 188Z"],
          ["lead","M254 244L238 199"],
          ["ink","M32 188Q40 167 47 153m-8 21l-8 8m10-12l12 15m-8-23l10 13"],
        ],
      },
    ],
  },
  {
    scenes: [3,5,26],
    outline: [
    ],
    parts: [
      {
        cue: 'part-3-0', label: "Producer", at: [52,204], tip: [49,140],
        strokes: [
          ["green","M26 151Q31 130 22 101Q40 113 42 137Q43 111 37 88Q52 100 53 137Q58 112 69 103Q64 121 61 144Q74 128 82 125Q74 141 69 151Z"],
          ["ink","M28 154Q53 150 76 154"],
          ["lead","M51 190V158"],
        ],
      },
      {
        cue: 'part-4-0', label: "Primary|consumer", at: [157,204], tip: [155,133],
        strokes: [
          ["green","M116 140Q132 125 158 121L170 124Q166 115 175 109Q183 105 190 111Q198 118 191 126L177 131Q159 147 119 145Z"],
          ["ink","M120 141Q144 130 170 126M159 138Q140 122 137 132L151 153L134 158M176 132L167 151L177 156M183 129L187 146L197 147M184 111l18-24m-11 29l15-17"],
          ["ink","M184 115a2 2 0 1 0 4 0a2 2 0 1 0 -4 0Z"],
          ["lead","M158 190V162"],
        ],
        flows: [
          ["green","M81 137Q95 134 111 135"],
        ],
      },
      {
        cue: 'part-5-0', label: "Secondary|consumer", at: [264,204], tip: [250,112],
        strokes: [
          ["paper","M222 152L239 132Q230 114 243 98Q252 88 263 90Q261 76 272 69Q283 63 293 74L307 79L295 85Q290 99 284 102Q280 122 264 129L251 136L237 155Z"],
          ["shade","M242 119Q242 105 256 101Q267 99 271 105Q261 123 242 124Z"],
          ["ink","M257 131l5 16 9 3m-4-21l6 12 8 2m-37-25l19-11M285 75l2 1"],
          ["lead","M264 190L259 153"],
        ],
        flows: [
          ["green","M194 137Q211 127 231 126"],
        ],
      },
      {
        cue: 'part-6-0', label: "Energy leaves as heat", at: [157,24], tip: [154,66],
        flows: [
          ["amber","M53 86Q58 65 80 53"],
          ["amber","M145 112Q140 80 153 41"],
          ["amber","M246 88Q228 61 206 49"],
        ],
      },
    ],
  },
  {
    scenes: [7,27],
    outline: [
      ["ink","M162 185Q160 159 167 125Q166 111 174 102M166 148L143 127M164 154L193 132M163 176L155 198L142 209M163 180L177 204L195 205"],
      ["green","M142 137Q118 137 120 114Q104 95 123 81Q121 63 142 59Q156 42 177 56Q195 53 201 69Q222 74 214 92Q226 111 209 121Q207 142 186 144Q174 151 159 141Z"],
      ["ink","M145 137L157 123L162 183M182 141L171 156M147 88l12 3m15-20l4 11m17 14l-8 7"],
      ["lead","M71 197Q149 184 257 191"],
    ],
    parts: [
      {
        cue: 'part-7-0', label: "CO₂ in air", at: [161,32], tip: [161,49],
        strokes: [
          ["lead","M161 37V48"],
        ],
      },
      {
        cue: 'part-8-0', label: "Photosynthesis", at: [9,58], tip: [131,111],
        strokes: [
          ["lead","M90 64L104 75"],
        ],
        flows: [
          ["green","M130 49Q89 64 100 96Q105 111 124 114"],
        ],
      },
      {
        cue: 'part-10-0', label: "Respiration", at: [309,89], tip: [209,104],
        flows: [
          ["amber","M211 107Q245 94 218 70Q205 56 190 48"],
        ],
      },
      {
        cue: 'part-9-0', label: "Carbon in plant", at: [159,248], tip: [164,149],
        strokes: [
          ["lead","M160 235L164 176"],
        ],
      },
    ],
  },
  {
    scenes: [11,28],
    outline: [
      ["paper","M22 126Q96 115 149 126Q214 117 298 126V239Q228 246 157 239Q90 246 22 239Z"],
      ["green","M146 125L147 101Q132 102 122 86Q139 82 150 98Q157 83 177 82Q173 100 153 103L152 125Z"],
      ["ink","M149 125L139 152M149 129L157 148M143 145L131 150"],
      ["amber","M135 149a3 3 0 1 0 6 0a3 3 0 1 0-6 0Z M155 146a3 3 0 1 0 6 0a3 3 0 1 0-6 0Z"],
    ],
    parts: [
      {
        cue: 'part-11-0', label: "Atmospheric N₂", at: [160,30], tip: [159,44],
        strokes: [
          ["lead","M160 35V43"],
        ],
      },
      {
        cue: 'part-13-0', label: "Nitrogen|fixation", at: [10,65], tip: [139,149],
        strokes: [
        ],
        flows: [
          ["blue","M119 47Q65 56 68 94Q71 125 134 145"],
        ],
      },
      {
        cue: 'part-12-0', label: "Plant uptake", at: [221,108], tip: [154,130],
        strokes: [
        ],
        flows: [
          ["green","M252 192Q218 164 157 128"],
        ],
      },
      {
        cue: 'part-21-0', label: "Organic waste", at: [9,115], tip: [96,159],
        strokes: [
          ["lead","M64 121L109 150"],
        ],
        flows: [
          ["green","M128 129Q105 139 98 155"],
        ],
      },
      {
        cue: 'part-22-0', label: "Ammonification", at: [9,171], tip: [89,181],
        align: 'start',
        strokes: [
          ["lead","M108 168H111"],
        ],
        flows: [
          ["amber","M112 159Q113 177 90 188"],
        ],
      },
      {
        cue: 'part-14-0', label: "Ammonium", at: [69,215], tip: [75,196],
        strokes: [
          ["lead","M69 202V189"],
        ],
      },
      {
        cue: 'part-23-0', label: "Nitrite", at: [160,215], tip: [160,195],
        strokes: [
          ["lead","M160 203V192"],
        ],
        flows: [
          ["amber","M87 197H148"],
        ],
      },
      {
        cue: 'part-19-0', label: "Nitrate", at: [250,215], tip: [250,196],
        strokes: [
          ["lead","M250 203V191"],
        ],
        flows: [
          ["amber","M172 197H237"],
        ],
      },
      {
        cue: 'part-20-0', label: "Nitrification", at: [159,263], tip: [159,197],
        strokes: [
          ["lead","M158 249V221"],
        ],
      },
      {
        cue: 'part-24-0', label: "Denitrification", at: [307,65], tip: [263,102],
        strokes: [
          ["lead","M263 71L249 84"],
        ],
        flows: [
          ["blue","M263 196Q292 143 263 102Q241 61 192 47"],
        ],
      },
    ],
  },
  {
    scenes: [15],
    outline: [
      ["paper","M17 187Q54 145 91 167Q118 155 158 186Q213 213 300 203V231H17Z"],
      ["blue","M165 195Q230 205 299 194V218Q225 226 180 218Z"],
      ["paper","M90 79Q72 76 79 65Q84 54 101 58Q103 38 127 42Q150 37 155 55Q178 49 185 66Q188 76 170 80Z"],
      ["green","M58 160V136Q43 135 39 121Q54 119 61 133Q67 115 80 117Q76 136 63 139V161Z"],
    ],
    parts: [
      {
        cue: 'part-16-0', label: "Evaporation", at: [307,111], tip: [237,111],
        strokes: [
          ["lead","M246 115L228 125"],
        ],
        flows: [
          ["blue","M258 192Q249 133 180 76"],
        ],
      },
      {
        cue: 'part-17-0', label: "Condensation", at: [129,25], tip: [130,57],
        strokes: [
          ["lead","M130 29V42"],
        ],
      },
      {
        cue: 'part-18-0', label: "Precipitation", at: [171,130], tip: [104,121],
        strokes: [
          ["lead","M130 127L109 118"],
        ],
        flows: [
          ["blue","M110 83Q107 114 94 145"],
        ],
      },
      {
        cue: 'part-15-0', label: "Transpiration", at: [10,48], tip: [55,117],
        flows: [
          ["green","M57 119Q45 88 77 68"],
        ],
      },
    ],
  },
])
