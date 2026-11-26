import { processDrawing } from '../ProcessBoard'

export default processDrawing({
  "label": "Cells, tissues and living organisms",
  "rows": [
    {
      "parts": [
        {
          "label": "Cell",
          "shape": "M-22 0a22 16 0 1 0 44 0a22 16 0 1 0 -44 0ZM-6 1a6 6 0 1 0 12 0a6 6 0 1 0 -12 0"
        },
        {
          "label": "Tissue",
          "shape": "M-23 -15H23V15H-23ZM-8 -15V15M8 -15V15M-23 0H23"
        },
        {
          "label": "Organ",
          "shape": "M-24 13Q-15 -24 23 -15Q24 19 -24 13ZM-25 19L17 -10M-9 8l-3 -12M5 0l14 3"
        },
        {
          "label": "Organ|system",
          "shape": "M0 -24V24M0 -7q-20 4 -22 -11q16 -4 22 11M0 4q17 2 23 -11q-15 -3 -23 11"
        }
      ],
      "links": [
        1,
        1,
        1
      ]
    },
    {
      "parts": [
        {
          "label": "Bulb cross-section",
          "shape": "M-22 11Q-30 -4 0 -21Q30 -4 22 11Q0 24 -22 11ZM-15 9Q-15 -4 0 -15Q15 -4 15 9Q0 18 -15 9ZM-6 8Q-8 2 0 -8Q8 2 6 8ZM-8 15l-6 12m14 -9v10m7 -12l8 11"
        }
      ]
    },
    {
      "parts": [
        {
          "label": "Irritability",
          "shape": "M-13 21Q-16 -7 10 -17M4 -15q2 -19 23 -15q-2 14 -23 15M-18 21H24",
          "motion": "M-14 9Q-11 -8 6 -13"
        }
      ]
    }
  ]
})
