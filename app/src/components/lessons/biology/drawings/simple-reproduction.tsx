import { processDrawing } from '../AnatomyBoard'

export default processDrawing("Reproduction in simpler organisms", [
  {
    outline: [
      ["paper", "M16 174Q66 164 114 176Q166 184 218 172Q262 162 304 174V226H16Z"],
      ["blue", "M165 112Q224 102 296 116V176H165Z"],
    ],
    parts: [
      {
        cue: 'part-2-0', label: "Earthworm|clitellum", at: [16,34], tip: [92,130], align: 'start',
        strokes: [
          ["paper", "M28 142Q60 120 105 122Q138 124 150 144Q136 154 102 152Q60 150 28 142Z"],
          ["amber", "M76 121Q92 117 104 122V153Q90 155 76 151Z"],
          ["ink", "M44 130v14m14-18v18m14-20v22m42-22v22m14-18v18"],
        ],
      },
      {
        cue: 'part-2-1', label: "Cocoon", at: [92,248], tip: [128,162], align: 'middle',
        strokes: [
          ["amber", "M116 162Q128 148 140 162Q128 176 116 162Z"],
          ["ink", "M123 162a2 2 0 1 0 4 0a2 2 0 1 0-4 0Z"],
        ],
        flows: [
          ["amber", "M92 138Q114 146 128 158"],
        ],
      },
      {
        cue: 'part-2-2', label: "Eggs in water|(oviparous)", at: [304,34], tip: [228,136], align: 'end',
        strokes: [
          ["green", "M192 108Q206 90 226 100Q234 114 216 118Q198 118 192 108Z"],
          ["ink", "M202 102h2m12 12q8 8 4 14"],
          ["paper", "M238 134a4 4 0 1 0 8 0a4 4 0 1 0-8 0ZM249 138a4 4 0 1 0 8 0a4 4 0 1 0-8 0ZM242 146a4 4 0 1 0 8 0a4 4 0 1 0-8 0ZM254 148a4 4 0 1 0 8 0a4 4 0 1 0-8 0Z"],
        ],
        flows: [
          ["blue", "M222 116Q234 124 244 134"],
        ],
      },
      {
        cue: 'part-2-3', label: "Live young|(viviparous)", at: [304,242], tip: [248,198], align: 'end',
        strokes: [
          ["red", "M220 198Q234 176 266 184Q286 198 264 214Q234 218 220 198Z"],
          ["paper", "M238 196Q248 186 258 196Q252 206 238 196Z"],
        ],
      },
    ],
  },
  {
    scenes: [0],
    outline: [
      ["blue", "M20 42H300V232H20Z"],
    ],
    parts: [
      {
        cue: 'part-0-0', label: "Paramecium", at: [24,34], tip: [154,82], align: 'start',
        strokes: [
          ["green", "M102 82Q106 58 158 58Q210 58 214 82Q210 106 158 106Q106 106 102 82Z"],
          ["red", "M148 82a9 7 0 1 0 18 0a9 7 0 1 0-18 0Z"],
          ["ink", "M122 60l-3-7m22-1l-1-8m22 8l1-8m22 10l3-7m-64 43l-3 7m22 2l-1 8m22-8l1 8m22-10l3 7"],
        ],
      },
      {
        cue: 'part-0-1', label: "Binary fission:|two daughter cells", at: [160,256], tip: [160,176], align: 'middle',
        strokes: [
          ["green", "M60 176Q64 152 108 154Q144 158 154 172Q160 176 166 172Q176 158 212 154Q256 152 260 176Q256 200 212 198Q176 194 166 180Q160 176 154 180Q144 194 108 198Q64 200 60 176Z"],
          ["red", "M98 176a8 6 0 1 0 16 0a8 6 0 1 0-16 0ZM204 176a8 6 0 1 0 16 0a8 6 0 1 0-16 0Z"],
          ["zoom", "M160 144V208"],
        ],
        flows: [
          ["green", "M148 176H118"],
          ["green", "M172 176H202"],
        ],
      },
    ],
  },
  {
    scenes: [1],
    outline: [
      ["paper", "M22 194H298V238H22Z"],
      ["ink", "M48 194Q72 160 72 104M272 194Q248 160 248 104"],
    ],
    parts: [
      {
        cue: 'part-1-0', label: "Compatible|hyphae", at: [20,38], tip: [108,128], align: 'start',
        strokes: [
          ["green", "M72 132H138V146H72ZM182 132H248V146H182Z"],
          ["ink", "M54 96a6 6 0 1 0 12 0m194 0a6 6 0 1 0 12 0"],
        ],
        flows: [
          ["green", "M78 139H138"],
          ["green", "M242 139H182"],
        ],
      },
      {
        cue: 'part-1-1', label: "Thick-walled|zygospore", at: [300,38], tip: [160,139], align: 'end',
        strokes: [
          ["shade", "M138 139a22 22 0 1 0 44 0a22 22 0 1 0-44 0Z"],
          ["amber", "M145 139a15 15 0 1 0 30 0a15 15 0 1 0-30 0Z"],
          ["ink", "M160 112v5m0 44v5m-27-27h5m44 0h5m-43-19l4 4m34 34l4 4m-38 0l4-4m34-34l4-4"],
        ],
      },
    ],
  },
])
