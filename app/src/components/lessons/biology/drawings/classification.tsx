import { processDrawing } from '../AnatomyBoard'

export default processDrawing("How biologists classify animals", [
  {
    outline: [
      ["ink", "M150 44V65M57 65H268M57 65V77M149 65V138M268 65V114M149 138H106V165"],
      ["paper", "M111 17H194V45H111Z"],
    ],
    parts: [
      {
        cue: 'part-0-a', label: "Animals", at: [151, 36], tip: [151, 41],
      },
      {
        cue: 'part-0-0', label: "Genus", at: [48,158], tip: [105,141],
        strokes: [
          ["lead", "M71 154L104 141"],
          ["amber", "M81 169Q88 159 103 165L124 161Q145 164 150 177L138 186L115 176Q105 192 80 188Z"],
        ],
        flows: [
          ["blue", "M149 100V137H108V162"],
        ],
      },
      {
        cue: 'part-0-1', label: "Species", at: [106,241], tip: [111,191],
        strokes: [
          ["ink", "M106 186V204M82 204H127M82 204V216M127 204V216"],
          ["paper", "M66 216q14-12 28 1l-3 8H67ZM116 216q14-12 27 1l-3 8h-24Z"],
        ],
        flows: [
          ["blue", "M106 188V205H127V216"],
        ],
      },
      {
        cue: 'part-1-0', label: "Radial symmetry", at: [14,143], tip: [55,88], align: 'start',
        strokes: [
          ["red", "M56 64L67 86L90 85L75 103L82 126L57 114L37 127L41 104L22 89L46 88Z"],
          ["ink", "M56 64V115M23 90L78 119M88 87L40 121"],
          ["lead", "M53 130L56 114"],
        ],
      },
      {
        cue: 'part-1-1', label: "Whale|mammary gland", at: [306,112], tip: [198,174], align: 'end',
        strokes: [
          ["paper", "M164 180Q187 161 225 168L246 154L243 172L252 183L223 179Q187 194 164 180Z"],
          ["red", "M196 185q10 3 20-4"],
          ["lead", "M274 130L215 173"],
        ],
      },
      {
        cue: 'part-2-0', label: "Lizard scales", at: [304,203], tip: [274,166], align: 'end',
        strokes: [
          ["green", "M245 153L263 144L285 149L298 137L285 155L269 168L254 170Z"],
          ["ink", "M257 153l4 5l5-4l5 4l5-6m-9 8l4 3m3-11l4 3"],
          ["lead", "M301 191L279 165"],
        ],
      },
      {
        cue: 'part-2-1', label: "Bird foot scales", at: [306,258], tip: [252,221], align: 'end',
        strokes: [
          ["amber", "M253 185L260 224L284 234L281 238L259 234L246 245L242 241L252 226L242 190Z"],
          ["ink", "M247 200l9-3m-8 10l10-2m-9 9l10-2m-8 9l9-2"],
        ],
      },
    ],
  },
])
