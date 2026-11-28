// OpenStax Biology 2e, Figs. 12.4, 12.16 and 12.19.
// The Punnett square follows the same gamete arrangement for the crosses in this lesson.
import { processDrawing } from '../AnatomyBoard'

export default processDrawing("Segregation, assortment and Punnett squares", [
  {
    outline: [
      ["paper","M38 60Q75 55 117 60V127Q75 131 38 127ZM203 60Q241 54 281 60V127Q239 132 203 127Z"],
      ["paper","M119 173Q159 169 201 173V222Q160 226 119 222Z"],
    ],
    parts: [
      {
        cue: 'part-1-0', label: "Rr", at: [78,90], tip: [79,115],
        strokes: [
          ["amber","M67 110q1 -11 11 -12q11 -3 14 9q3 11 -7 15q-14 5 -18 -12Z"],
        ],
        flows: [
          ["amber","M81 132Q96 162 129 179"],
        ],
      },
      {
        cue: 'part-2-0', label: "Rr", at: [242,90], tip: [241,115],
        strokes: [
          ["amber","M229 110q1 -11 11 -12q11 -3 14 9q3 11 -7 15q-14 5 -18 -12Z"],
        ],
        flows: [
          ["amber","M239 132Q229 163 193 179"],
        ],
      },
      {
        cue: 'part-3-0', label: "rr", at: [160,194], tip: [161,211],
        strokes: [
          ["green","M149 208q-2 -6 4 -8q1 -7 9 -4q7 -2 10 4q7 2 3 9q2 5 -4 7q-2 5 -8 4q-7 2 -9 -4q-6 0 -5 -8Z"],
        ],
      },
      {
        cue: 'part-4-0', label: "Each gamete|gets one allele", at: [160,248], tip: [163,171],
        strokes: [
          ["lead","M160 234V223"],
        ],
      },
    ],
  },
  {
    scenes: [5],
    outline: [
      ["paper","M126 39H195V74H126Z"],
      ["ink","M161 73V95M161 96L86 123M161 96L234 123M86 146V171L45 206M86 171L120 206M234 146V171L200 206M234 171L274 206"],
    ],
    parts: [
      {
        cue: 'part-5-0', label: "YyRr", at: [161,62], tip: [160,62],
      },
      {
        cue: 'part-8-0', label: "YR", at: [45,230], tip: [45,208],
        strokes: [
          ["amber","M24 213h43v26H24Z"],
        ],
      },
      {
        cue: 'part-9-0', label: "Yr", at: [120,230], tip: [120,208],
        strokes: [
          ["amber","M99 213h43v26H99Z"],
        ],
      },
      {
        cue: 'part-10-0', label: "yR", at: [200,230], tip: [200,208],
        strokes: [
          ["green","M179 213h43v26h-43Z"],
        ],
      },
      {
        cue: 'part-11-0', label: "yr", at: [274,230], tip: [274,208],
        strokes: [
          ["green","M253 213h43v26h-43Z"],
        ],
      },
      {
        cue: 'part-6-0', label: "Y", at: [86,142], tip: [86,142],
        strokes: [
          ["amber","M66 121h40v31H66Z"],
        ],
      },
      {
        cue: 'part-7-0', label: "y", at: [234,142], tip: [234,142],
        strokes: [
          ["green","M214 121h40v31h-40Z"],
        ],
      },
    ],
  },
  {
    scenes: [12,23],
    outline: [
      ["paper","M101 81Q168 78 238 81V219Q172 222 101 219Z"],
      ["ink","M169 80Q168 154 170 220M102 149Q168 151 238 149"],
    ],
    parts: [
      {
        cue: 'part-12-0', label: "A or a", at: [170,34], tip: [168,81],
        strokes: [
          ["lead","M164 40L137 54M176 40L203 54"],
        ],
      },
      {
        cue: 'part-13-0', label: "A", at: [136,71], tip: [136,85],
      },
      {
        cue: 'part-14-0', label: "a", at: [203,71], tip: [203,85],
      },
      {
        cue: 'part-15-0', label: "A", at: [83,119], tip: [103,116],
      },
      {
        cue: 'part-16-0', label: "a", at: [83,187], tip: [104,183],
      },
      {
        cue: 'part-17-0', label: "AA", at: [135,120], tip: [135,132],
      },
      {
        cue: 'part-18-0', label: "Aa", at: [203,120], tip: [203,132],
      },
      {
        cue: 'part-19-0', label: "Aa", at: [135,188], tip: [135,200],
      },
      {
        cue: 'part-20-0', label: "aa", at: [203,188], tip: [203,200],
      },
    ],
  },
  {
    scenes: [24],
    outline: [
      ["paper","M101 81Q168 78 238 81V219Q172 222 101 219Z"],
      ["ink","M169 80Q168 154 170 220M102 149Q168 151 238 149"],
    ],
    parts: [
      {
        cue: 'part-12-0', label: "R or r", at: [170,34], tip: [168,81],
        strokes: [
          ["lead","M164 40L137 54M176 40L203 54"],
        ],
      },
      {
        cue: 'part-13-0', label: "R", at: [136,71], tip: [136,85],
      },
      {
        cue: 'part-14-0', label: "r", at: [203,71], tip: [203,85],
      },
      {
        cue: 'part-15-0', label: "R", at: [83,119], tip: [103,116],
      },
      {
        cue: 'part-16-0', label: "r", at: [83,187], tip: [104,183],
      },
      {
        cue: 'part-17-0', label: "RR", at: [135,110], tip: [135,132],
        strokes: [
          ["amber","M123 131q1 -11 11 -12q11 -3 14 9q3 11 -7 15q-14 5 -18 -12Z"],
        ],
      },
      {
        cue: 'part-18-0', label: "Rr", at: [203,110], tip: [203,132],
        strokes: [
          ["amber","M191 131q1 -11 11 -12q11 -3 14 9q3 11 -7 15q-14 5 -18 -12Z"],
        ],
      },
      {
        cue: 'part-19-0', label: "Rr", at: [135,178], tip: [135,200],
        strokes: [
          ["amber","M123 199q1 -11 11 -12q11 -3 14 9q3 11 -7 15q-14 5 -18 -12Z"],
        ],
      },
      {
        cue: 'part-20-0', label: "rr", at: [203,178], tip: [203,200],
        strokes: [
          ["green","M191 199q-2 -6 4 -8q1 -7 9 -4q7 -2 10 4q7 2 3 9q2 5 -4 7q-2 5 -8 4q-7 2 -9 -4q-6 0 -5 -8Z"],
        ],
      },
    ],
  },
  {
    scenes: [25],
    outline: [
      ["paper","M101 81Q168 78 238 81V219Q172 222 101 219Z"],
      ["ink","M169 80Q168 154 170 220M102 149Q168 151 238 149"],
    ],
    parts: [
      {
        cue: 'part-12-0', label: "Y or y", at: [170,34], tip: [168,81],
        strokes: [
          ["lead","M164 40L137 54M176 40L203 54"],
        ],
      },
      {
        cue: 'part-13-0', label: "Y", at: [136,71], tip: [136,85],
      },
      {
        cue: 'part-14-0', label: "y", at: [203,71], tip: [203,85],
      },
      {
        cue: 'part-15-0', label: "Y", at: [83,119], tip: [103,116],
      },
      {
        cue: 'part-16-0', label: "y", at: [83,187], tip: [104,183],
      },
      {
        cue: 'part-17-0', label: "YY", at: [135,110], tip: [135,132],
        strokes: [
          ["amber","M123 125Q133 117 148 125L141 141Q135 146 128 140Z"],
        ],
      },
      {
        cue: 'part-18-0', label: "Yy", at: [203,110], tip: [203,132],
        strokes: [
          ["amber","M191 125Q201 117 216 125L209 141Q203 146 196 140Z"],
        ],
      },
      {
        cue: 'part-19-0', label: "Yy", at: [135,178], tip: [135,200],
        strokes: [
          ["amber","M123 193Q133 185 148 193L141 209Q135 214 128 208Z"],
        ],
      },
      {
        cue: 'part-20-0', label: "yy", at: [203,178], tip: [203,200],
        strokes: [
          ["paper","M191 193Q201 185 216 193L209 209Q203 214 196 208Z"],
        ],
      },
    ],
  },
])
