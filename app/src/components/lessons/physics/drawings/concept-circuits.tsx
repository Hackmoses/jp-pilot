import { processDrawing } from '../../biology/AnatomyBoard'

// Circuits for the Physics key concept lesson phys-circuits, drawn with the standard symbols in
// OpenStax College Physics 2e 21.1 (Resistors in Series and Parallel, Figures 21.2 and 21.4) and
// 21.2 (Electromotive Force: Terminal Voltage, Figures 21.9 and 21.12 for internal resistance r and a
// load). The long line of the cell is the positive terminal; current leaves it, as in Figure 21.12.
// Views: series loop (steps 2 to 4), parallel branches (steps 1, 5 and 16), cell with internal
// resistance (steps 6 and 8 to 10). Parts are numbered by the step that introduces them.
export default processDrawing("Electric circuits", [
  {
    outline: [],
    parts: [
      {
        cue: 'part-1-5', label: "Cell", at: [160,16], tip: [159,30], align: 'middle',
        strokes: [
          ["ink", "M154 30v24"],
          ["ink", "M164 36v12"],
          ["ink", "M150 26h-6m3-3v6"],
        ],
      },
      {
        cue: 'part-2-1', label: "Current", at: [8,124], tip: [80,124], align: 'start',
        strokes: [
          ["ink", "M154 42H80V196H250V42H164"],
          ["lead", "M58 122L78 124"],
        ],
        flows: [
          ["red", "M150 42H86V190"],
        ],
      },
      {
        cue: 'part-2-2', label: "Ammeter", at: [312,80], tip: [258,110], align: 'end',
        strokes: [
          ["paper", "M238 118a12 12 0 1 0 24 0a12 12 0 1 0 -24 0"],
          ["ink", "M245 124l5-12 5 12m-8-4h6"],
          ["lead", "M290 84L259 108"],
        ],
      },
      {
        cue: 'part-2-3', label: "Voltmeter", at: [8,250], tip: [113,244], align: 'start',
        strokes: [
          ["ink", "M100 196V244H113M137 244H150V196"],
          ["paper", "M113 244a12 12 0 1 0 24 0a12 12 0 1 0 -24 0"],
          ["ink", "M120 238l5 12 5-12"],
          ["lead", "M76 248L112 245"],
        ],
      },
      {
        cue: 'part-3-0', label: "R₁", at: [125,180], tip: [125,189], align: 'middle',
        strokes: [
          ["paper", "M105 189h40v14h-40Z"],
        ],
      },
      {
        cue: 'part-4-0', label: "R₂", at: [200,180], tip: [200,189], align: 'middle',
        strokes: [
          ["paper", "M180 189h40v14h-40Z"],
        ],
      },
    ],
  },
  {
    scenes: [1, 5, 16],
    outline: [],
    parts: [
      {
        cue: 'part-1-5', label: "Cell", at: [160,16], tip: [159,30], align: 'middle',
        strokes: [
          ["ink", "M154 30v24"],
          ["ink", "M164 36v12"],
          ["ink", "M150 26h-6m3-3v6"],
        ],
      },
      {
        cue: 'part-1-0', label: "Junction", at: [8,96], tip: [78,110], align: 'start',
        strokes: [
          ["ink", "M154 42H80V110M164 42H250V110"],
          ["shade", "M77 110a3 3 0 1 0 6 0a3 3 0 1 0 -6 0M247 110a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"],
          ["lead", "M60 100L77 108"],
        ],
      },
      {
        cue: 'part-1-1', label: "Path 1", at: [104,100], tip: [110,110], align: 'middle',
        strokes: [
          ["ink", "M80 110H250"],
        ],
        flows: [
          ["red", "M90 110H240"],
        ],
      },
      {
        cue: 'part-1-2', label: "Path 2", at: [104,180], tip: [110,190], align: 'middle',
        strokes: [
          ["ink", "M80 110V190H250V110"],
        ],
        flows: [
          ["red", "M90 190H240"],
        ],
      },
      {
        cue: 'part-5-0', label: "R₁", at: [165,99], tip: [165,103], align: 'middle',
        strokes: [
          ["paper", "M145 103h40v14h-40Z"],
        ],
      },
      {
        cue: 'part-5-1', label: "R₂", at: [165,179], tip: [165,183], align: 'middle',
        strokes: [
          ["paper", "M145 183h40v14h-40Z"],
        ],
      },
    ],
  },
  {
    scenes: [6, 8, 9, 10],
    outline: [],
    parts: [
      {
        cue: 'part-1-5', label: "Cell", at: [160,16], tip: [159,30], align: 'middle',
        strokes: [
          ["ink", "M154 30v24"],
          ["ink", "M164 36v12"],
          ["ink", "M150 26h-6m3-3v6"],
        ],
      },
      {
        cue: 'part-2-1', label: "Current", at: [8,124], tip: [80,124], align: 'start',
        strokes: [
          ["ink", "M204 42H250V196H80V42H154"],
          ["lead", "M58 122L78 124"],
        ],
        flows: [
          ["red", "M150 42H86V190"],
        ],
      },
      {
        cue: 'part-6-0', label: "Internal r", at: [312,18], tip: [214,30], align: 'end',
        strokes: [
          ["ink", "M164 42H180"],
          ["paper", "M180 36h24v12h-24Z"],
          ["zoom", "M140 22h74v40h-74Z"],
          ["lead", "M262 22L215 30"],
        ],
      },
      {
        cue: 'part-6-2', label: "Load R", at: [165,180], tip: [165,189], align: 'middle',
        strokes: [
          ["paper", "M145 189h40v14h-40Z"],
        ],
      },
      {
        cue: 'part-6-1', label: "Terminal|voltage", at: [312,100], tip: [192,92], align: 'end',
        strokes: [
          ["ink", "M130 42V90H168M192 90H230V42"],
          ["paper", "M168 90a12 12 0 1 0 24 0a12 12 0 1 0 -24 0"],
          ["ink", "M175 84l5 12 5-12"],
          ["lead", "M262 98L193 92"],
        ],
      },
    ],
  },
])
