import 'reflect-metadata';
import { AppDataSource } from '../database/typeorm.config';
import { Resource } from '../entities/Resource.entity';

// Set test environment variables BEFORE importing any modules
process.env.NODE_ENV = 'test';
process.env.DB_NAME = 'resources_test_db';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '3307'; // Use the exposed MySQL port
process.env.DB_USER = 'appuser';
process.env.DB_PASSWORD = 'password';

let isSetupComplete = false;

// Global setup - initialize test database
beforeAll(async () => {
  if (isSetupComplete) return;
  
  try {
    // Initialize the main AppDataSource with test environment variables
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    
    // Sync schema and drop existing data
    await AppDataSource.synchronize(true);
    
    console.log('Test database connected and synchronized successfully');
    isSetupComplete = true;
  } catch (error) {
    console.error('Error connecting to test database:', error);
    throw error;
  }
}, 30000);

// Clean up database before each test
beforeEach(async () => {
  if (AppDataSource.isInitialized) {
    await AppDataSource.getRepository(Resource).clear();
  }
});

// Global teardown
afterAll(async () => {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
});

export { AppDataSource as testDataSource }; 