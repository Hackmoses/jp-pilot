import { processDrawing } from '../ProcessBoard'

export default processDrawing({
  "label": "Insect growth and feeding",
  "rows": [
    {
      "parts": [
        {
          "label": "Egg",
          "shape": "M-12 0a12 17 0 1 0 24 0a12 17 0 1 0 -24 0Z"
        },
        {
          "label": "Larva",
          "shape": "M-25 6q0 -17 10 -11q5 -14 12 -5q8 -12 14 -2q13 -7 15 10q-4 17 -51 8Z"
        },
        {
          "label": "Pupa",
          "shape": "M-9 -19Q-20 -9 -11 9Q0 29 11 9Q20 -9 9 -19ZM-12 -4L12 -4M-10 5H10"
        },
        {
          "label": "Adult",
          "shape": "M-5 11V-11q5 -10 10 0v22ZM-4 0Q-28 -29 -25 -5Q-21 7 -4 0ZM5 0Q28 -29 25 -5Q21 7 5 0Z"
        }
      ],
      "links": [
        1,
        1,
        1
      ]
    },
    {
      "parts": [
        {
          "label": "Ecdysis",
          "shape": "M-24 -13Q-4 -22 18 -12L14 7Q-4 17 -24 6ZM-14 -6Q-1 -12 10 -6L8 9Q-2 18 -14 10Z",
          "motion": "M4 6L26 16"
        }
      ]
    },
    {
      "parts": [
        {
          "label": "Chewing mandibles",
          "shape": "M-22 -16L-4 -2L-17 18L-24 6ZM22 -16L4 -2L17 18L24 6Z"
        },
        {
          "label": "Piercing|mouthparts",
          "shape": "M-24 -7Q-9 -20 1 -9Q10 3 -5 8ZM0 1L24 14M2 -2L25 11M-5 9L21 16M19 18H29",
          "motion": "M27 13L7 4"
        }
      ]
    }
  ]
})
