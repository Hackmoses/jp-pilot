import { processDrawing } from '../ProcessBoard'

export default processDrawing({
  "label": "Freshwater, marine and estuary habitats",
  "rows": [
    {
      "parts": [
        {
          "label": "Terrestrial|habitat",
          "shape": "M-28 19H27M-28 19L-13 1L-3 8L12 -16L27 19M7 -7h10"
        },
        {
          "label": "Aquatic habitat",
          "shape": "M-26 -10q7 -5 13 0t13 0t13 0t13 0M-26 6q7 -5 13 0t13 0t13 0t13 0M-26 21q7 -5 13 0t13 0t13 0t13 0"
        }
      ]
    },
    {
      "parts": [
        {
          "label": "Freshwater",
          "shape": "M-28 12q8 -24 18 -12t20 0t18 0M-28 22q8 -24 18 -12t20 0t18 0"
        },
        {
          "label": "Estuary",
          "shape": "M-28 -13q10 0 19 9t35 4M-28 13q10 0 19 -9t35 -4M4 13q6 -4 12 0t12 0M5 -14q6 -4 12 0t12 0"
        },
        {
          "label": "Marine water",
          "shape": "M-27 2Q-3 -18 12 -4L23 -11L21 3L27 10L13 6Q-8 16 -27 2ZM-20 0h1M-25 20q8 -5 16 0t16 0t16 0"
        }
      ],
      "links": [
        1,
        -1
      ]
    },
    {
      "parts": [
        {
          "label": "Tide",
          "shape": "M-27 15V-16M-27 15H28M-24 3Q-16 -13 -6 -2T12 2T28 0"
        },
        {
          "label": "Mangrove roots",
          "shape": "M0 -24V5M-22 -18Q-11 -24 0 -10Q9 -23 25 -17M0 5Q-6 10 -22 20M0 5q7 12 23 17M-27 13q9 -3 17 0t17 0t17 0"
        }
      ]
    }
  ]
})
