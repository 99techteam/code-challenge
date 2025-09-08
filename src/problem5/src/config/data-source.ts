import { DataSource } from 'typeorm';
import { Book } from '../entity/Book';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: 'database.sqlite',
  synchronize: true, // Set to false in production
  logging: process.env.NODE_ENV === 'development',
  entities: [Book],
  migrations: [],
  subscribers: [],
});

export const initializeDatabase = async (): Promise<void> => {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connection established successfully');
  } catch (error) {
    console.error('❌ Error during Data Source initialization:', error);
    throw error;
  }
};
