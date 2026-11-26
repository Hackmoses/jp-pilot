import { processDrawing } from '../AnatomyBoard'

export default processDrawing("Nerves, hormones and control", [
  {
    outline: [
      ["lead", "M134 60Q119 37 138 18Q159 4 175 19Q190 30 183 53L173 66L175 83Q223 89 230 128L247 224M134 61L132 84Q91 95 84 131L65 226M109 230L111 179M207 231L204 181"],
      ["paper", "M136 30Q143 19 158 20Q175 21 177 36Q178 49 166 54Q149 61 137 48Z"],
      ["amber", "M153 53L169 53L162 122L155 184H148L152 120Z"],
      ["red", "M171 125Q177 114 188 122Q195 121 201 130Q206 151 184 166Q171 155 167 143Z"],
      ["blue", "M186 155Q196 177 184 207L176 221L172 211Q186 197 183 173L180 159Z"],
      ["paper", "M124 187Q111 171 103 188Q94 206 109 216Q126 218 128 205Q115 203 124 187ZM199 193Q214 180 223 192Q234 209 222 221Q207 226 201 212Q215 212 199 193Z"],
    ],
    parts: [
      {
        cue: 'part-0-0', label: "Nerve impulse", at: [16,132], tip: [154,130], align: 'start',
        strokes: [
          ["lead", "M96 130L144 129"],
          ["ink", "M156 89Q151 104 139 112Q129 122 126 143M156 111Q167 127 182 128"],
        ],
        flows: [
          ["blue", "M161 51L157 83L156 113Q168 125 179 129"],
        ],
      },
      {
        cue: 'part-0-1', label: "Hormones|in blood", at: [301,181], tip: [187,182], align: 'end',
        strokes: [
          ["lead", "M234 182H195"],
        ],
        flows: [
          ["blue", "M199 189Q192 186 186 182L186 163"],
        ],
      },
      {
        cue: 'part-1-0', label: "Cerebellum", at: [23,71], tip: [172,46], align: 'start',
        strokes: [
          ["green", "M161 48Q169 40 178 43Q186 52 176 59Q166 61 161 48Z"],
          ["lead", "M94 69L169 52"],
        ],
      },
      {
        cue: 'part-1-1', label: "Autonomic|control", at: [301,102], tip: [181,129], align: 'end',
        strokes: [
          ["lead", "M237 108L187 126"],
        ],
        flows: [
          ["blue", "M161 70L159 96Q165 119 181 128"],
        ],
      },
      {
        cue: 'part-2-0', label: "Adrenal gland", at: [18,252], tip: [108,181], align: 'start',
        strokes: [
          ["amber", "M102 184Q111 164 125 176L129 182Q119 174 108 188ZM201 191Q212 173 223 183L228 193Q215 185 206 198Z"],
          ["lead", "M67 239L105 186"],
        ],
        flows: [
          ["blue", "M216 187Q198 185 189 184Q184 177 185 163"],
        ],
      },
    ],
  },
])
