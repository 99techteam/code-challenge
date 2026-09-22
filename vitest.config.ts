import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

const setupFiles = [resolve(import.meta.dirname, 'vitest.setup.ts')];

/** Options every project inherits. Kept here so the three problems can't drift apart. */
const shared = {
  globals: true,
  exclude: ['**/node_modules/**', '**/dist/**'],
  clearMocks: true,
  restoreMocks: true,
  unstubEnvs: true,
  unstubGlobals: true,
} as const;

export default defineConfig({
  test: {
    coverage: {
      // Totals are correct, but vitest 5.0.1's `text` reporter renders an empty
      // per-file table when `projects` is used. Read coverage/index.html for the
      // per-file breakdown.
      provider: 'v8' as const,
      reporter: ['text', 'html'],
      include: ['src/problem*/src/**/*.{ts,tsx}'],
      exclude: ['**/*.test.{ts,tsx}', '**/main.tsx', '**/vitest.d.ts'],
    },
    projects: [
      {
        test: { ...shared, name: 'problem-1', root: './src/problem1', environment: 'node' },
      },
      {
        // problem-2 uses shadcn/ui, whose generated components import through the
        // `@/*` alias. Mirror src/problem2/vite.config.ts here — inline projects don't
        // pick up a package's own Vite config.
        resolve: { alias: { '@': resolve(import.meta.dirname, 'src/problem2/src') } },
        test: {
          ...shared,
          name: 'problem-2',
          root: './src/problem2',
          environment: 'jsdom',
          setupFiles: [...setupFiles, resolve(import.meta.dirname, 'src/problem2/vitest.setup.ts')],
        },
      },
      {
        test: {
          ...shared,
          name: 'problem-3',
          root: './src/problem3',
          environment: 'jsdom',
          setupFiles,
        },
      },
    ],
  },
});
