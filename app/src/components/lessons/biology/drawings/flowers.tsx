import { processDrawing } from '../ProcessBoard'

export default processDrawing({
  "label": "Pollination and fertilisation in flowers",
  "rows": [
    {
      "parts": [
        {
          "label": "Stamen and anther",
          "shape": "M0 24V-6M-12 -6V-18H12V-6ZM-5 -12h1m5 -3h1m5 4h1"
        },
        {
          "label": "Stigma",
          "shape": "M-16 -8Q-15 -18 0 -14Q13 -20 16 -8Q0 -3 -16 -8ZM-3 -7V24h6V-7"
        }
      ],
      "links": [
        1
      ]
    },
    {
      "parts": [
        {
          "label": "Wind pollination",
          "shape": "M-27 -12H-9m-19 8h24m-15 9H3M13 21V-15m0 10l10 -11M13 4L4 -3m9 13l13 -9m-13 -5L5 -16",
          "motion": "M-30 -9H11"
        },
        {
          "label": "Pollen tube",
          "shape": "M-13 -19Q0 -25 13 -19M-4 -19V1Q-25 26 0 23Q25 26 4 1V-19M0 2q10 9 5 14",
          "motion": "M0 -18Q-1 6 6 16"
        }
      ]
    },
    {
      "parts": [
        {
          "label": "Ovule and seed",
          "shape": "M-22 -5Q-22 -20 0 -22Q25 -18 23 4Q15 23 -7 23Q-25 19 -22 -5ZM-9 13Q-9 4 7 -3Q13 10 1 16Z"
        },
        {
          "label": "Double|fertilisation",
          "shape": "M-16 -10a9 9 0 1 0 18 0a9 9 0 1 0 -18 0ZM8 12a11 8 0 1 0 22 0a11 8 0 1 0 -22 0ZM14 12h2m5 0h2"
        }
      ]
    }
  ]
})
