import type { Config } from 'jest';

// Jest configuration file for testing with TypeScript and ESM
const config: Config = {
  preset: 'ts-jest/presets/default-esm', // Use ts-jest preset for ESM support with TypeScript

  rootDir: './', // Base directory for resolving paths

  clearMocks: true, // Automatically clear mock calls and instances before every test

  testMatch: [
    // Patterns to detect test files
    '<rootDir>/src/**/*.spec.ts',
    '<rootDir>/src/**/*.test.ts',
    '<rootDir>/tests/**/*.spec.ts',
    '<rootDir>/tests/**/*.test.ts',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],

  collectCoverageFrom: [
    // Files to collect coverage from
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts', // Exclude type declarations
  ],

  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'], // File extensions Jest will process

  transform: {
    // Use ts-jest to transform .ts/.tsx files
    '^.+\\.tsx?$': ['ts-jest', { useESM: true, tsconfig: 'tsconfig.test.json' }],
  },

  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1', // Support for absolute path alias using @
    '^(\\.{1,2}/.*)\\.js$': '$1', // Remove .js extension in relative imports
  },

  testEnvironment: 'node', // Use Node.js environment for testing

  roots: ['<rootDir>/src', '<rootDir>/tests'], // Directories to search for test files

  collectCoverage: true, // Enable coverage collection

  coverageDirectory: 'coverage', // Output directory for coverage reports

  coverageReporters: ['text', 'lcov', 'html'], // Report formats

  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.test.json', // Specific tsconfig for tests
    },
  },

  extensionsToTreatAsEsm: ['.ts'], // Treat .ts files as ESM

  setupFilesAfterEnv: ['<rootDir>/src/types/express/index.ts'], // File to run after environment setup (for global types)
};

export default config;
