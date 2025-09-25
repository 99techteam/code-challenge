#!/usr/bin/env tsx

import 'dotenv/config';
import { runMigrations } from '../lib/migrate';
import logger from '../utils/db-logger';

async function main() {
  try {
    logger.info('Running database migrations...');
    await runMigrations();
    logger.info('Migrations completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Migration failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
