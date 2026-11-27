import { processDrawing } from '../AnatomyBoard'

export default processDrawing("Teeth and diet", [
  {
    outline: [
      ["paper", "M38 104H262V122H38ZM38 194H262V212H38Z"],
    ],
    parts: [
      {
        cue: 'part-2-0', label: "Herbivore: diastema|(no canines)", at: [16,32], tip: [110,94], align: 'start',
        strokes: [
          ["paper", "M44 78L56 78L54 104L42 104ZM60 80L72 80L70 104L58 104Z"],
          ["zoom", "M76 94H142"],
        ],
      },
      {
        cue: 'part-2-1', label: "Grinding|molars", at: [304,32], tip: [194,90], align: 'end',
        strokes: [
          ["green", "M148 80H182V104H148ZM188 80H226V104H188Z"],
          ["ink", "M148 80L158 84L168 80L182 84M188 80L200 84L214 80L226 84"],
        ],
        flows: [
          ["green", "M154 72H220"],
        ],
      },
      {
        cue: 'part-2-2', label: "Carnivore:|large canines", at: [16,246], tip: [80,174], align: 'start',
        strokes: [
          ["red", "M72 194L80 156L90 194Z"],
          ["paper", "M44 176L54 176L52 194L42 194ZM58 176L68 176L66 194L56 194Z"],
        ],
      },
      {
        cue: 'part-2-3', label: "Carnassial|shearing teeth", at: [304,246], tip: [184,178], align: 'end',
        strokes: [
          ["amber", "M146 194L158 164L172 184L186 160L204 194Z"],
        ],
        flows: [
          ["red", "M176 150V182"],
        ],
      },
    ],
  },
  {
    scenes: [0],
    outline: [
      ["paper", "M32 162H286Q284 206 238 206H62Q36 206 32 162Z"],
    ],
    parts: [
      {
        cue: 'part-0-0', label: "Incisors|(cut)", at: [18,46], tip: [56,142], align: 'start',
        strokes: [
          ["blue", "M44 128L56 128L54 162L42 162ZM62 128L74 128L72 162L60 162Z"],
        ],
        flows: [
          ["blue", "M58 100V126"],
        ],
      },
      {
        cue: 'part-0-1', label: "Canine|(tear)", at: [148,46], tip: [110,136], align: 'middle',
        strokes: [
          ["red", "M100 162L110 116L120 162Z"],
        ],
        flows: [
          ["red", "M110 92V114"],
        ],
      },
      {
        cue: 'part-0-2', label: "Premolars &|molars (grind)", at: [304,46], tip: [212,142], align: 'end',
        strokes: [
          ["green", "M146 130H184V162H146ZM192 130H234V162H192ZM242 130H278V162H242Z"],
          ["ink", "M146 130L164 138L184 130M192 130L212 138L234 130M242 130L260 138L278 130"],
        ],
        flows: [
          ["green", "M176 118H248"],
        ],
      },
    ],
  },
  {
    scenes: [1],
    outline: [
      ["ink", "M128 54V208M140 130H290"],
      ["paper", "M36 92Q80 56 124 88M36 168Q80 204 124 172"],
    ],
    parts: [
      {
        cue: 'part-1-0', label: "Upper half:|I 2  C 0  PM 3  M 3", at: [215,96], tip: [215,112], align: 'middle',
        strokes: [
          ["green", "M146 106H284V124H146Z"],
        ],
      },
      {
        cue: 'part-1-1', label: "Lower half:|I 1  C 0  PM 2  M 3", at: [215,164], tip: [215,148], align: 'middle',
        strokes: [
          ["blue", "M146 136H284V154H146Z"],
        ],
      },
      {
        cue: 'part-1-2', label: "One side × 2|= full jaw", at: [18,240], tip: [84,130], align: 'start',
        strokes: [
          ["zoom", "M32 62H128V200H32Z"],
        ],
        flows: [
          ["blue", "M80 100V162"],
        ],
      },
    ],
  },
])
