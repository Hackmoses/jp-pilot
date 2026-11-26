import { processDrawing } from '../ProcessBoard'

export default processDrawing({
  "label": "Living and moving in water",
  "rows": [
    {
      "parts": [
        {
          "label": "Submerged|shoot",
          "shape": "M-4 20q-2 -13 3 -27t0 -17m-2 17q-12 -8 -21 -3q8 11 20 10m2 -13q9 -16 23 -10q-8 12 -22 15M-30 23q7 -4 14 0t14 0t14 0t14 0"
        }
      ]
    },
    {
      "parts": [
        {
          "label": "Streamlined fish",
          "shape": "M-28 0Q-10 -12 10 -4L26 -14L22 0L26 14L10 4Q-10 12 -28 0ZM-22 1h1",
          "motion": "M-22 -14Q1 -21 24 -15"
        }
      ]
    },
    {
      "parts": [
        {
          "label": "Cutaneous|respiration",
          "shape": "M-28 -10Q-17 -16 -7 -10T14 -10T30 -10M-29 -1H29M-29 10H29"
        },
        {
          "label": "Skin capillary",
          "shape": "M-27 -13h54M-27 6q10 -8 23 0t31 0M-27 15q10 -8 23 0t31 0",
          "motion": "M-10 -21L-10 9"
        }
      ]
    }
  ]
})
