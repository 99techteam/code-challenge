import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['**/dist/**', '**/coverage/**', '**/node_modules/**'] },

  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,

  {
    languageOptions: {
      parserOptions: {
        // Resolves the right tsconfig per file automatically, which is what lets
        // a single config lint three packages with different compiler settings.
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // Problem 1: pure TypeScript, Node environment.
  {
    files: ['src/problem1/**/*.ts'],
    languageOptions: { globals: globals.node },
  },

  // Problems 2 and 3: React in the browser.
  {
    files: ['src/problem{2,3}/**/*.{ts,tsx}'],
    languageOptions: { globals: globals.browser },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },

  // Setup files shim browser APIs jsdom does not implement. The stubs are
  // deliberately empty, and patching a prototype means reading methods off it.
  {
    files: ['**/vitest.setup.ts'],
    rules: {
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/unbound-method': 'off',
    },
  },

  // Tests may lean on non-null assertions and expect-style expressions.
  {
    files: ['**/*.test.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/unbound-method': 'off',
    },
  },

  // Root config files are plain JS and need no type-aware rules.
  {
    files: ['*.js'],
    ...tseslint.configs.disableTypeChecked,
  },
);
