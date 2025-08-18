import { sequelize } from '../config/sequelize';
import { up as createResourcesTable } from '../migrations/001-create-resources-table';
import { Resource } from '../models';
import { CreateResourceRequest } from '../types';

const sampleResources: CreateResourceRequest[] = [
  {
    name: 'User Management System',
    description:
      'A comprehensive system for managing user accounts, roles, and permissions',
    category: 'software',
    status: 'active',
    metadata: { version: '2.1.0', maintainer: 'dev-team' },
  },
  {
    name: 'Conference Room A',
    description: 'Large conference room with video conferencing capabilities',
    category: 'facility',
    status: 'active',
    metadata: {
      capacity: 20,
      equipment: ['projector', 'whiteboard', 'video-conf'],
    },
  },
  {
    name: 'Development Server',
    description: 'Primary development server for staging applications',
    category: 'hardware',
    status: 'active',
    metadata: { specs: { cpu: '16-core', ram: '64GB', storage: '2TB SSD' } },
  },
  {
    name: 'Legacy CRM System',
    description: 'Old customer relationship management system',
    category: 'software',
    status: 'inactive',
    metadata: { deprecated_date: '2023-12-01', replacement: 'New CRM v3' },
  },
  {
    name: 'Training Materials',
    description: 'Employee onboarding and training documentation',
    category: 'document',
    status: 'active',
    metadata: { last_updated: '2024-01-15', format: 'pdf' },
  },
];

/**
 * Initialize database for Docker container startup
 * This script runs database setup only if tables don't exist
 * Does NOT close the connection to allow the app to continue using it
 */
async function initializeDatabase(): Promise<void> {
  try {
    console.log('Checking database initialization...');

    // Check if database connection is available
    await sequelize.authenticate();
    console.log('✓ Database connection established');

    // Check if resources table exists
    const tableExists = await sequelize
      .getQueryInterface()
      .showAllTables()
      .then(tables => tables.includes('resources'));

    if (!tableExists) {
      console.log('Resources table not found. Running database setup...');

      // Run migrations
      await createResourcesTable(sequelize.getQueryInterface());
      console.log('✓ Resources table and indexes created');

      // Seed database
      const createdResources = await Resource.bulkCreate(sampleResources);
      console.log(`✓ Inserted ${createdResources.length} sample resources`);

      console.log('✅ Database initialization completed');
    } else {
      console.log('✓ Database already initialized');
    }
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Database initialization failed:', err.message);
    // Don't exit process in Docker environment - let the app start anyway
    console.log('Continuing with application startup...');
  }
}

// Run initialization if this file is executed directly
if (require.main === module) {
  initializeDatabase();
}

export { initializeDatabase };
