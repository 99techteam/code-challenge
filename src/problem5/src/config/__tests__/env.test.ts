import { env, ENV, isDevelopment, isProduction, isTest, getDatabaseConfig, getServerConfig, getApiDocsConfig } from '../env';

describe('Environment Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('Environment Validation', () => {
    it('should parse valid environment variables', () => {
      process.env.NODE_ENV = 'development';
      process.env.PORT = '3000';
      process.env.DB_HOST = 'localhost';
      process.env.DB_PORT = '5432';
      process.env.DB_USERNAME = 'postgres';
      process.env.DB_PASSWORD = 'password';
      process.env.DB_NAME = 'test_db';
      process.env.LOG_LEVEL = 'info';
      process.env.ENABLE_OPENAPI = 'true';
      process.env.ENABLE_SWAGGER_UI = 'true';

      // Re-import to get fresh config
      const { env: freshEnv } = require('../env');

      expect(freshEnv.NODE_ENV).toBe('development');
      expect(freshEnv.PORT).toBe(3000);
      expect(freshEnv.DB_HOST).toBe('localhost');
      expect(freshEnv.DB_PORT).toBe(5432);
      expect(freshEnv.DB_USERNAME).toBe('postgres');
      expect(freshEnv.DB_PASSWORD).toBe('password');
      expect(freshEnv.DB_NAME).toBe('test_db');
      expect(freshEnv.LOG_LEVEL).toBe('info');
      expect(freshEnv.ENABLE_OPENAPI).toBe(true);
      expect(freshEnv.ENABLE_SWAGGER_UI).toBe(true);
    });

    it('should use default values when environment variables are not set', () => {
      // Clear all environment variables and only set required ones
      process.env = {
        DB_PASSWORD: 'password'
      };

      // Re-import to get fresh config
      const { env: freshEnv } = require('../env');

      expect(freshEnv.NODE_ENV).toBe('development');
      expect(freshEnv.PORT).toBe(3000);
      expect(freshEnv.DB_HOST).toBe('localhost');
      expect(freshEnv.DB_PORT).toBe(5432);
      expect(freshEnv.DB_USERNAME).toBe('postgres');
      expect(freshEnv.DB_NAME).toBe('crud_server');
      expect(freshEnv.LOG_LEVEL).toBe('info');
      expect(freshEnv.ENABLE_OPENAPI).toBe(true);
      expect(freshEnv.ENABLE_SWAGGER_UI).toBe(true);
    });

    it('should handle boolean environment variables correctly', () => {
      process.env.DB_PASSWORD = 'password';
      process.env.ENABLE_OPENAPI = 'false';
      process.env.ENABLE_SWAGGER_UI = 'false';

      // Re-import to get fresh config
      const { env: freshEnv } = require('../env');

      expect(freshEnv.ENABLE_OPENAPI).toBe(false);
      expect(freshEnv.ENABLE_SWAGGER_UI).toBe(false);
    });
  });

  describe('Environment Constants', () => {
    beforeEach(() => {
      // Set required environment variables
      process.env.DB_PASSWORD = 'password';
    });

    it('should provide correct environment constants', () => {
      const { ENV } = require('../env');
      
      expect(ENV.nodeEnv).toBeDefined();
      expect(ENV.port).toBeDefined();
      expect(ENV.db.host).toBeDefined();
      expect(ENV.db.port).toBeDefined();
      expect(ENV.db.username).toBeDefined();
      expect(ENV.db.password).toBeDefined();
      expect(ENV.db.name).toBeDefined();
      expect(ENV.db.url).toBeDefined();
      expect(ENV.logLevel).toBeDefined();
      expect(ENV.features.openapiEnabled).toBeDefined();
      expect(ENV.features.swaggerUiEnabled).toBeDefined();
    });

    it('should construct database URL correctly', () => {
      const { ENV } = require('../env');
      const expectedUrl = `postgresql://${ENV.db.username}:${ENV.db.password}@${ENV.db.host}:${ENV.db.port}/${ENV.db.name}`;
      expect(ENV.db.url).toBe(expectedUrl);
    });
  });

  describe('Environment Helpers', () => {
    beforeEach(() => {
      process.env.DB_PASSWORD = 'password';
    });

    it('should provide correct environment helper functions', () => {
      const { isDevelopment, isProduction, isTest } = require('../env');
      
      expect(typeof isDevelopment).toBe('boolean');
      expect(typeof isProduction).toBe('boolean');
      expect(typeof isTest).toBe('boolean');
    });

    it('should return correct environment based on NODE_ENV', () => {
      const { isTest } = require('../env');
      // In test environment, isTest should be true
      expect(isTest).toBe(true);
    });
  });

  describe('Configuration Helpers', () => {
    beforeEach(() => {
      process.env.DB_PASSWORD = 'password';
    });

    it('should provide database configuration', () => {
      const { getDatabaseConfig } = require('../env');
      const dbConfig = getDatabaseConfig();
      
      expect(dbConfig).toHaveProperty('host');
      expect(dbConfig).toHaveProperty('port');
      expect(dbConfig).toHaveProperty('username');
      expect(dbConfig).toHaveProperty('password');
      expect(dbConfig).toHaveProperty('database');
      expect(dbConfig).toHaveProperty('url');
    });

    it('should provide server configuration', () => {
      const { getServerConfig } = require('../env');
      const serverConfig = getServerConfig();
      
      expect(serverConfig).toHaveProperty('port');
      expect(serverConfig).toHaveProperty('nodeEnv');
      expect(serverConfig).toHaveProperty('logLevel');
    });

    it('should provide API documentation configuration', () => {
      const { getApiDocsConfig } = require('../env');
      const apiDocsConfig = getApiDocsConfig();
      
      expect(apiDocsConfig).toHaveProperty('openapiEnabled');
      expect(apiDocsConfig).toHaveProperty('swaggerUiEnabled');
    });
  });
}); 