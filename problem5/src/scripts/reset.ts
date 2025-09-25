#!/usr/bin/env tsx

import 'dotenv/config';
import { db } from '../lib/db';
import { users, entities } from '../lib/schema';
import logger from '../utils/db-logger';

async function main() {
  try {
    logger.info('Starting database reset...');

    // Clear all data (order matters due to foreign key constraints)
    logger.info('Clearing entities...');
    await db.delete(entities);
    
    logger.info('Clearing users...');
    await db.delete(users);

    logger.info('Database reset completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Database reset failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
