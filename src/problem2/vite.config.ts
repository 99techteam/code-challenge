import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import compression from 'vite-plugin-compression'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    svelte(),
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
    }),
  ],
})
