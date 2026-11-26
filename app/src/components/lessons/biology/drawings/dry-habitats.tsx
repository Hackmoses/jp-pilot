import { processDrawing } from '../AnatomyBoard'

export default processDrawing("Surviving dry conditions", [
  {
    outline: [
      ["amber", "M18 148Q86 133 125 150Q172 171 221 140Q258 125 301 139V253H18Z"],
      ["ink", "M18 158Q77 146 126 166Q188 185 231 155Q270 143 301 157M18 208Q81 187 128 210Q179 232 236 209Q264 197 301 202"],
    ],
    parts: [
      {
        cue: 'part-0-0', label: "Sahel savanna", at: [18,104], tip: [57,145], align: 'start',
        strokes: [
          ["green", "M40 145L54 103L64 143M25 110Q29 101 42 100Q58 88 74 99Q88 98 94 108Q71 119 25 110Z"],
          ["ink", "M73 148l5-15m5 16l6-8m-33 7l5-10"],
        ],
      },
      {
        cue: 'part-0-1', label: "Xerophyte", at: [301,41], tip: [241,100], align: 'end',
        strokes: [
          ["green", "M229 146L229 69Q231 47 242 57Q250 62 249 81L250 116Q263 104 262 82L271 82Q283 109 250 132L250 144Z"],
          ["ink", "M230 79l-13-7m12 19l-12 4m34-20l10-6m3 31l10-3"],
        ],
        flows: [
          ["blue", "M237 58L224 40"],
        ],
      },
      {
        cue: 'part-1-0', label: "Aestivating lungfish", at: [17,243], tip: [170,196], align: 'start',
        strokes: [
          ["paper", "M142 166Q183 156 220 170Q241 189 221 209Q200 223 159 215Q137 208 135 186Z"],
          ["green", "M157 193Q155 176 179 179Q205 179 206 195Q193 211 178 202Q166 195 175 188L183 192Q196 198 197 193Q189 186 178 186Q168 186 169 197L163 204Z"],
          ["lead", "M143 226L162 206"],
        ],
        flows: [
          ["blue", "M190 159Q199 170 185 181"],
        ],
      },
      {
        cue: 'part-1-1', label: "Daylight activity", at: [17,41], tip: [113,68], align: 'start',
        strokes: [
          ["amber", "M104 62a15 15 0 1 0 30 0a15 15 0 1 0-30 0Z"],
          ["ink", "M119 41V35m0 48v7M99 62h-7m47 0h8M105 47l-5-5m34 5l5-5"],
        ],
      },
      {
        cue: 'part-2-0', label: "Hygrometer", at: [302,247], tip: [277,182], align: 'end',
        strokes: [
          ["paper", "M269 169H288V194H269Z"],
          ["ink", "M273 181q6-12 11 0m-6 0l4-5m-12 19h16"],
          ["lead", "M270 231L278 194"],
        ],
      },
    ],
  },
])
