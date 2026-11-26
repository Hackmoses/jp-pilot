import { processDrawing } from '../ProcessBoard'

export default processDrawing({
  "label": "Breathing and gas exchange surfaces",
  "rows": [
    {
      "parts": [
        {
          "label": "Trachea",
          "shape": "M-9 -22V18H9V-22M-9 -13H9M-9 -4H9M-9 5H9M-9 14H9"
        },
        {
          "label": "Bronchi",
          "shape": "M0 -22V-6L-18 13M0 -6L18 13M-6 -22V-9L-24 10M6 -22V-9L24 10"
        },
        {
          "label": "Bronchioles",
          "shape": "M0 -19V-6L-13 8L-24 18M0 -6L13 8L26 20M-13 8L-8 22M13 8L4 21"
        },
        {
          "label": "Alveoli",
          "shape": "M-17 -13L-6 1M-6 1l-5 10m5 -10l9 2M-11 11a6 6 0 1 0 0 12a6 6 0 1 0 0 -12ZM3 3a7 7 0 1 0 0 14a7 7 0 1 0 0 -14Z"
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
          "label": "Diaphragm",
          "shape": "M-25 11Q0 -17 25 11M-25 18Q0 12 25 18M-21 -7v-15m42 15v-15",
          "motion": "M0 0V17"
        },
        {
          "label": "Spiracle",
          "shape": "M-24 -15V17M-22 -15V-5m0 8v14M-21 -1H2L20 -15M2 -1L20 14"
        }
      ]
    },
    {
      "parts": [
        {
          "label": "Fish gill route",
          "shape": "M-27 -4Q-7 -19 12 -7L24 -15V11L12 4Q-8 17 -27 -1ZM-4 -8Q-12 3 -4 9m6 -17q-8 10 0 15M-21 -5h1",
          "motion": "M-31 0Q-14 -1 -7 2T14 7"
        }
      ]
    }
  ]
})
