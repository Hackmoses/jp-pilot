import { processDrawing } from '../AnatomyBoard'

export default processDrawing("Body temperature and field instruments", [
  {
    outline: [
      ["blue", "M16 174H136V230H16Z"],
      ["paper", "M136 168H304V230H136Z"],
      ["ink", "M154 54V174"],
    ],
    parts: [
      {
        cue: 'part-2-0', label: "Wind vane|(direction)", at: [304,34], tip: [156,64], align: 'end',
        strokes: [
          ["amber", "M126 64H182L172 56M182 64L172 72M126 58V70"],
        ],
        flows: [
          ["blue", "M98 64H124"],
        ],
      },
      {
        cue: 'part-2-1', label: "Anemometer|(wind speed)", at: [304,98], tip: [154,112], align: 'end',
        strokes: [
          ["ink", "M132 112H176"],
          ["blue", "M126 106a6 6 0 1 0 12 0a6 6 0 1 0-12 0ZM170 106a6 6 0 1 0 12 0a6 6 0 1 0-12 0Z"],
        ],
        flows: [
          ["blue", "M96 112H122"],
        ],
      },
      {
        cue: 'part-2-2', label: "Secchi disc|(turbidity)", at: [16,42], tip: [74,186], align: 'start',
        strokes: [
          ["ink", "M74 134V198"],
          ["paper", "M54 198a20 8 0 1 0 40 0a20 8 0 1 0-40 0Z"],
          ["shade", "M54 198a20 8 0 0 1 20-8v8ZM94 198a20 8 0 0 1-20 8v-8Z"],
        ],
        flows: [
          ["blue", "M84 150V188"],
        ],
      },
      {
        cue: 'part-2-3', label: "Quadrat|(plant count)", at: [304,252], tip: [236,196], align: 'end',
        strokes: [
          ["ink", "M186 184L276 174L290 214L198 224ZM232 179L244 219M192 204L283 194"],
          ["green", "M212 198l-4-12l8 4l6-12l4 18ZM254 206l-4-12l8 4l6-10l4 16Z"],
        ],
      },
    ],
  },
  {
    scenes: [0],
    outline: [
      ["ink", "M160 44V228"],
      ["paper", "M22 178Q74 148 134 176V214H22Z"],
    ],
    parts: [
      {
        cue: 'part-0-0', label: "Poikilotherm|(lizard)", at: [16,36], tip: [80,152], align: 'start',
        strokes: [
          ["green", "M44 156Q72 134 102 150Q114 156 124 158Q108 166 90 162Q66 164 44 156Z"],
          ["ink", "M58 160l-6 12m32-10l4 12"],
        ],
      },
      {
        cue: 'part-0-1', label: "Basks to|warm up", at: [16,246], tip: [76,108], align: 'start',
        strokes: [
          ["amber", "M68 78a14 14 0 1 0 28 0a14 14 0 1 0-28 0Z"],
        ],
        flows: [
          ["amber", "M82 96V138"],
        ],
      },
      {
        cue: 'part-0-2', label: "Homoiotherm|(steady heat)", at: [304,36], tip: [236,144], align: 'end',
        strokes: [
          ["amber", "M198 156Q216 124 248 136Q268 148 258 172Q230 182 198 156Z"],
          ["red", "M194 202H278"],
        ],
        flows: [
          ["red", "M200 202H272"],
        ],
      },
    ],
  },
  {
    scenes: [1],
    outline: [
      ["ink", "M160 42V226M116 134H204"],
    ],
    parts: [
      {
        cue: 'part-1-0', label: "Thermometer|(temperature)", at: [16,36], tip: [86,96], align: 'start',
        strokes: [
          ["paper", "M80 62H92V116a10 10 0 1 1-12 0Z"],
          ["red", "M82 122a6 6 0 1 0 8 0V82h-8Z"],
        ],
        flows: [
          ["red", "M86 116V74"],
        ],
      },
      {
        cue: 'part-1-1', label: "Barometer|(air pressure)", at: [304,36], tip: [234,96], align: 'end',
        strokes: [
          ["paper", "M212 96a22 22 0 1 0 44 0a22 22 0 1 0-44 0Z"],
          ["ink", "M234 96L248 84"],
        ],
        flows: [
          ["blue", "M234 52V74"],
        ],
      },
      {
        cue: 'part-1-2', label: "Hygrometer|(humidity)", at: [16,248], tip: [86,184], align: 'start',
        strokes: [
          ["paper", "M68 164H104V204H68Z"],
          ["blue", "M74 188q12-16 24 0m-12 0l8-10"],
        ],
      },
      {
        cue: 'part-1-3', label: "Rain gauge|(rainfall)", at: [304,248], tip: [234,186], align: 'end',
        strokes: [
          ["paper", "M216 164H252L244 178V210H224V178Z"],
          ["blue", "M225 190H243V208H225Z"],
        ],
        flows: [
          ["blue", "M234 138V172"],
        ],
      },
    ],
  },
])
