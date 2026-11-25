import { defineConfig } from 'vite'

export default defineConfig({
  base: '/jp-pilot/',
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.endsWith('/try-it/motion.ts')) return 'try-it-motion'
        },
      },
    },
  },
  server: {
    fs: {
      allow: ['.', '../data'],
    },
  },
})
