#!/usr/bin/env tsx

import 'dotenv/config';
import { db } from '../lib/db';
import { users, entities } from '../lib/schema';
import logger from '../utils/db-logger';

// Sample data for seeding
const sampleUsers = [
  {
    email: 'john.doe@example.com',
    name: 'John Doe',
    password: '$2b$10$example.hash.placeholder', // In real app, this would be properly hashed
    isActive: true,
  },
  {
    email: 'jane.smith@example.com',
    name: 'Jane Smith',
    password: '$2b$10$example.hash.placeholder',
    isActive: true,
  },
  {
    email: 'bob.wilson@example.com',
    name: 'Bob Wilson',
    password: '$2b$10$example.hash.placeholder',
    isActive: false,
  },
  {
    email: 'alice.brown@example.com',
    name: 'Alice Brown',
    password: '$2b$10$example.hash.placeholder',
    isActive: true,
  },
  {
    email: 'charlie.davis@example.com',
    name: 'Charlie Davis',
    password: '$2b$10$example.hash.placeholder',
    isActive: true,
  },
];

const sampleEntities = [
  {
    name: 'Project Alpha',
    description: 'A comprehensive project management system for enterprise clients.',
    type: 'project',
    status: 'active',
    metadata: JSON.stringify({ priority: 'high', budget: 50000, team_size: 8 }),
  },
  {
    name: 'Product Beta',
    description: 'Next-generation mobile application for customer engagement.',
    type: 'product',
    status: 'pending',
    metadata: JSON.stringify({ platform: ['iOS', 'Android'], version: '2.0' }),
  },
  {
    name: 'Service Gamma',
    description: 'Cloud-based analytics and reporting service.',
    type: 'service',
    status: 'active',
    metadata: JSON.stringify({ tier: 'premium', region: 'us-east-1' }),
  },
  {
    name: 'Task Delta',
    description: 'Database optimization and performance tuning.',
    type: 'task',
    status: 'completed',
    metadata: JSON.stringify({ estimated_hours: 40, actual_hours: 35 }),
  },
  {
    name: 'Event Epsilon',
    description: 'Annual company conference and product launch.',
    type: 'event',
    status: 'pending',
    metadata: JSON.stringify({ date: '2024-06-15', attendees: 500, venue: 'Convention Center' }),
  },
  {
    name: 'Document Zeta',
    description: 'Technical specification for API v3.0.',
    type: 'document',
    status: 'active',
    metadata: JSON.stringify({ version: '3.0', pages: 45, format: 'PDF' }),
  },
  {
    name: 'Project Eta',
    description: 'Legacy system migration to cloud infrastructure.',
    type: 'project',
    status: 'active',
    metadata: JSON.stringify({ complexity: 'high', duration_weeks: 12 }),
  },
  {
    name: 'Product Theta',
    description: 'AI-powered customer support chatbot.',
    type: 'product',
    status: 'archived',
    metadata: JSON.stringify({ ai_model: 'GPT-4', languages: ['en', 'es', 'fr'] }),
  },
];

async function main() {
  try {
    logger.info('Starting database seeding...');
    logger.info(`Using database: ${process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'unknown'}`);

    // Clear existing data first (optional - remove if you want to keep existing data)
    logger.info('Clearing existing data...');
    await db.delete(entities);
    await db.delete(users);

    // Insert users
    logger.info('Seeding users...');
    const insertedUsers = await db.insert(users).values(sampleUsers).returning();
    logger.info(`Successfully inserted ${insertedUsers.length} users`);

    // Insert entities with references to users
    logger.info('Seeding entities...');
    const entitiesWithUsers = sampleEntities.map((entity, index) => ({
      ...entity,
      createdBy: insertedUsers[index % insertedUsers.length].id, // Distribute entities among users
    }));

    const insertedEntities = await db.insert(entities).values(entitiesWithUsers).returning();
    logger.info(`Successfully inserted ${insertedEntities.length} entities`);

    // Verify the data was inserted
    const userCount = await db.select().from(users);
    const entityCount = await db.select().from(entities);
    
    logger.info(`Verification: Found ${userCount.length} users and ${entityCount.length} entities in database`);
    logger.info('Database seeding completed successfully');
    
    process.exit(0);
  } catch (error) {
    logger.error('Seeding failed:', error);
    if (error instanceof Error) {
      logger.error('Error details:', error.message);
    }
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}