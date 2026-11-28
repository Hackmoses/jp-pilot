// OpenStax Biology 2e, Figs. 30.26a, 8.5–8.7 and 8.16–8.19.
// Lamlad Biology, PDF p. 32, gives the iodine starch-test result.
import { processDrawing } from '../AnatomyBoard'

export default processDrawing("Photosynthesis in a leaf and chloroplast", [
  {
    outline: [
      ["paper","M78 80Q157 73 230 79L232 192Q188 195 161 193L150 196Q112 193 78 196Z"],
      ["ink","M78 80Q155 72 230 79M79 87Q152 83 231 87M78 185Q113 183 141 186M172 186Q202 184 232 186M78 196Q115 193 142 197M172 196Q204 193 232 192"],
      ["green","M83 95q6.5 -2 13 0v33q-6.5 2 -13 0Z"],
      ["green","M101 97q6.5 -2 13 0v33q-6.5 2 -13 0Z"],
      ["green","M119 95q6.5 -2 13 0v33q-6.5 2 -13 0Z"],
      ["green","M137 97q6.5 -2 13 0v33q-6.5 2 -13 0Z"],
      ["green","M155 95q6.5 -2 13 0v33q-6.5 2 -13 0Z"],
      ["green","M173 97q6.5 -2 13 0v33q-6.5 2 -13 0Z"],
      ["green","M191 95q6.5 -2 13 0v33q-6.5 2 -13 0Z"],
      ["green","M209 97q6.5 -2 13 0v33q-6.5 2 -13 0Z"],
      ["green","M87 145q-9 -8 2 -13q11 -5 15 6q3 9 -7 10q-5 4 -10 -3Z"],
      ["green","M115 157q-9 -8 2 -13q11 -5 15 6q3 9 -7 10q-5 4 -10 -3Z"],
      ["green","M145 145q-9 -8 2 -13q11 -5 15 6q3 9 -7 10q-5 4 -10 -3Z"],
      ["green","M172 159q-9 -8 2 -13q11 -5 15 6q3 9 -7 10q-5 4 -10 -3Z"],
      ["green","M201 144q-9 -8 2 -13q11 -5 15 6q3 9 -7 10q-5 4 -10 -3Z"],
      ["green","M213 165q-9 -8 2 -13q11 -5 15 6q3 9 -7 10q-5 4 -10 -3Z"],
      ["green","M91 175q-9 -8 2 -13q11 -5 15 6q3 9 -7 10q-5 4 -10 -3Z"],
      ["green","M142 177q-9 -8 2 -13q11 -5 15 6q3 9 -7 10q-5 4 -10 -3Z"],
      ["green","M191 173q-9 -8 2 -13q11 -5 15 6q3 9 -7 10q-5 4 -10 -3Z"],
      ["ink","M92 80v6m19-7v7m21-8v8m21-9v9m22-9v9m22-9v9m21-7v7M92 185v10m24-10v10m74-9v8m21-8v7"],
      ["green","M136 187Q145 178 155 183Q152 200 140 199Q134 195 136 187ZM161 184Q172 179 179 187Q182 196 172 199Q164 201 161 184Z"],
      ["ink","M79 76Q155 70 230 75M79 200Q112 198 141 200M178 200Q207 197 231 197"],
    ],
    parts: [
      {
        cue: 'part-1-0', label: "Light", at: [160,38], tip: [160,91],
        flows: [
          ["amber","M160 48L160 92"],
        ],
      },
      {
        cue: 'part-2-0', label: "Palisade|mesophyll", at: [8,104], tip: [87,112],
        strokes: [
          ["lead","M61 116L85 112"],
          ["ink","M93 106l1 2m3 10l1 2m12-11l1 2m5 10l1 2m13-14l1 2m5 9l1 2m13-14l1 2m4 11l1 2m14-14l1 2m3 10l1 2m14-14l1 2m4 12l1 2m14-14l1 2m3 9l1 2"],
        ],
      },
      {
        cue: 'part-3-0', label: "CO₂ through|a stoma", at: [160,246], tip: [158,197],
        flows: [
          ["green","M157 221Q157 198 161 174"],
        ],
      },
    ],
  },
  {
    scenes: [4,7,20],
    outline: [
      ["green","M67 133C73 101 103 82 157 82Q221 81 250 112Q272 147 241 174Q210 203 153 201Q94 202 71 171Q62 158 67 133Z"],
      ["paper","M75 136C80 107 111 90 157 90Q219 89 244 118Q262 145 236 168Q207 194 153 193Q100 195 78 168Q71 156 75 136Z"],
    ],
    parts: [
      {
        cue: 'part-4-0', label: "Light reactions", at: [64,59], tip: [108,127],
        strokes: [
          ["green","M93 128Q113 118 134 128V164Q113 173 93 163Z"],
          ["ink","M94 130Q112 138 133 130m-40 7q18 8 40 0m-40 8q18 8 40 0m-40 8q19 8 40 0m-40 8q19 8 40 0"],
          ["lead","M80 64L101 119"],
        ],
        flows: [
          ["amber","M107 79L110 119"],
        ],
      },
      {
        cue: 'part-5-0', label: "H₂O", at: [32,128], tip: [103,141],
        flows: [
          ["blue","M51 137L92 142"],
        ],
      },
      {
        cue: 'part-6-0', label: "O₂", at: [30,206], tip: [86,159],
        flows: [
          ["blue","M94 159Q73 177 43 194"],
        ],
      },
      {
        cue: 'part-8-0', label: "Calvin cycle", at: [249,59], tip: [205,137],
        strokes: [
          ["lead","M237 65L220 112"],
        ],
        flows: [
          ["green","M187 143Q193 118 217 124Q240 132 225 154Q211 169 192 156"],
        ],
      },
      {
        cue: 'part-9-0', label: "ATP + NADPH", at: [161,246], tip: [164,136],
        strokes: [
          ["lead","M161 232V155"],
        ],
        flows: [
          ["amber","M135 137Q155 125 184 137"],
        ],
      },
      {
        cue: 'part-7-0', label: "CO₂", at: [299,111], tip: [223,124],
        flows: [
          ["green","M284 117L227 128"],
        ],
      },
      {
        cue: 'part-10-0', label: "Sugar|precursor", at: [304,206], tip: [232,155],
        flows: [
          ["green","M225 156Q246 168 279 174"],
        ],
      },
    ],
  },
  {
    scenes: [11],
    outline: [
      ["paper","M66 165Q76 211 145 219Q219 222 248 166Q242 142 166 142Q92 137 66 165Z"],
      ["ink","M65 165Q144 198 248 166"],
      ["green","M101 166Q126 123 209 156Q171 191 113 177L95 185Z"],
      ["ink","M107 174Q155 163 200 157"],
    ],
    parts: [
      {
        cue: 'part-11-0', label: "Iodine", at: [161,47], tip: [159,136],
        strokes: [
          ["amber","M158 105Q143 123 149 129Q157 141 168 129Q173 122 158 105Z"],
        ],
        flows: [
          ["amber","M160 57V98"],
        ],
      },
      {
        cue: 'part-12-0', label: "Blue-black|starch test", at: [309,86], tip: [178,157],
        strokes: [
          ["shade","M146 153Q172 142 195 154Q178 167 155 170Q142 165 146 153Z"],
          ["lead","M247 104L185 149"],
        ],
      },
    ],
  },
  {
    scenes: [22],
    outline: [
      ["paper","M24 117H140V162H24ZM183 117H296V162H183Z"],
    ],
    parts: [
      {
        cue: 'part-13-0', label: "6CO₂ + 6H₂O", at: [82,147], tip: [82,133],
      },
      {
        cue: 'part-14-0', label: "C₆H₁₂O₆ + 6O₂", at: [241,147], tip: [240,133],
      },
      {
        cue: 'part-15-0', label: "Light", at: [160,89], tip: [161,140],
        strokes: [
          ["lead","M160 96V123"],
        ],
        flows: [
          ["amber","M145 140H178"],
        ],
      },
    ],
  },
  {
    scenes: [23],
    outline: [
      ["paper","M44 145Q154 141 273 145V170Q160 166 44 170Z"],
      ["ink","M45 154H76M251 154H273"],
      ["green","M76 108Q95 91 120 105Q139 88 158 104Q183 91 205 108Q233 94 247 117V170H76Z"],
      ["ink","M159 104V171"],
      ["amber","M86 116a5 5 0 1 0 10 0a5 5 0 1 0 -10 0ZM112 125a5 5 0 1 0 10 0a5 5 0 1 0 -10 0ZM130 108a5 5 0 1 0 10 0a5 5 0 1 0 -10 0ZM172 118a5 5 0 1 0 10 0a5 5 0 1 0 -10 0ZM205 121a5 5 0 1 0 10 0a5 5 0 1 0 -10 0ZM226 115a5 5 0 1 0 10 0a5 5 0 1 0 -10 0Z"],
      ["green","M92 140a5 5 0 1 0 10 0a5 5 0 1 0 -10 0ZM138 133a5 5 0 1 0 10 0a5 5 0 1 0 -10 0ZM178 143a5 5 0 1 0 10 0a5 5 0 1 0 -10 0ZM215 140a5 5 0 1 0 10 0a5 5 0 1 0 -10 0Z"],
      ["red","M155 149a8 8 0 1 0 16 0a8 8 0 1 0 -16 0Z"],
    ],
    parts: [
      {
        cue: 'part-16-0', label: "Chlorophyll", at: [56,62], tip: [97,139],
        strokes: [
          ["lead","M58 68L98 136"],
        ],
      },
      {
        cue: 'part-17-0', label: "Carotenoids", at: [248,61], tip: [211,120],
        strokes: [
          ["lead","M240 69L211 114"],
        ],
      },
      {
        cue: 'part-18-0', label: "Thylakoid membrane", at: [160,224], tip: [187,169],
        strokes: [
          ["lead","M160 210L186 171"],
        ],
      },
    ],
  },
])
