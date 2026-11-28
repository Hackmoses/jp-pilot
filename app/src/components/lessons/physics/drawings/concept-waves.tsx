import { processDrawing } from '../../biology/AnatomyBoard'

// OpenStax College Physics 2e §16.9 Figs. 16.28–16.30 (transverse and longitudinal waves),
// §17.7 Fig. 17.42 (round-trip echo), §17.5 Fig. 17.28 (displacement in a closed pipe).
// §17.1 Fig. 17.5 (compressions and rarefactions), §17.4 Fig. 17.14 (Doppler shift).
export default processDrawing("Travelling waves, echoes and standing waves", [
  {
    scenes: [1, 3, 16],
    outline: [
      ["lead", "M22 114h279"],
    ],
    parts: [
      {
        cue: 'part-1-0', label: "Rope", at: [32, 165], tip: [44, 128],
        strokes: [
          ["ink", "M25 135Q42 135 59 114T93 93T127 114T161 135T195 114T229 93T263 114T297 135"],
          ["lead", "M36 147l7-15"],
        ],
      },
      {
        cue: 'part-1-1', label: "Wave travels", at: [162, 214], tip: [235, 179],
        flows: [
          ["blue", "M76 181h160"],
        ],
      },
      {
        cue: 'part-2-0', label: "Across the path", at: [66, 49], tip: [161, 111],
        strokes: [
          ["paper", "M157 135a4 4 0 1 0 8 0a4 4 0 1 0 -8 0Z"],
          ["lead", "M76 55l77 35"],
        ],
        flows: [
          ["red", "M161 135V94"],
        ],
      },
      {
        cue: 'part-3-0', label: "Wavelength λ", at: [162, 24], tip: [162, 67],
        strokes: [
          ["lead", "M93 87V67h136v20m-136-20 7 3m129-3-7 3m-61-37v26"],
        ],
      },
      {
        cue: 'part-3-1', label: "Crest", at: [258, 51], tip: [229, 93],
        strokes: [
          ["lead", "M252 57l-20 31"],
        ],
      },
    ],
  },
  {
    scenes: [4, 8, 14],
    outline: [
      ["paper", "M51 99h20l19 14v49l-19 14H51Z"],
      ["ink", "M253 73v131m0-119 17-13m-17 32 17-13m-17 32 17-13m-17 32 17-13m-17 32 17-13m-17 32 17-13"],
    ],
    parts: [
      {
        cue: 'part-4-0', label: "Outward pulse", at: [157, 62], tip: [203, 121],
        strokes: [
          ["lead", "M163 70l36 44"],
        ],
        flows: [
          ["blue", "M93 121h155"],
        ],
      },
      {
        cue: 'part-4-1', label: "Return echo", at: [162, 211], tip: [103, 157],
        strokes: [
          ["lead", "M151 194l-44-31"],
        ],
        flows: [
          ["green", "M248 156H93"],
        ],
      },
    ],
  },
  {
    scenes: [5, 11],
    outline: [
      ["ink", "M50 83h218M50 83v114h218"],
      ["lead", "M53 140h214"],
    ],
    parts: [
      {
        cue: 'part-5-0', label: "Closed end", at: [67, 55], tip: [52, 138],
        strokes: [
          ["lead", "M57 60l-5 17"],
          ["shade", "M48 140a3 3 0 1 0 6 0a3 3 0 1 0 -6 0Z"],
        ],
      },
      {
        cue: 'part-5-1', label: "Open end", at: [249, 55], tip: [267, 140],
        strokes: [
          ["lead", "M256 61l10 17"],
        ],
      },
      {
        cue: 'part-5-2', label: "Quarter wavelength", at: [154, 245], tip: [159, 219],
        strokes: [
          ["lead", "M50 207v11h218v-11m-109 12v7"],
          ["ink", "M51 140C122 121 187 105 268 103M51 140C122 159 187 175 268 177"],
        ],
      },
      {
        cue: 'part-11-0', label: "Antinode", at: [270, 235], tip: [268, 139],
        strokes: [
          ["lead", "M273 218l13-35-13-32"],
        ],
        flows: [
          ["blue", "M230 140h34"],
        ],
      },
    ],
  },
  {
    scenes: [15],
    outline: [
      ["lead", "M34 144h264"],
    ],
    parts: [
      {
        cue: 'part-15-0', label: "Compression", at: [65, 68], tip: [54, 126],
        strokes: [
          ["ink", "M43 126v39 M49 126v39 M55 126v39 M61 126v39 M72 126v39 M87 126v39 M110 126v39 M137 126v39 M160 126v39 M175 126v39 M186 126v39 M192 126v39 M198 126v39 M204 126v39 M215 126v39 M230 126v39 M253 126v39 M280 126v39"],
          ["lead", "M63 74l-7 47"],
        ],
      },
      {
        cue: 'part-15-1', label: "Rarefaction", at: [130, 209], tip: [125, 147],
        strokes: [
          ["lead", "M130 190l-4-35"],
        ],
      },
      {
        cue: 'part-15-2', label: "Next compression", at: [228, 69], tip: [197, 127],
        strokes: [
          ["lead", "M221 75l-22 46"],
        ],
      },
      {
        cue: 'part-15-3', label: "Wavelength λ", at: [123, 246], tip: [126, 103],
        strokes: [
          ["lead", "M53 120v-18h144v18"],
        ],
        flows: [
          ["blue", "M54 102h141"],
        ],
      },
    ],
  },
  {
    scenes: [7],
    outline: [
      ["lead", "M28 143h266"],
    ],
    parts: [
      {
        cue: 'part-7-0', label: "Moving source", at: [86, 258], tip: [176, 144],
        strokes: [
          ["shade", "M171 143a5 5 0 1 0 10 0a5 5 0 1 0 -10 0Z"],
          ["lead", "M104 240l60-79"],
        ],
        flows: [
          ["red", "M129 180h67"],
        ],
      },
      {
        cue: 'part-7-1', label: "Successive crests", at: [104, 32], tip: [114, 61],
        strokes: [
          ["ink", "M12 143a94 94 0 1 0 188 0a94 94 0 1 0 -188 0Z M51 143a77 77 0 1 0 154 0a77 77 0 1 0 -154 0Z M95 143a57 57 0 1 0 114 0a57 57 0 1 0 -114 0Z M139 143a37 37 0 1 0 74 0a37 37 0 1 0 -74 0Z"],
          ["lead", "M104 38l2 9"],
        ],
      },
      {
        cue: 'part-7-2', label: "Closer ahead", at: [262, 225], tip: [205, 143],
        strokes: [
          ["lead", "M260 207l-44-55"],
        ],
        flows: [
          ["blue", "M216 143h74"],
        ],
      },
    ],
  },
  {
    scenes: [2],
    outline: [
      ["lead", "M22 114h279"],
    ],
    parts: [
      {
        cue: 'part-1-0', label: "Rope", at: [32, 165], tip: [44, 128],
        strokes: [
          ["ink", "M25 135Q42 135 59 114T93 93T127 114T161 135T195 114T229 93T263 114T297 135"],
          ["lead", "M36 147l7-15"],
        ],
      },
      {
        cue: 'part-1-1', label: "Wave travels", at: [151, 168], tip: [230, 178],
        flows: [
          ["blue", "M68 178h165"],
        ],
      },
      {
        cue: 'part-2-0', label: "Rope moves across", at: [110, 51], tip: [161, 111],
        strokes: [
          ["paper", "M157 135a4 4 0 1 0 8 0a4 4 0 1 0 -8 0Z"],
          ["lead", "M143 58l15 42"],
        ],
        flows: [
          ["red", "M161 135V94"],
        ],
      },
      {
        cue: 'part-2-1', label: "Sound: along the path", at: [157, 259], tip: [156, 214],
        strokes: [
          ["ink", "M69 205v24m6-24v24m7-24v24m9-24v24m17-24v24m24-24v24m32-24v24m26-24v24m17-24v24m9-24v24m7-24v24m6-24v24"],
        ],
        flows: [
          ["green", "M139 217h22"],
          ["green", "M162 232h-22"],
        ],
      },
    ],
  },
])
