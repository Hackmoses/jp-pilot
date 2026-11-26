import { processDrawing } from '../ProcessBoard'

export default processDrawing({
  "label": "Spores, seeds and plant life cycles",
  "rows": [
    {
      "parts": [
        {
          "label": "Moss gametophyte",
          "shape": "M0 22V-11L-12 -21L0 -11L12 -21M0 4l-16 -10M0 12l16 -12M0 20l-14 -2m14 0l13 0"
        },
        {
          "label": "Fern sporophyte",
          "shape": "M-17 22Q6 5 18 -23M-10 15Q-24 9 -26 2Q-11 0 -5 9M0 2Q-17 -5 -15 -14Q0 -13 7 -7M8 -14q15 6 20 -5q-7 -5 -15 -1"
        }
      ]
    },
    {
      "parts": [
        {
          "label": "Fern prothallus",
          "shape": "M0 22Q-25 4 -26 -10Q-21 -24 0 -12Q21 -24 26 -10Q25 5 0 22Z"
        },
        {
          "label": "Swimming sperm",
          "shape": "M-22 2q8 -7 15 0m-14 0q6 7 14 0m13 -3a9 9 0 1 0 18 0a9 9 0 1 0 -18 0Z",
          "motion": "M-25 5H13"
        }
      ]
    },
    {
      "parts": [
        {
          "label": "Maize endosperm",
          "shape": "M-19 11Q-25 -10 -6 -19Q16 -24 20 -4Q24 13 4 21Q-11 24 -19 11ZM-5 15Q-10 3 -1 -2Q7 2 2 16Z"
        },
        {
          "label": "Bean pod",
          "shape": "M-29 8Q-10 -22 29 -6Q20 16 -29 8ZM-18 3h1m8 -4h1m9 -2h1m10 -2h1m9 1h1"
        }
      ]
    }
  ]
})
