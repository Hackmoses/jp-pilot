import { processDrawing } from '../ProcessBoard'

export default processDrawing({
  "label": "Osmosis in plants and animals",
  "rows": [
    {
      "parts": [
        {
          "label": "Water potential",
          "shape": "M-22 -16H22V16H-22ZM-4 -16V16M5 -9h3m3 5h3m-2 7h4m-8 6h4M-16 6l1 0",
          "motion": "M-27 0H21"
        },
        {
          "label": "Diffusion",
          "shape": "M-24 -14h48M-24 14h48M-21 -8l1 0m5 7h1m-3 7h1m5 -15h1m3 8h1m18 -6h1",
          "motion": "M-15 5H24"
        }
      ]
    },
    {
      "parts": [
        {
          "label": "Plasmolysis",
          "shape": "M-23 -19H23V19H-23ZM-11 -11Q8 -15 14 -4L12 10Q-3 12 -12 7Z",
          "motion": "M11 -5L30 -11"
        },
        {
          "label": "Haemolysis",
          "shape": "M-23 5C-26 -14 -2 -18 8 -13L4 -3L17 -13Q29 -4 22 9Q0 22 -23 5Z",
          "motion": "M-32 5L-12 0"
        }
      ]
    },
    {
      "parts": [
        {
          "label": "Root hair",
          "shape": "M-22 -16V17H10V3Q23 3 29 1Q29 -8 10 -7V-16Z",
          "motion": "M29 -2H3"
        }
      ]
    }
  ]
})
