import { processDrawing } from '../../biology/AnatomyBoard'

// Electrolytic cell for the Chemistry key concept lesson chem-electrolysis. Checked against
// OpenStax Chemistry 2e 17.7 (Electrolysis, Figure 17.19): the anode is joined
// to the positive terminal and is where oxidation happens; the cathode is joined to the negative
// terminal and is where reduction happens. Electrolysis of dilute acid gives hydrogen at the
// cathode and oxygen at the anode, two volumes to one. Parts are numbered by the step that
// introduces them (part-<n>-x).
export default processDrawing("Electrolytic cell", [
  {
    outline: [
      ["ink", "M88 92L92 236Q160 244 228 236L232 92"],
    ],
    parts: [
      {
        cue: 'part-1-0', label: "Electrolyte|(ions in solution)", at: [160,254], tip: [160,234], align: 'middle',
        strokes: [
          ["blue", "M90 124L93 232Q160 240 227 232L230 124Z"],
        ],
      },
      {
        cue: 'part-1-1', label: "Battery", at: [160,14], tip: [160,34], align: 'middle',
        strokes: [
          ["ink", "M116 96V34H152m16 0H204V96"],
          ["ink", "M154 20v28"],
          ["ink", "M166 27v14"],
        ],
      },
      {
        cue: 'part-2-0', label: "Cathode (−)", at: [312,216], tip: [210,190], align: 'end',
        strokes: [
          ["shade", "M198 96h12v104h-12Z"],
          ["lead", "M262 208L212 191"],
        ],
      },
      {
        cue: 'part-2-1', label: "Anode (+)", at: [8,216], tip: [110,190], align: 'start',
        strokes: [
          ["shade", "M110 96h12v104h-12Z"],
          ["lead", "M58 208L108 191"],
        ],
      },
      {
        cue: 'part-2-2', label: "+ ions", at: [162,216], tip: [190,192], align: 'middle',
        flows: [
          ["red", "M134 196Q164 190 192 192"],
        ],
      },
      {
        cue: 'part-2-3', label: "− ions", at: [158,144], tip: [128,156], align: 'middle',
        flows: [
          ["blue", "M188 156Q158 150 128 156"],
        ],
      },
      {
        cue: 'part-2-4', label: "Electrons", at: [312,60], tip: [204,64], align: 'end',
        strokes: [
          ["lead", "M262 60L206 64"],
        ],
        flows: [
          ["amber", "M116 92V34H150"],
          ["amber", "M170 34H204V92"],
        ],
      },
      {
        cue: 'part-4-0', label: "Hydrogen", at: [312,120], tip: [222,132], align: 'end',
        strokes: [
          ["ink", "M214.8 134a3.2 3.2 0 1 0 6.4 0a3.2 3.2 0 1 0 -6.4 0M216.8 150a3.2 3.2 0 1 0 6.4 0a3.2 3.2 0 1 0 -6.4 0M213.8 166a3.2 3.2 0 1 0 6.4 0a3.2 3.2 0 1 0 -6.4 0M217.8 182a3.2 3.2 0 1 0 6.4 0a3.2 3.2 0 1 0 -6.4 0"],
          ["lead", "M266 122L225 130"],
        ],
      },
      {
        cue: 'part-4-1', label: "Oxygen", at: [8,120], tip: [100,138], align: 'start',
        strokes: [
          ["ink", "M98.8 140a3.2 3.2 0 1 0 6.4 0a3.2 3.2 0 1 0 -6.4 0M97.8 160a3.2 3.2 0 1 0 6.4 0a3.2 3.2 0 1 0 -6.4 0"],
          ["lead", "M54 122L97 136"],
        ],
      },
    ],
  },
])
