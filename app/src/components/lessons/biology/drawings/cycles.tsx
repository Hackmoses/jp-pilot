import { processDrawing } from '../ProcessBoard'

export default processDrawing({
  "label": "Water and nutrient cycling in soil",
  "rows": [
    {
      "parts": [
        {
          "label": "Evaporation",
          "shape": "M-26 19q8 -5 16 0t16 0t16 0M-26 10q8 -5 16 0t16 0t16 0M9 -14a7 7 0 1 0 14 0a7 7 0 1 0 -14 0Z",
          "motion": "M-12 12V-18"
        },
        {
          "label": "Condensation",
          "shape": "M-26 -5Q-24 -17 -12 -16Q-4 -27 8 -16Q23 -17 28 -4Q26 4 -22 4ZM-15 13l-3 7m17 -7l-3 7m15 -7l-3 7"
        }
      ],
      "links": [
        1
      ]
    },
    {
      "parts": [
        {
          "label": "Nitrogen fixation",
          "shape": "M-20 -11H8M-7 -10Q-3 3 8 16m-12 -4l-10 7m9 -8l10 -1M1 5a3 3 0 1 0 6 0a3 3 0 1 0 -6 0Z"
        },
        {
          "label": "Nitrification",
          "shape": "M-21 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0ZM2 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0ZM12 13h10"
        }
      ],
      "links": [
        1
      ]
    },
    {
      "parts": [
        {
          "label": "Sand and clay",
          "shape": "M-28 -13H28V18H-28ZM0 -13V18M-21 -2a4 4 0 1 0 8 0a4 4 0 1 0 -8 0ZM-10 8a4 4 0 1 0 8 0a4 4 0 1 0 -8 0ZM7 -6h16M7 -2h16M8 2h16M6 7h16M7 12h16",
          "motion": "M-17 -12V22"
        },
        {
          "label": "Rotation and|fallow",
          "shape": "M-26 18H27M-21 18V-8m0 8l-7 -9m7 8l7 -9M-5 18V-4m0 7l8 -7M13 18Q16 4 25 9m-10 8l-4 -4"
        }
      ]
    }
  ]
})
