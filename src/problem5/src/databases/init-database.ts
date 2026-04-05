import { AppDataSource } from './data-sources';

/**
 * Initializes the database connection using the AppDataSource.
 * It will connect and automatically create the 'resources' table
 * if it doesn't exist, because `synchronize: true` is set in the data source.
 */
export const initializeDatabase = async () => {
  if (AppDataSource.isInitialized) {
    console.log('Database connection was already established.');
    return;
  }

  try {
    console.log('Initializing database connection...');
    await AppDataSource.initialize();
    console.log('Database connection established and synchronized successfully.');

    // Verify table creation
    const queryRunner = AppDataSource.createQueryRunner();
    const hasTable = await queryRunner.hasTable('resources'); // TypeORM uses the table name from @Entity('resources') or class name
    await queryRunner.release();

    if (hasTable) {
      console.log("Verification successful: 'resources' table exists.");
    } else {
      throw new Error("Verification failed: 'resources' table was not created.");
    }
  } catch (error) {
    console.error('FATAL: Error during database initialization.', error);
    process.exit(1);
  }
};
