import { processDrawing } from '../ProcessBoard'

export default processDrawing({
  "label": "How birds fly and feed",
  "rows": [
    {
      "parts": [
        {
          "label": "Wing",
          "shape": "M-25 10Q-4 16 5 -4L23 -18Q24 0 13 8L17 10L8 15L-5 17Z",
          "motion": "M4 -19Q18 -11 12 0"
        },
        {
          "label": "Flight quill",
          "shape": "M-23 21L21 -22M-16 15Q-23 -3 19 -22Q24 -3 -16 15ZM-3 1l-2 -10m10 1l5 3"
        }
      ]
    },
    {
      "parts": [
        {
          "label": "Nectar-feeding|bill",
          "shape": "M-23 5Q-28 -9 -12 -14Q1 -14 2 -6Q23 -7 30 -1L1 0Q-10 15 -23 5ZM-10 -6l1 0",
          "motion": "M9 8H29"
        },
        {
          "label": "Seed-cracking|bill",
          "shape": "M-25 8Q-31 -7 -16 -16Q-6 -20 4 -9L25 -2L6 7Q-10 18 -25 8ZM4 0L20 -2M-11 -6h1"
        }
      ]
    },
    {
      "parts": [
        {
          "label": "Raptor talons",
          "shape": "M-4 -18L-2 0L-19 11Q-27 18 -21 24M-2 0L5 12Q2 23 10 25M-2 0L23 12Q20 24 26 24",
          "motion": "M19 7Q24 13 17 20"
        }
      ]
    }
  ]
})
