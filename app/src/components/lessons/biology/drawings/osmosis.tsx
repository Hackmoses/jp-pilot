import { processDrawing } from '../AnatomyBoard'

export default processDrawing("Osmosis in plants and animals", [
  {
    outline: [
      ["green", "M50 82Q104 64 211 77Q250 85 267 113L267 189Q258 226 207 230Q119 246 58 215Q38 186 42 131Z"],
      ["paper", "M58 91Q105 75 209 85Q249 91 257 117V184Q245 218 204 220Q122 235 65 209Q51 180 51 131Z"],
    ],
    parts: [
      {
        cue: 'part-0-0', until: 'part-1-0', label: "Water potential", at: [16,33], tip: [92,109], align: 'start',
        strokes: [
          ["lead", "M101 37L89 88"],
        ],
        flows: [
          ["blue", "M287 141L259 141Q220 143 195 150"],
        ],
      },
      {
        cue: 'part-0-1', until: 'part-1-0', label: "Diffusion", at: [307,57], tip: [208,95], align: 'end',
        strokes: [
          ["ink", "M218 66h2m7 1h2m7-5h2m-21-7h2m22 1h2m-9 9h2m-15 19h2"],
        ],
        flows: [
          ["blue", "M228 55L226 92L204 112"],
        ],
      },
      {
        cue: 'part-1-0', label: "Plasmolysis", at: [14,260], tip: [91,168], align: 'start',
        flows: [
          ["blue", "M219 148Q249 145 282 127"],
          ["blue", "M100 138L58 137L23 130"],
        ],
        motion: [
          ["blue", "M65 94Q128 79 206 93Q246 100 247 135V181Q237 207 196 214Q121 228 70 201Q54 154 65 94Z", "M100 112Q139 95 188 106Q216 114 222 139V169Q211 192 183 195Q131 200 99 185Q85 154 100 112Z"],
        ],
      },
      {
        cue: 'part-1-1', label: "Red cell|in dilute water", at: [306,253], tip: [278,171], align: 'end',
        strokes: [
          ["zoom", "M238 204L273 189M265 188L294 189"],
          ["red", "M271 170a20 12 0 1 0 40 0a20 12 0 1 0-40 0Z"],
          ["ink", "M278 171q12 6 25-1"],
        ],
        flows: [
          ["blue", "M277 207L287 180"],
        ],
      },
    ],
  },
  {
    scenes: [2],
    outline: [
      ["amber", "M21 63H301V243H21Z"],
      ["green", "M23 118Q77 108 117 124Q158 138 189 127Q208 118 229 132Q247 143 275 138Q293 141 297 151Q295 167 274 170Q247 164 222 174Q202 182 181 170Q157 157 123 163Q81 185 23 173Z"],
      ["ink", "M27 135Q100 124 137 146Q167 154 183 148M28 153Q89 163 122 150M62 119v57m27-58v51m27-43v34m33-28v26"],
    ],
    parts: [
      {
        cue: 'part-2-0', label: "Root hair", at: [306,102], tip: [253,151], align: 'end',
        flows: [
          ["blue", "M279 208L271 154Q220 153 181 151L77 146"],
        ],
      },
    ],
  },
])
