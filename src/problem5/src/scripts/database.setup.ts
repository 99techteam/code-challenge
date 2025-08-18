import { sequelize, closeSequelizeConnection } from '../config/sequelize';
import { up as createResourcesTable } from '../migrations/001-create-resources-table';
import { Resource } from '../models';
import { CreateResourceRequest } from '../types';

interface SetupOptions {
  migrate?: boolean;
  seed?: boolean;
  force?: boolean;
}

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

async function setupDatabase(options: SetupOptions = {}): Promise<void> {
  const { migrate = true, seed = true, force = false } = options;

  try {
    console.log('Setting up database...');

    // Ensure database connection is established
    await sequelize.authenticate();
    console.log('✓ Database connection established');

    if (force) {
      console.log('⚠️  Force mode: Dropping all tables...');
      await sequelize.drop();
      console.log('✓ All tables dropped');
    }

    if (migrate) {
      console.log('Running migrations...');
      await createResourcesTable(sequelize.getQueryInterface());
      console.log('✓ Resources table and indexes created');
    }

    if (seed) {
      console.log('Seeding database...');

      // Clear existing data
      await Resource.destroy({ where: {} });
      console.log('✓ Cleared existing resources');

      // Insert sample resources using Sequelize
      const createdResources = await Resource.bulkCreate(sampleResources);
      console.log(`✓ Inserted ${createdResources.length} sample resources`);
    }

    console.log('✅ Database setup completed successfully!');
  } catch (error: unknown) {
    const err = error as Error;
    console.error('❌ Database setup failed:', err.message);
    process.exit(1);
  } finally {
    await closeSequelizeConnection();
  }
}

// Parse command line arguments
function parseArgs(): SetupOptions {
  const args = process.argv.slice(2);
  const options: SetupOptions = {};

  if (args.includes('--no-migrate')) {
    options.migrate = false;
  }

  if (args.includes('--no-seed')) {
    options.seed = false;
  }

  if (args.includes('--force')) {
    options.force = true;
  }

  return options;
}

// Run setup if this file is executed directly
if (require.main === module) {
  const options = parseArgs();
  setupDatabase(options);
}

export { setupDatabase };
