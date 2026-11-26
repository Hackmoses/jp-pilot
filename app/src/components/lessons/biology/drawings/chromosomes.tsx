import { processDrawing } from '../ProcessBoard'

export default processDrawing({
  "label": "DNA, chromosomes and X-linked inheritance",
  "rows": [
    {
      "parts": [
        {
          "label": "DNA base pairs",
          "shape": "M-18 -23Q-10 -15 0 -9Q20 0 19 22M18 -23Q10 -15 0 -9Q-20 0 -19 22M-13 -18H13M-8 -13H8M-9 1H9M-16 10H16M-18 17H18"
        }
      ]
    },
    {
      "parts": [
        {
          "label": "X and Y|chromosomes",
          "shape": "M-20 -19L-4 20M-4 -19L-20 20M5 -18L14 -2L23 -18M14 -2V18"
        },
        {
          "label": "X-linked|recessive",
          "shape": "M-24 -17H24V18H-24ZM0 -17V18M-24 0H24M-19 -12l10 9m0 -9l-10 9M7 -12l5 5l5 -5m-5 5v5"
        }
      ]
    },
    {
      "parts": [
        {
          "label": "Paramecium|conjugation",
          "shape": "M-27 -10Q-14 -24 2 -14Q8 -8 0 2Q-18 15 -27 4ZM0 -2Q18 -15 27 -4Q30 13 19 19Q6 24 -2 11ZM-13 -8a3 3 0 1 0 6 0a3 3 0 1 0 -6 0ZM11 10a3 3 0 1 0 6 0a3 3 0 1 0 -6 0Z",
          "motion": "M-12 -8Q4 -9 15 9"
        }
      ]
    }
  ]
})
