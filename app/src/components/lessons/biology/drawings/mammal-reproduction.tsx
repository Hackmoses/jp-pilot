import { processDrawing } from '../ProcessBoard'

export default processDrawing({
  "label": "Gametes, fertilisation and pregnancy",
  "rows": [
    {
      "parts": [
        {
          "label": "Meiosis",
          "shape": "M-24 -10a11 11 0 1 0 22 0a11 11 0 1 0 -22 0ZM3 -13a9 9 0 1 0 18 0a9 9 0 1 0 -18 0ZM3 10a9 9 0 1 0 18 0a9 9 0 1 0 -18 0ZM-18 -13l9 6m-9 0l9 -6"
        },
        {
          "label": "Fertilisation",
          "shape": "M5 -1a14 14 0 1 0 28 0a14 14 0 1 0 -28 0ZM-27 4Q-17 -6 -9 1L-4 2M11 -1h11m-6 -5v10"
        }
      ],
      "links": [
        1
      ]
    },
    {
      "parts": [
        {
          "label": "Epididymis",
          "shape": "M-19 1a16 20 0 1 0 32 0a16 20 0 1 0 -32 0ZM4 -19Q24 -19 22 -9T20 6T16 17Q7 25 0 21"
        },
        {
          "label": "Vas deferens",
          "shape": "M-24 12Q-13 8 -16 -6Q-16 -17 -1 -18Q11 -20 24 -11M-23 17Q-10 11 -12 -5Q-12 -13 -1 -14Q12 -16 23 -7"
        },
        {
          "label": "Urethra",
          "shape": "M-22 -17Q0 -20 15 -5L23 8H-11Q-25 8 -22 -17ZM-15 15H30"
        }
      ],
      "links": [
        1,
        1
      ]
    },
    {
      "parts": [
        {
          "label": "Placenta",
          "shape": "M-26 -17H26V-7H-26ZM-25 16H25M-16 -7q-6 12 0 18q7 -6 7 -16m10 -2q-4 13 2 17q7 -6 7 -16m8 -1q-4 13 2 17",
          "motion": "M-21 -17L-17 9"
        }
      ]
    }
  ]
})
