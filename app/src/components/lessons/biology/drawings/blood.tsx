import { processDrawing } from '../ProcessBoard'

export default processDrawing({
  "label": "Blood components and clotting",
  "rows": [
    {
      "parts": [
        {
          "label": "Plasma",
          "shape": "M-13 -21H13M-10 -21V14Q0 23 10 14V-21M-10 -4H10M-10 1H10M-8 8H8M-8 13H8"
        },
        {
          "label": "Erythrocyte",
          "shape": "M-25 2a25 16 0 1 0 50 0a25 16 0 1 0 -50 0ZM-13 1a13 6 0 1 0 26 0a13 6 0 1 0 -26 0Z",
          "motion": "M-28 -20L-11 0"
        }
      ]
    },
    {
      "parts": [
        {
          "label": "Platelets",
          "shape": "M-28 -12H-4L1 -5L8 -12H29M-28 13H29M-13 -1l5 4l-6 5l-4 -4ZM1 -4l5 5l-5 4l-6 -3ZM9 -3l6 3l-4 5l-6 -2Z",
          "motion": "M-24 8L-4 1"
        }
      ]
    },
    {
      "parts": [
        {
          "label": "Fibrin mesh",
          "shape": "M-28 -11H-8L-2 -3L7 -11H29M-28 13H29M-14 -9L15 13M-9 -11L12 14M0 -11L-17 13M12 -11L-8 15M18 -8L3 15"
        }
      ]
    }
  ]
})
