import { processDrawing } from '../ProcessBoard'

export default processDrawing({
  "label": "Excretion, water balance and skin glands",
  "rows": [
    {
      "parts": [
        {
          "label": "Contractile|vacuole",
          "shape": "M-26 -4Q-15 -22 9 -16Q27 -14 28 0Q11 19 -16 16Q-31 8 -26 -4ZM6 -2a9 9 0 1 0 18 0a9 9 0 1 0 -18 0Z",
          "motion": "M17 -1L31 -4"
        },
        {
          "label": "Malpighian|tubules",
          "shape": "M-27 12h55v9h-55ZM-20 12Q-17 -16 -5 -15Q3 -14 -5 -5L-11 12M10 12Q9 -13 25 -18",
          "motion": "M-13 1L-14 15"
        }
      ]
    },
    {
      "parts": [
        {
          "label": "Sweat gland",
          "shape": "M-27 -16H27M5 -17V5Q-13 -2 -14 9Q-16 21 3 20Q16 18 6 10Q-5 4 -6 13",
          "motion": "M5 9V-21"
        },
        {
          "label": "Sebaceous gland",
          "shape": "M-26 -15H26M1 -22L-5 22M-1 -10Q-19 -13 -19 1Q-17 14 -4 8M1 -5Q12 -9 16 -1Q15 8 -2 6",
          "motion": "M-12 4L0 -8"
        }
      ]
    },
    {
      "parts": [
        {
          "label": "Plant tannins",
          "shape": "M-25 17Q-16 -17 23 -20Q24 14 -25 17ZM-26 22L17 -13M-12 12l-1 -13m8 7l13 1"
        }
      ]
    }
  ]
})
