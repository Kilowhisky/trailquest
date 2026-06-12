import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// The production build uses base '/trailquest/' so GitHub Pages assets resolve at
// the project subpath (https://kilowhisky.github.io/trailquest/). Local dev/preview
// stays at '/' so `npm run dev` isn't pinned under the subpath.
// See docs/specs/2026-06-12-cicd-pipeline-design.md.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/trailquest/' : '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
  },
}))
