module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src/test/e2e'],
  testMatch: ['**/*.e2e.test.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  setupFilesAfterEnv: ['<rootDir>/src/test/e2e-setup.ts'],
  testTimeout: 60000,
  maxWorkers: 1, // Run tests sequentially for database consistency
  forceExit: true,
  clearMocks: true,
}; 