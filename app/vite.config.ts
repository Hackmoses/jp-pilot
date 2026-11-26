import { defineConfig } from 'vite'

export default defineConfig({
  base: '/jp-pilot/',
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.endsWith('/try-it/motion.ts')) return 'try-it-motion'
          if (id.endsWith('/lessons/lesson.ts')) return 'lesson-timing'
          if (id.endsWith('/lib/leitner.ts')) return 'card-reviews'
        },
      },
    },
  },
  server: {
    fs: {
      allow: ['.', '../data', '../maths-bank'],
    },
  },
})
