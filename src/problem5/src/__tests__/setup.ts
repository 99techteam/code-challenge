import 'reflect-metadata';

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.DB_USERNAME = 'test';
process.env.DB_PASSWORD = 'test';
process.env.DB_NAME = 'test_db';
process.env.LOG_LEVEL = 'error';

// Mock winston logger to avoid file system operations during tests
jest.mock('../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

// Mock database connection
jest.mock('../database/database', () => ({
  database: {
    connect: jest.fn().mockResolvedValue(undefined),
    disconnect: jest.fn().mockResolvedValue(undefined),
    getEntityManager: jest.fn().mockReturnValue({
      find: jest.fn(),
      findOne: jest.fn(),
      persistAndFlush: jest.fn(),
      nativeDelete: jest.fn(),
      count: jest.fn(),
    }),
  },
}));

// Global test timeout
jest.setTimeout(10000);

// Simple test to satisfy Jest requirement
describe('Test Setup', () => {
  it('should have test environment configured', () => {
    expect(process.env.NODE_ENV).toBe('test');
  });
}); 