import { processDrawing } from '../ProcessBoard'

export default processDrawing({
  "label": "Nerves, hormones and control",
  "rows": [
    {
      "parts": [
        {
          "label": "Nerve impulse",
          "shape": "M-26 -13L-15 -5L-24 4M-15 -5Q-4 -16 3 -4Q9 8 -6 11Q-16 13 -15 -5ZM3 1H27M24 1l5 -7m-5 7l6 6",
          "motion": "M6 -7H28"
        },
        {
          "label": "Endocrine hormone",
          "shape": "M-25 -12q11 -10 21 0q11 11 0 17q-14 8 -21 -5ZM-29 13H28M-29 22H28",
          "motion": "M-17 4Q-12 20 11 17"
        }
      ]
    },
    {
      "parts": [
        {
          "label": "Cerebellum",
          "shape": "M-22 9Q-31 -3 -18 -15Q-7 -24 13 -17Q29 -15 29 0Q25 10 9 7M2 7q12 -9 24 1q8 14 -12 14Q4 21 2 7Z"
        },
        {
          "label": "Autonomic nerves",
          "shape": "M-17 -18Q-7 -27 4 -16M-9 -14Q1 -4 8 6M10 7Q15 -7 25 2Q35 13 12 22Q-10 10 0 5Q5 1 10 7Z",
          "motion": "M-16 -18Q-5 -9 10 5"
        }
      ]
    },
    {
      "parts": [
        {
          "label": "Adrenal gland",
          "shape": "M-13 -10Q-25 -6 -24 12Q-16 26 -1 18Q7 10 -2 3Q4 -4 -5 -10ZM-23 -13Q-19 -26 -7 -21L-2 -13Z"
        }
      ]
    }
  ]
})
