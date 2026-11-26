import { processDrawing } from '../ProcessBoard'

export default processDrawing({
  "label": "Plant and microbial cells",
  "rows": [
    {
      "parts": [
        {
          "label": "Cellulose|cell wall",
          "shape": "M-24 -20H24V20H-24ZM-18 -15H18V15H-18Z"
        },
        {
          "label": "Cytoplasm",
          "shape": "M-25 0a25 18 0 1 0 50 0a25 18 0 1 0 -50 0ZM-16 1a6 5 0 1 0 12 0a6 5 0 1 0 -12 0ZM8 -8h8m-6 15h6"
        }
      ]
    },
    {
      "parts": [
        {
          "label": "Mitochondrion",
          "shape": "M-24 1C-23 -19 18 -20 25 -3C29 17 -20 23 -24 1ZM-16 -2q5 -11 9 2t9 0t8 -1t8 0"
        },
        {
          "label": "Chloroplast",
          "shape": "M-23 2a23 16 0 1 0 46 0a23 16 0 1 0 -46 0ZM-12 -5h8m-8 4h8m-8 4h8m9 -8h8m-8 4h8m-8 4h8",
          "motion": "M-29 -23L-13 -12"
        }
      ]
    },
    {
      "parts": [
        {
          "label": "Nucleoid",
          "shape": "M-27 0a14 14 0 0 1 14 -14h26a14 14 0 0 1 0 28h-26a14 14 0 0 1 -14 -14ZM-13 -3q9 -11 13 0t13 0q-4 9 -13 0t-13 0"
        },
        {
          "label": "Spirogyra",
          "shape": "M-25 -14H24V14H-25ZM-9 -14V14M8 -14V14M-23 8l13 -16m3 16L6 -8m4 16l12 -16",
          "motion": "M16 -21H29"
        }
      ]
    }
  ]
})
