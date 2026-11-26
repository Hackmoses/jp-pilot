import { processDrawing } from '../ProcessBoard'

export default processDrawing({
  "label": "How biologists classify animals",
  "rows": [
    {
      "parts": [
        {
          "label": "Genus",
          "shape": "M-22 17V-1H21V17M0 -1V-19M-22 18a3 3 0 1 0 0 5a3 3 0 1 0 0 -5M21 18a3 3 0 1 0 0 5a3 3 0 1 0 0 -5"
        },
        {
          "label": "Species",
          "shape": "M-24 8q10 -17 20 -11q-3 10 -12 11ZM4 7q6 -15 21 -14q-3 13 -12 15Z"
        }
      ],
      "links": [
        1
      ]
    },
    {
      "parts": [
        {
          "label": "Radial symmetry",
          "shape": "M0 -20a20 20 0 1 0 0 40a20 20 0 1 0 0 -40ZM-22 0H22M0 -22V22M-15 -15L15 15M-15 15L15 -15"
        },
        {
          "label": "Mammary glands",
          "shape": "M-26 5Q-8 -15 13 -6L24 -14L25 -2L31 0L24 4L14 6Q-4 20 -26 5ZM-8 10q7 4 16 0"
        }
      ]
    },
    {
      "parts": [
        {
          "label": "Reptile scales",
          "shape": "M-24 -16q8 12 16 0q8 12 16 0q8 12 16 0M-24 -4q8 12 16 0q8 12 16 0q8 12 16 0M-24 8q8 12 16 0q8 12 16 0q8 12 16 0"
        },
        {
          "label": "Scales on|bird feet",
          "shape": "M-9 -20l4 19l-16 14m16 -14L3 17M-5 -1l24 10M-6 -13l7 -1m-6 6l7 -1m-5 5l7 -1"
        }
      ]
    }
  ]
})
