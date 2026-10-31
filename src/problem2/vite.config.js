import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const projectRoot = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [{
    name: 'balances-page-route',
    enforce: 'post',
    configureServer(server) {
      server.middlewares.use((request, _response, next) => {
        if (request.url === '/balances' || request.url === '/balances/') {
          request.url = '/src/features/balances/index.html';
        }
        next();
      });
    },
    generateBundle(_options, bundle) {
      const page = bundle['src/features/balances/index.html'];
      if (!page) return;
      delete bundle[page.fileName];
      page.fileName = 'balances/index.html';
      bundle[page.fileName] = page;
    },
  }],
  build: {
    rollupOptions: {
      input: {
        main: resolve(projectRoot, 'index.html'),
        'balances/index': resolve(projectRoot, 'src/features/balances/index.html'),
      },
    },
  },
});
