import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  root: '.',
  server: { port: 3000 },
  esbuild: {
    drop: mode === 'production' ? ['console', 'debugger'] : undefined,
  },
  build: {
    target: 'es2020',
    minify: 'esbuild',
    cssMinify: true,
    sourcemap: false,
    reportCompressedSize: true,
    rollupOptions: {
      output: {
        manualChunks: (id: string) => {
          if (id.indexOf('node_modules/react/') !== -1 || id.indexOf('node_modules/react-dom/') !== -1) return 'vendor-react';
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
}));
