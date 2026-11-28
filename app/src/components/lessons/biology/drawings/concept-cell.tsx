import { processDrawing } from '../AnatomyBoard'

// Plant cell for the Biology key concept lesson bio-cell, checked against OpenStax Biology 2e 4.3
// (Figure 4.8). Parts are numbered in the order the lesson introduces them (part-<n>-0).
// Steps 1 to 7 show a young cell with the nucleus in the middle. From step 8 (chapters 8 and 9)
// the large central vacuole fills the cell and pushes the nucleus and cytoplasm to the edge,
// which is what step 9 teaches. Ribosomes are tiny dots, free or near the nucleus (OpenStax 4.3).
export default processDrawing("Plant cell and its parts", [
  {
    outline: [
      ["paper", "M102 57Q160 48 220 59Q228 140 222 216Q160 226 104 216Q96 140 102 57Z"],
    ],
    parts: [
      {
        cue: 'part-7-0', label: "Cellulose wall", at: [8,30], tip: [98,54], align: 'start',
        strokes: [
          ["green", "M96 50Q160 40 226 52Q236 140 228 224Q160 236 98 224Q88 140 96 50Z"],
          ["paper", "M102 57Q160 48 220 59Q228 140 222 216Q160 226 104 216Q96 140 102 57Z"],
          ["lead", "M58 34L96 52"],
        ],
      },
      {
        cue: 'part-1-0', label: "Cell membrane", at: [312,30], tip: [214,66], align: 'end',
        strokes: [
          ["blue", "M107 62Q160 54 215 64Q222 140 217 211Q160 220 109 211Q102 140 107 62Z"],
          ["lead", "M262 34L216 64"],
        ],
      },
      {
        cue: 'part-3-0', label: "Cytoplasm", at: [8,236], tip: [130,206], align: 'start',
        strokes: [
          ["lead", "M66 230L130 206"],
        ],
      },
      {
        cue: 'part-2-0', label: "Nucleus", at: [8,110], tip: [140,124], align: 'start',
        strokes: [
          ["red", "M140 118Q152 106 168 112Q180 124 174 140Q160 152 145 146Q134 134 140 118Z"],
          ["ink", "M154 128q4-4 8 0t-8 0"],
          ["lead", "M56 108L138 124"],
        ],
      },
      {
        cue: 'part-6-0', label: "Chloroplast", at: [312,124], tip: [206,74], align: 'end',
        strokes: [
          ["green", "M182 68Q192 62 205 66Q212 73 204 80Q192 85 183 80Q177 74 182 68Z"],
          ["ink", "M186 71h15m-14 4h14"],
          ["green", "M110 178Q118 172 128 176Q133 182 127 188Q118 192 111 188Q106 183 110 178Z"],
          ["ink", "M113 181h12m-11 4h10"],
          ["lead", "M270 112L208 76"],
        ],
      },
      {
        cue: 'part-5-0', label: "Mitochondrion", at: [312,236], tip: [200,200], align: 'end',
        strokes: [
          ["red", "M178 192Q186 186 198 189Q206 194 200 201Q189 206 180 201Q173 197 178 192Z"],
          ["ink", "M181 195q4-5 7 0t7 0"],
          ["lead", "M262 230L202 200"],
        ],
      },
      {
        cue: 'part-4-0', label: "Ribosomes", at: [160,262], tip: [148,182], align: 'middle',
        strokes: [
          ["shade", "M133.8 110a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0 -4.4 0M175.8 114a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0 -4.4 0M181.8 134a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0 -4.4 0M129.8 144a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0 -4.4 0M167.8 154a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0 -4.4 0M137.8 176a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0 -4.4 0M146.8 180a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0 -4.4 0M154.8 175a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0 -4.4 0M121.8 96a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0 -4.4 0M195.8 168a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0 -4.4 0"],
          ["lead", "M156 252L148 184"],
        ],
      },
    ],
  },
  {
    scenes: [8, 9],
    outline: [
      ["paper", "M102 57Q160 48 220 59Q228 140 222 216Q160 226 104 216Q96 140 102 57Z"],
    ],
    parts: [
      {
        cue: 'part-7-0', label: "Cellulose wall", at: [8,30], tip: [98,54], align: 'start',
        strokes: [
          ["green", "M96 50Q160 40 226 52Q236 140 228 224Q160 236 98 224Q88 140 96 50Z"],
          ["paper", "M102 57Q160 48 220 59Q228 140 222 216Q160 226 104 216Q96 140 102 57Z"],
          ["lead", "M58 34L96 52"],
        ],
      },
      {
        cue: 'part-1-0', label: "Cell membrane", at: [312,30], tip: [214,66], align: 'end',
        strokes: [
          ["blue", "M107 62Q160 54 215 64Q222 140 217 211Q160 220 109 211Q102 140 107 62Z"],
          ["lead", "M262 34L216 64"],
        ],
      },
      {
        cue: 'part-8-0', label: "Large|vacuole", at: [8,156], tip: [124,140], align: 'start',
        strokes: [
          ["amber", "M124 82Q166 72 206 84Q214 135 206 192Q166 204 128 192Q116 135 124 82Z"],
          ["lead", "M54 158L122 142"],
        ],
      },
      {
        cue: 'part-3-0', label: "Cytoplasm", at: [8,214], tip: [112,160], align: 'start',
        strokes: [
          ["lead", "M68 208L111 162"],
        ],
      },
      {
        cue: 'part-2-0', label: "Nucleus", at: [8,92], tip: [112,74], align: 'start',
        strokes: [
          ["red", "M110 66Q120 60 132 64Q137 72 131 78Q119 82 111 77Q106 71 110 66Z"],
          ["ink", "M117 70q3-3 6 0t-6 0"],
          ["lead", "M56 90L108 74"],
        ],
      },
      {
        cue: 'part-6-0', label: "Chloroplast", at: [312,124], tip: [216,118], align: 'end',
        strokes: [
          ["green", "M208 106Q214 100 218 108Q220 124 215 132Q208 133 207 122Q205 112 208 106Z"],
          ["ink", "M212 110v16"],
          ["lead", "M270 120L219 118"],
        ],
      },
      {
        cue: 'part-5-0', label: "Mitochondrion", at: [312,236], tip: [172,208], align: 'end',
        strokes: [
          ["red", "M150 204Q158 199 170 201Q176 206 170 211Q160 214 151 210Q146 207 150 204Z"],
          ["ink", "M153 206q4-4 7 0t7 0"],
          ["lead", "M262 230L174 208"],
        ],
      },
      {
        cue: 'part-4-0', label: "Ribosomes", at: [160,262], tip: [118,205], align: 'middle',
        strokes: [
          ["shade", "M135.8 70a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0 -4.4 0M139.8 76a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0 -4.4 0M109.8 98a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0 -4.4 0M210.8 92a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0 -4.4 0M115.8 205a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0 -4.4 0M193.8 206a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0 -4.4 0M183.8 70a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0 -4.4 0"],
          ["lead", "M150 252L120 209"],
        ],
      },
    ],
  },
])
