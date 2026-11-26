import { processDrawing } from '../ProcessBoard'

export default processDrawing({
  "label": "Energy flow and feeding relationships",
  "rows": [
    {
      "parts": [
        {
          "label": "Producer",
          "shape": "M-24 22H23M-6 22Q-7 0 -19 -16Q-4 -10 1 -1Q11 -18 20 -19Q19 -1 4 13L4 22"
        },
        {
          "label": "Primary|consumer",
          "shape": "M-24 5Q-16 -7 -7 -4L13 -8L24 1L16 8H-16ZM-11 8L-21 19m13 -12L8 19m6 -12l10 9M15 -7l10 -11"
        },
        {
          "label": "Secondary|consumer",
          "shape": "M-24 9Q-16 -13 1 -9Q12 -25 23 -12L31 -8L21 -3Q14 19 -24 9ZM-6 -2Q-4 6 13 3M21 -12h1"
        }
      ],
      "links": [
        1,
        1
      ]
    },
    {
      "parts": [
        {
          "label": "Parasitism",
          "shape": "M-24 22L2 -15m-12 17l-16 -19M-5 4q19 -16 24 -1q-6 11 -24 1m1 1q11 4 11 14"
        }
      ]
    },
    {
      "parts": [
        {
          "label": "Commensalism",
          "shape": "M-25 -2Q-11 -12 11 -7L24 -15L23 6L12 2Q-18 14 -25 -2ZM-12 2h1M-5 16q11 -6 23 -1l9 -5v11l-9 -4q-13 8 -23 -1"
        }
      ]
    }
  ]
})
