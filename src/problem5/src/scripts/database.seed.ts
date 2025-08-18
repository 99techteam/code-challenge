import { sequelize, closeSequelizeConnection } from '../config/sequelize';
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

async function seedDatabase(): Promise<void> {
  try {
    console.log('Seeding database with sample data...');
    
    // Ensure database connection is established
    await sequelize.authenticate();
    console.log('✓ Database connection established');
    
    // Clear existing data
    await Resource.destroy({ where: {} });
    console.log('✓ Cleared existing resources');
    
    // Insert sample resources using Sequelize
    const createdResources = await Resource.bulkCreate(sampleResources);
    
    console.log(`✓ Inserted ${createdResources.length} sample resources`);
    console.log('Database seeding completed successfully!');
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Seeding failed:', err.message);
    process.exit(1);
  } finally {
    await closeSequelizeConnection();
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

export { seedDatabase };
