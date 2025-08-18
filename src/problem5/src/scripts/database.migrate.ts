import { sequelize, closeSequelizeConnection } from '../config/sequelize';
import { up as createResourcesTable } from '../migrations/001-create-resources-table';

async function runMigrations(): Promise<void> {
  try {
    console.log('Running database migrations...');
    
    // Ensure database connection is established
    await sequelize.authenticate();
    console.log('✓ Database connection established');
    
    // Run migrations
    await createResourcesTable(sequelize.getQueryInterface());
    console.log('✓ Resources table and indexes created');
    
    console.log('Database migrations completed successfully!');
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    await closeSequelizeConnection();
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations();
}

export { runMigrations };
