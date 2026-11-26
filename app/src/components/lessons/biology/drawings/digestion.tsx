import { processDrawing } from '../ProcessBoard'

export default processDrawing({
  "label": "Digestion and digestive enzymes",
  "rows": [
    {
      "parts": [
        {
          "label": "Mouth",
          "shape": "M-23 -8Q-16 -17 -7 -11L17 -8L24 -6L11 4L23 9Q6 19 -16 14ZM-15 3l19 6"
        },
        {
          "label": "Stomach",
          "shape": "M-14 -24V-7Q-10 1 -3 -9Q4 -22 17 -14Q30 -5 15 10Q5 20 -12 12Q-21 9 -24 16M-12 4q5 6 11 0"
        }
      ],
      "links": [
        1
      ]
    },
    {
      "parts": [
        {
          "label": "Pancreas",
          "shape": "M-27 0q11 -12 25 -9q16 -7 29 4q-3 12 -19 10ZM-20 0L21 -3"
        },
        {
          "label": "Small intestine",
          "shape": "M-26 -17H21Q29 -17 25 -9H-15Q-24 -9 -20 -1H18Q27 -1 22 7H-16Q-23 7 -20 16H24"
        }
      ],
      "links": [
        1
      ]
    },
    {
      "parts": [
        {
          "label": "Fungal hyphae",
          "shape": "M-25 15L-11 -3L4 -1L24 -15M-11 -3l-1 -13m6 15l-1 16m10 -24l12 8",
          "motion": "M11 -7L23 1"
        },
        {
          "label": "Carnivorous|plant trap",
          "shape": "M0 24V14M0 14Q-23 12 -25 -13Q-13 -4 0 0Q13 -4 25 -13Q23 12 0 14ZM-22 -9l10 -1m24 0l10 1"
        }
      ]
    }
  ]
})
