import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // Keep modern output; do NOT downlevel below ES2022 or you’ll lose TLA support
    target: 'esnext',              // or: target: ['chrome89','firefox89','safari15']
  },
  esbuild: {
    // Make esbuild assume these features are available so it won’t try to transform them
    supported: { 'top-level-await': true }
  }
})
