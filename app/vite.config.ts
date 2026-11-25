import { defineConfig } from 'vite'

export default defineConfig({
  base: '/jp-pilot/',
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.endsWith('/try-it/motion.ts')) return 'try-it-motion'
          if (id.endsWith('/lessons/lesson.ts')) return 'lesson-timing'
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
