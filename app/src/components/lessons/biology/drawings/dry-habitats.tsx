import { processDrawing } from '../ProcessBoard'

export default processDrawing({
  "label": "Surviving dry conditions",
  "rows": [
    {
      "parts": [
        {
          "label": "Sahel savanna",
          "shape": "M-26 17H28M-9 17q0 -13 -13 -22m13 20Q-4 -4 4 -9m13 22q1 -14 11 -19M-16 -15l12 -5"
        },
        {
          "label": "Xerophyte",
          "shape": "M-7 21V-18Q1 -24 8 -18V5Q23 4 22 -8H29Q33 14 8 14V21ZM-6 -8l-10 -5m10 14l-9 1m17 -3l8 -5",
          "motion": "M-8 -17L-25 -23"
        }
      ]
    },
    {
      "parts": [
        {
          "label": "Aestivation",
          "shape": "M-26 10q5 -4 11 0t12 0t12 0t15 0M-27 20h55M-25 -7Q-9 -18 7 -7L23 -11L19 1L7 0Q-9 6 -25 -7ZM-18 -8h1",
          "motion": "M17 0Q26 3 18 17"
        },
        {
          "label": "Diurnal activity",
          "shape": "M-9 -13a9 9 0 1 0 18 0a9 9 0 1 0 -18 0ZM-25 18Q0 0 25 18H-25ZM-18 -16h-5m42 0h5M0 -23v-4"
        }
      ]
    },
    {
      "parts": [
        {
          "label": "Hygrometer",
          "shape": "M-20 17V-6a20 20 0 0 1 40 0v23ZM-15 -5l3 2m12 -15v5m14 3l-3 4M0 2L10 -9"
        }
      ]
    }
  ]
})
