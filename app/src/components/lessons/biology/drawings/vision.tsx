import { processDrawing } from '../ProcessBoard'

export default processDrawing({
  "label": "The eye, vision and common defects",
  "rows": [
    {
      "parts": [
        {
          "label": "Iris and pupil",
          "shape": "M0 -21a21 21 0 1 0 0 42a21 21 0 1 0 0 -42ZM0 -8a8 8 0 1 0 0 16a8 8 0 1 0 0 -16ZM-14 0h6m16 0h6M0 -14v6m0 16v6"
        },
        {
          "label": "Retinal rods",
          "shape": "M-25 19H25M-15 19V-11Q-10 -21 -6 -11V19M3 19V-11Q8 -21 12 -11V19"
        }
      ]
    },
    {
      "parts": [
        {
          "label": "Long-sightedness",
          "shape": "M-6 -20Q-18 0 -6 20Q10 26 15 0Q10 -26 -6 -20ZM12 -16Q20 0 12 16",
          "motion": "M-28 -14L-9 -14L25 0"
        },
        {
          "label": "Convex lens",
          "shape": "M-21 -23Q-34 0 -21 23Q-10 0 -21 -23ZM-1 -20Q-10 0 -1 20Q16 23 19 0Q16 -23 -1 -20ZM14 -16Q22 0 14 16",
          "motion": "M-33 -13L-21 -13L-3 -8L19 0"
        }
      ]
    },
    {
      "parts": [
        {
          "label": "Cataract",
          "shape": "M0 -21Q-24 0 0 21Q24 0 0 -21ZM-4 -8l8 16m-10 -10l7 14m-3 -20l8 15"
        },
        {
          "label": "Astigmatism",
          "shape": "M-22 0a22 13 0 1 0 44 0a22 13 0 1 0 -44 0ZM-23 0H23M0 -21V21M-23 3Q0 29 23 3"
        }
      ]
    }
  ]
})
