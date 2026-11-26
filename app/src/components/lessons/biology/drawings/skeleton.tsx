import { processDrawing } from '../ProcessBoard'

export default processDrawing({
  "label": "The mammalian skeleton and joints",
  "rows": [
    {
      "parts": [
        {
          "label": "Skeleton",
          "shape": "M0 -23a10 10 0 1 0 0 20a10 10 0 1 0 0 -20ZM0 -3V16M-16 4Q0 0 16 4M-14 10Q0 17 14 10M-8 17l-8 12m24 -12l8 12"
        },
        {
          "label": "Skull suture",
          "shape": "M-23 11V-4Q-20 -20 0 -20Q20 -20 23 -4V11ZM-4 -20l6 6l-5 5l6 6l-5 5l6 8"
        }
      ]
    },
    {
      "parts": [
        {
          "label": "Pubic symphysis",
          "shape": "M-23 -13Q-9 -19 -4 -4L-9 4L-4 10V17Q-24 11 -23 -13ZM23 -13Q9 -19 4 -4L9 4L4 10V17Q24 11 23 -13ZM-4 13H4"
        },
        {
          "label": "Femur",
          "shape": "M-10 -20Q-22 -20 -17 -10L-7 -4L6 16Q2 28 15 24Q29 24 19 14L4 -10Q4 -22 -10 -20Z"
        }
      ]
    },
    {
      "parts": [
        {
          "label": "Skeletal muscle",
          "shape": "M-24 -9Q-3 -24 19 -8L28 -4L16 -2Q-3 15 -22 3L-28 2ZM11 -1L4 15L22 24M4 15L-19 24",
          "motion": "M17 -13H1"
        }
      ]
    }
  ]
})
