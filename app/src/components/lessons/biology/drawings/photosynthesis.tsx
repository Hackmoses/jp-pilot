import { processDrawing } from '../ProcessBoard'

export default processDrawing({
  "label": "Where and how photosynthesis happens",
  "rows": [
    {
      "parts": [
        {
          "label": "Green leaf",
          "shape": "M-25 19Q-19 -18 25 -21Q26 17 -25 14ZM-28 24L18 -13M-13 11l-4 -13m9 8l13 6",
          "motion": "M-27 -16L-12 -7"
        },
        {
          "label": "Light pigments",
          "shape": "M-24 -15H24v32H-24ZM-12 -8h8m-8 6h8m-8 6h8m8 -12h8m-8 6h8m-8 6h8",
          "motion": "M5 -24L5 -12"
        }
      ]
    },
    {
      "parts": [
        {
          "label": "Carbon fixation",
          "shape": "M-12 -6a6 6 0 1 0 0 12a6 6 0 1 0 0 -12ZM0 -7a7 7 0 1 0 0 14a7 7 0 1 0 0 -14ZM13 -6a6 6 0 1 0 0 12a6 6 0 1 0 0 -12Z"
        },
        {
          "label": "Sugar building",
          "shape": "M0 -19L18 -9V10L0 20L-18 10V-9ZM-18 -9L0 1L18 -9"
        }
      ],
      "links": [
        1
      ]
    },
    {
      "parts": [
        {
          "label": "Hot-water rinse",
          "shape": "M-23 -15L-15 19H15L23 -15M-20 0H20M-10 10Q-4 -6 10 5Q8 13 -10 10Z"
        },
        {
          "label": "Iodine test",
          "shape": "M-22 17Q-21 -12 22 -12Q21 20 -22 17ZM-3 3q6 -9 13 -4q6 6 -1 13q-10 3 -12 -9Z"
        }
      ],
      "links": [
        1
      ]
    }
  ]
})
