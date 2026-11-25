import { defineConfig } from 'vite'

export default defineConfig({
  base: '/jp-pilot/',
  server: {
    fs: {
      allow: ['.', '../data', '../maths-bank'],
    },
  },
})
