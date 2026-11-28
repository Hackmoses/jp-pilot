// OpenStax Biology 2e, Figs. 30.34, 30.36–30.37, 40.10–40.11, 40.5 and 40.8.
// Xylem and phloem, mammalian circulation and blood components.
import { processDrawing } from '../AnatomyBoard'

export default processDrawing("Plant vessels, double circulation and blood", [
  {
    outline: [
      ["green","M147 207Q149 154 148 112L147 71L158 70Q161 140 161 207Z"],
      ["green","M153 79Q132 75 111 46Q145 43 158 65Q183 36 212 39Q190 68 159 79Z"],
      ["ink","M152 76L118 48M158 73L203 43"],
      ["ink","M153 204Q133 226 102 238M143 214Q122 214 104 223M134 223L122 245M155 206Q166 231 195 247M160 213Q183 219 207 220M175 232L187 232M156 213L154 255"],
      ["lead","M57 209Q109 203 140 208M168 207Q212 201 263 207"],
    ],
    parts: [
      {
        cue: 'part-1-0', label: "Xylem", at: [16,130], tip: [149,136],
        strokes: [
          ["lead","M59 126L143 134"],
        ],
        flows: [
          ["blue","M113 229Q144 217 151 201L152 80L131 56"],
        ],
      },
      {
        cue: 'part-3-0', label: "Phloem", at: [307,131], tip: [159,140],
        strokes: [
          ["lead","M253 132L164 139"],
        ],
        flows: [
          ["green","M194 48Q179 66 158 79L157 206Q164 229 186 239"],
        ],
      },
      {
        cue: 'part-4-0', label: "Source leaf", at: [306,25], tip: [193,48],
        strokes: [
          ["lead","M244 29L202 43"],
        ],
      },
      {
        cue: 'part-5-0', label: "Root sink", at: [309,249], tip: [185,232],
        strokes: [
          ["lead","M248 245L190 233"],
        ],
      },
      {
        cue: 'part-2-0', label: "Root uptake", at: [15,235], tip: [103,230],
        strokes: [
          ["lead","M81 230H100"],
        ],
      },
    ],
  },
  {
    scenes: [6,12,19],
    outline: [
      ["paper","M156 108Q137 86 114 101Q89 116 101 150Q117 184 184 196Q211 181 219 148Q229 110 207 97Q190 85 174 97Z"],
      ["blue","M146 129Q129 116 109 124Q104 138 119 151Q141 145 149 155Q154 143 146 129Z"],
      ["blue","M120 152Q133 150 151 156Q160 178 176 192Q136 186 120 152Z"],
      ["red","M171 125Q187 112 210 118Q215 130 204 145L176 141Z"],
      ["red","M162 152Q183 141 204 147Q200 175 184 189Q173 181 162 152Z"],
      ["ink","M152 131Q154 147 165 161Q178 183 183 194M124 151l10 4 6-5m40-6l9 5 8-5"],
      ["ink","M117 50q6-15 14-6t15 2t16 2t16-2t16 0t13-2M117 222q6-15 14-6t15 2t16 2t16-2t16 0t13-2"],
    ],
    parts: [
      {
        cue: 'part-11-0', label: "Aorta", at: [309,73], tip: [246,91],
        strokes: [
          ["lead","M275 76L247 89"],
        ],
        flows: [
          ["red","M187 163Q175 128 185 100Q211 57 235 76Q248 88 240 151Q235 205 205 215"],
        ],
      },
      {
        cue: 'part-8-0', label: "Right atrium", at: [8,112], tip: [119,134],
        strokes: [
          ["lead","M80 113L110 128"],
        ],
        flows: [
          ["blue","M118 220Q80 214 78 173Q72 125 114 133Q134 138 132 153"],
        ],
      },
      {
        cue: 'part-7-0', label: "Lung capillaries", at: [160,22], tip: [162,48],
        strokes: [
          ["lead","M160 28V41"],
        ],
        flows: [
          ["blue","M140 165Q164 154 154 125Q143 97 145 57"],
        ],
      },
      {
        cue: 'part-9-0', label: "Left atrium", at: [309,112], tip: [201,127],
        strokes: [
          ["lead","M249 113L210 123"],
        ],
        flows: [
          ["red","M184 53Q223 75 215 99Q212 110 199 124"],
        ],
      },
      {
        cue: 'part-6-0', label: "Right|ventricle", at: [11,164], tip: [142,164],
        strokes: [
          ["lead","M66 174L136 164"],
        ],
      },
      {
        cue: 'part-10-0', label: "Left|ventricle", at: [311,171], tip: [185,165],
        strokes: [
          ["lead","M251 176L196 166"],
        ],
        flows: [
          ["red","M196 132Q184 145 185 165"],
        ],
      },
      {
        cue: 'part-13-0', label: "Body capillaries", at: [160,257], tip: [162,220],
        strokes: [
          ["lead","M160 245V226"],
          ["ink","M111 222q14-10 27-1q12 14 23 1q12-11 26-2q14 6 28-4"],
        ],
      },
      {
        cue: 'part-12-0', label: "Pulmonary|artery", at: [7,57], tip: [145,86],
        strokes: [
          ["lead","M71 67L139 84"],
        ],
      },
      {
        cue: 'part-17-0', label: "Pulmonary vein", at: [309,34], tip: [212,75],
        strokes: [
          ["lead","M269 39L215 73"],
        ],
      },
    ],
  },
  {
    scenes: [14],
    outline: [
      ["paper","M81 81Q150 64 236 83Q253 141 231 198Q145 218 81 193Q61 139 81 81Z"],
      ["red","M81 127q3 -15 22 -13q19 -2 22 13q-1 14 -20 14q-26 2 -24 -14Z"],
      ["ink","M93 127q11 -6 20 0q-9 6 -20 0Z"],
      ["red","M189 99q3 -15 22 -13q19 -2 22 13q-1 14 -20 14q-26 2 -24 -14Z"],
      ["ink","M201 99q11 -6 20 0q-9 6 -20 0Z"],
      ["red","M188 173q3 -15 22 -13q19 -2 22 13q-1 14 -20 14q-26 2 -24 -14Z"],
      ["ink","M200 173q11 -6 20 0q-9 6 -20 0Z"],
    ],
    parts: [
      {
        cue: 'part-15-0', label: "Platelets", at: [12,229], tip: [114,170],
        strokes: [
          ["amber","M107 164l5-3 7 5-5 5-6-1ZM92 176l6-4 5 2-3 6-6 1ZM118 177l6-3 5 5-7 3Z"],
          ["lead","M60 218L89 191L110 172"],
        ],
      },
      {
        cue: 'part-16-0', label: "Red blood|cell", at: [309,227], tip: [211,173],
        strokes: [
          ["lead","M253 219L222 184"],
        ],
      },
      {
        cue: 'part-14-0', label: "White blood|cell", at: [309,54], tip: [161,149],
        strokes: [
          ["blue","M133 138Q141 119 162 119Q184 121 189 143Q192 166 170 175Q149 181 135 162Q129 152 133 138Z"],
          ["ink","M140 144Q137 133 147 131Q155 128 159 140Q164 145 166 137Q169 128 177 134Q189 146 178 153Q168 156 166 150Q170 162 158 166Q145 164 150 153Q141 153 140 144Z"],
          ["lead","M244 60L190 76L168 119"],
        ],
      },
    ],
  },
])
