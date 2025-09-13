import { closeDatabaseConnection } from '../src/config/database';

// Global test setup
beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = 'test';
});

afterAll(async () => {
  // Clean up any global resources
  await closeDatabaseConnection();
});