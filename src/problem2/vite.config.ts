import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import svgr from 'vite-plugin-svgr'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    svgr(),
  ],
  server: {
    port: 5173,
    open: true,
  },
  assetsInclude: ['src/problem2/swapcurrency/assets/*.svg'],
  optimizeDeps: {
    exclude: ['src/problem2/swapcurrency/assets/*.svg'],
  },
})
