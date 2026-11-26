import { processDrawing } from '../ProcessBoard'

export default processDrawing({
  "label": "Cellular respiration and fermentation",
  "rows": [
    {
      "parts": [
        {
          "label": "Catabolism",
          "shape": "M-23 -8l6 -5l6 5l-6 5ZM-11 -8l6 -5l6 5l-6 5ZM1 -8l6 -5l6 5l-6 5ZM-15 15l5 -4l5 4l-5 4ZM6 13l5 -4l5 4l-5 4Z",
          "motion": "M-1 -1L-1 12"
        },
        {
          "label": "ATP",
          "shape": "M-23 -8L-8 -17L0 -4L-10 8ZM0 -4L6 0M7 0a5 5 0 1 0 10 0a5 5 0 1 0 -10 0ZM18 0h4m1 0a5 5 0 1 0 10 0a5 5 0 1 0 -10 0Z"
        }
      ],
      "links": [
        1
      ]
    },
    {
      "parts": [
        {
          "label": "Mitochondrial|matrix",
          "shape": "M-29 1C-29 -20 22 -23 26 -3C31 19 -20 23 -29 1ZM-18 -4q4 -8 8 0t8 0t8 0t8 0M-8 9a6 4 0 1 0 12 0a6 4 0 1 0 -12 0Z",
          "motion": "M-6 10Q-10 2 0 4T6 11"
        }
      ]
    },
    {
      "parts": [
        {
          "label": "Yeast fermentation",
          "shape": "M-23 -2a17 14 0 1 0 34 0a17 14 0 1 0 -34 0ZM9 -5a9 9 0 1 0 18 0a9 9 0 1 0 -18 0Z"
        },
        {
          "label": "Ethanol and CO₂",
          "shape": "M-18 20Q-28 12 -16 -4Q-4 12 -14 20ZM3 10a4 4 0 1 0 8 0a4 4 0 1 0 -8 0ZM10 -7a5 5 0 1 0 10 0a5 5 0 1 0 -10 0Z"
        }
      ],
      "links": [
        1
      ]
    }
  ]
})
