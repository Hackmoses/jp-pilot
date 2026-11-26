import { processDrawing } from '../ProcessBoard'

export default processDrawing({
  "label": "Sensing light, sound, touch and water",
  "rows": [
    {
      "parts": [
        {
          "label": "Eyespot",
          "shape": "M-25 5Q-7 -24 20 -12Q14 10 -25 5ZM17 -11Q31 -25 32 -9M7 -10a4 4 0 1 0 0 8a4 4 0 1 0 0 -8Z",
          "motion": "M-24 -19L5 -9"
        }
      ]
    },
    {
      "parts": [
        {
          "label": "Cochlea",
          "shape": "M-22 -13Q-28 10 -8 20Q15 30 25 10Q31 -11 10 -16Q-9 -22 -15 -7Q-21 9 -1 12Q16 15 15 3Q12 -10 1 -7Q-6 -5 -5 2",
          "motion": "M-24 -14Q-26 -2 -18 7"
        },
        {
          "label": "Vibrissae",
          "shape": "M-24 -13Q-8 -15 9 -3L21 5Q7 13 -12 17ZM9 2L32 -15M11 6l23 -1M7 8l23 11"
        }
      ]
    },
    {
      "parts": [
        {
          "label": "Hydrotropism",
          "shape": "M-21 -15V-2Q-21 12 2 16L15 20M-21 6l-10 6m24 0l-5 11M17 -13q-8 10 0 15q8 -5 0 -15Zm12 8q-8 10 0 15q8 -5 0 -15Z",
          "motion": "M-20 0Q-13 13 8 16"
        }
      ]
    }
  ]
})
