import { processDrawing } from '../AnatomyBoard'

export default processDrawing("Living and moving in water", [
  {
    outline: [
      ["paper", "M19 67Q57 60 94 66T170 68T243 68T302 67V218Q257 201 224 218Q183 235 133 222Q82 211 18 226Z"],
      ["blue", "M20 67Q54 61 94 67T173 67T246 67T300 67"],
      ["amber", "M18 226Q82 211 132 222Q184 235 226 217Q256 203 302 218V261H18Z"],
    ],
    parts: [
      {
        cue: 'part-0-0', label: "Submerged shoot", at: [22,42], tip: [92,136], align: 'start',
        strokes: [
          ["green", "M92 224Q89 186 88 162Q81 141 56 125Q52 109 62 107Q81 109 93 145Q102 124 101 91Q104 71 117 82Q124 98 109 133L94 166L104 184Q108 159 133 153Q146 157 137 172L106 199L101 222Z"],
          ["ink", "M92 223l-13 13m20-13l13 14m-14-7l4 14"],
        ],
        flows: [
          ["blue", "M46 141L83 150"],
          ["blue", "M138 114L110 121"],
        ],
      },
      {
        cue: 'part-1-0', label: "Streamlined fish", at: [305,101], tip: [201,143], align: 'end',
        strokes: [
          ["paper", "M144 154Q175 120 211 133Q239 136 256 151L285 130L277 154L288 178L257 164Q232 177 198 175Q172 176 144 154Z"],
          ["ink", "M157 153h2m20-14Q185 151 178 168m24 3l14 16l1-15m7-36l-14-16l-16 11"],
        ],
        flows: [
          ["blue", "M151 125Q195 109 235 130L284 120"],
          ["blue", "M155 180Q187 200 233 185L285 190"],
        ],
      },
    ],
  },
  {
    scenes: [2],
    outline: [
      ["amber", "M17 196Q69 171 117 193Q166 215 205 189Q251 163 302 191V255H17Z"],
      ["red", "M28 156Q95 82 164 111Q211 140 288 107Q305 113 294 132Q235 175 171 146Q102 112 44 181Z"],
      ["ink", "M49 143l13 22m2-38l14 23m1-35l13 24m7-29l9 24m8-26l6 23m11-20l3 22m15-16l-2 22m20-16l-7 21m17-16l-7 22"],
    ],
    parts: [
      {
        cue: 'part-2-0', label: "Moist skin", at: [25,74], tip: [101,111], align: 'start',
        strokes: [
          ["lead", "M95 76L102 106"],
        ],
      },
      {
        cue: 'part-2-1', label: "Skin capillary", at: [304,70], tip: [245,101], align: 'end',
        strokes: [
          ["zoom", "M203 133L228 96M218 136L268 122"],
          ["red", "M218 111Q229 93 256 95L284 84Q293 90 283 99Q250 107 236 120Z"],
        ],
        flows: [
          ["blue", "M247 72L250 102"],
          ["amber", "M269 104L273 71"],
        ],
      },
    ],
  },
])
