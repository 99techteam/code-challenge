import { beforeAll, afterAll } from '@jest/globals';
import fs from 'fs';
import path from 'path';

// Test database path
const TEST_DB_PATH = path.join(__dirname, '../test-database.sqlite');

beforeAll(() => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  process.env.DB_PATH = TEST_DB_PATH;
  process.env.API_KEY = 'test-api-key-12345';
  process.env.ENABLE_FILE_LOGGING = 'false'; // Disable file logging in tests

  // Suppress console output during tests for cleaner output
  global.console = {
    ...console,
    log: jest.fn(), // Suppress logs
    info: jest.fn(), // Suppress info
    warn: jest.fn(), // Suppress warnings
    error: jest.fn(), // Suppress errors (but tests can still check them)
  };
});

afterAll(() => {
  // Clean up test database
  if (fs.existsSync(TEST_DB_PATH)) {
    fs.unlinkSync(TEST_DB_PATH);
  }
});
