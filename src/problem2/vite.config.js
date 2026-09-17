import { defineConfig } from 'vite';

export default defineConfig({
  // Relative base so the built app works from any static host / subfolder.
  base: './',
  server: {
    port: 5173,
    open: false,
  },
});
