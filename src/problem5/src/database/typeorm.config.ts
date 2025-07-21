import { DataSource } from 'typeorm';
import { Resource } from '../entities/Resource.entity';
import { logDatabase, logError, logInfo } from '../utils/logger';
import dotenv from 'dotenv';

dotenv.config();

// TypeORM DataSource configuration
export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3307'),
  username: process.env.DB_USER || 'appuser',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'resources_db',
  
  // Entity configuration - use direct class reference for reliability
  entities: [Resource],
  
  // Development settings
  synchronize: process.env.NODE_ENV !== 'production', // Auto-sync schema in dev
  logging: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
  
  // Connection pool settings
  extra: {
    connectionLimit: 10,
    acquireTimeout: 60000,
    timeout: 60000,
  },

  // Migration settings
  migrations: [],
  migrationsTableName: 'typeorm_migrations',
});

// Initialize TypeORM connection
export const initializeTypeORM = async (): Promise<void> => {
  try {
    logInfo('Initializing TypeORM connection...');
    
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      logInfo('TypeORM connection established successfully');
      
      // In development, sync the schema
      if (process.env.NODE_ENV !== 'production') {
        logDatabase('Schema synchronization completed');
      }
    } else {
      logInfo('TypeORM connection already initialized');
    }
  } catch (error) {
    logError('Error initializing TypeORM connection', error);
    throw error;
  }
};

// Close TypeORM connection
export const closeTypeORM = async (): Promise<void> => {
  try {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      logInfo('TypeORM connection closed');
    }
  } catch (error) {
    logError('Error closing TypeORM connection', error);
    throw error;
  }
};

// Get repository for an entity
export const getRepository = <T>(entity: new () => T) => {
  return AppDataSource.getRepository(entity);
};

export default AppDataSource; 