import { processDrawing } from '../ProcessBoard'

export default processDrawing({
  "label": "Populations, sampling and dispersal",
  "rows": [
    {
      "parts": [
        {
          "label": "Population dynamics",
          "shape": "M-26 21V-19M-26 21H29M-23 15L-13 10L-6 13L4 2L11 5L26 -15",
          "motion": "M-22 15L-13 10L-6 13L4 2L11 5L26 -15"
        },
        {
          "label": "Density dependence",
          "shape": "M-25 -17H25V19H-25ZM-15 -9h1m11 0h1m12 0h1m-25 9h1m11 0h1m10 0h1m-23 9h1m11 0h1m10 0h1"
        }
      ]
    },
    {
      "parts": [
        {
          "label": "Quadrat",
          "shape": "M-22 -20H22V20H-22ZM-7 -20V20M8 -20V20M-22 -6H22M-22 7H22M-16 -14h1m17 14h1m16 -13h1m-16 26h1m-14 -2h1"
        }
      ]
    },
    {
      "parts": [
        {
          "label": "Winged termite",
          "shape": "M-20 23Q-12 8 -10 0Q-5 -7 1 -7Q9 -12 16 -22Q21 -14 9 -5Q13 -6 25 -13Q30 -3 4 3M-9 0q-5 -14 7 -20q5 3 3 12"
        },
        {
          "label": "Predator|satiation",
          "shape": "M-21 -19h2m9 4h2m10 -1h2m10 5h2m-23 14h2m12 -6h2m12 9h2m-38 13h2m9 -6h2M17 12L29 1L24 16Z",
          "motion": "M-8 -18L16 -24"
        }
      ]
    }
  ]
})
