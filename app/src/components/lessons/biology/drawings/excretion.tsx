import { processDrawing } from '../AnatomyBoard'

export default processDrawing("Excretion, water balance and skin glands", [
  {
    outline: [
      ["amber", "M21 72Q101 65 165 74Q232 57 301 70L301 222H21Z"],
      ["paper", "M21 87Q108 78 164 88Q228 71 301 85L301 221H21Z"],
      ["red", "M21 181Q86 169 129 186Q215 201 301 176V222H21Z"],
      ["ink", "M21 145Q83 151 120 153Q207 160 301 139"],
      ["amber", "M194 29L195 76Q198 103 212 134Q218 151 219 177H230Q233 149 220 129Q204 85 202 28Z"],
    ],
    parts: [
      {
        cue: 'part-1-0', label: "Sweat gland", at: [22,248], tip: [102,169], align: 'start',
        strokes: [
          ["blue", "M104 165Q87 162 79 171Q68 181 83 191Q102 207 121 190Q128 179 118 174Q104 166 99 180Q101 194 116 184"],
          ["ink", "M104 174Q99 148 96 125Q92 107 95 71"],
        ],
        flows: [
          ["blue", "M84 185Q101 196 111 184Q111 171 104 165Q96 135 96 121L96 65"],
        ],
      },
      {
        cue: 'part-1-1', label: "Sebaceous gland", at: [302,112], tip: [225,125], align: 'end',
        strokes: [
          ["amber", "M215 116Q216 98 230 101Q241 99 248 111Q254 125 242 132Q226 144 217 133Z"],
        ],
        flows: [
          ["blue", "M239 118L218 124Q207 108 201 80"],
        ],
      },
      {
        cue: 'part-2-0', label: "Tannins|bind hide proteins", at: [305,257], tip: [269,213], align: 'end',
        strokes: [
          ["green", "M250 232Q244 203 281 190Q296 215 250 232Z"],
          ["ink", "M252 226L279 198"],
        ],
      },
    ],
  },
  {
    scenes: [0],
    outline: [
      ["blue", "M18 106Q88 95 196 108Q270 130 302 121V243H18Z"],
      ["green", "M24 146Q51 116 105 126Q150 132 159 158Q158 184 113 204Q61 224 31 201Q13 186 24 146Z"],
    ],
    parts: [
      {
        cue: 'part-0-0', label: "Contractile vacuole", at: [17,73], tip: [104,157], align: 'start',
        strokes: [
          ["red", "M65 151L78 161L68 175L86 171L95 185L99 169L116 172L108 160L116 148L99 151L92 139L85 152Z"],
        ],
        flows: [
          ["blue", "M89 160Q67 148 38 153L17 157"],
        ],
      },
      {
        cue: 'part-0-1', label: "Malpighian|tubules", at: [303,59], tip: [228,145], align: 'end',
        strokes: [
          ["amber", "M218 123Q223 97 255 103Q290 105 297 134Q307 181 268 216Q243 219 228 200Q211 185 207 167Q200 149 218 123Z"],
          ["paper", "M239 115Q240 143 249 151Q262 161 262 185Q262 199 251 208L242 202Q251 193 250 182Q248 167 238 156Q225 144 230 116Z"],
          ["red", "M246 168Q217 161 222 144Q225 127 213 122M248 168Q279 156 282 139Q278 122 286 116"],
        ],
        flows: [
          ["blue", "M220 132Q212 153 244 165Q259 183 250 204"],
        ],
      },
    ],
  },
])
