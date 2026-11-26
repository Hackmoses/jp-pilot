import { processDrawing } from '../ProcessBoard'

export default processDrawing({
  "label": "Xylem, phloem and transpiration",
  "rows": [
    {
      "parts": [
        {
          "label": "Xylem",
          "shape": "M-16 -22V22M-6 -22V22M-16 -15l10 -5m-10 15l10 -5m-10 15l10 -5m-10 15l10 -5",
          "motion": "M10 19V-19"
        },
        {
          "label": "Phloem",
          "shape": "M-12 -22V22M4 -22V22M-12 -8H4M-12 8H4M9 -14h10v21H9",
          "motion": "M-21 -20V20"
        }
      ]
    },
    {
      "parts": [
        {
          "label": "Dicot stem bundle",
          "shape": "M0 -22a22 22 0 1 0 0 44a22 22 0 1 0 0 -44ZM-8 -15H8V-8H-8ZM-6 -6H6V0H-6ZM0 3a4 4 0 1 0 0 8a4 4 0 1 0 0 -8"
        },
        {
          "label": "Stomata",
          "shape": "M-25 0Q-16 -20 -4 0Q-12 20 -25 0ZM4 0Q17 -20 25 0Q17 20 4 0Z",
          "motion": "M0 14V-22"
        }
      ]
    },
    {
      "parts": [
        {
          "label": "Vascular cambium",
          "shape": "M0 -22a22 22 0 1 0 0 44a22 22 0 1 0 0 -44ZM0 -14a14 14 0 1 0 0 28a14 14 0 1 0 0 -28Z"
        },
        {
          "label": "Cork cambium",
          "shape": "M0 -23a23 23 0 1 0 0 46a23 23 0 1 0 0 -46ZM0 -18a18 18 0 1 0 0 36a18 18 0 1 0 0 -36Z"
        }
      ]
    }
  ]
})
