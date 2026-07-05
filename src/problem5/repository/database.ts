import { Pool } from 'pg';
import { logger } from '../logger';
import { config } from '../config';

export type Database = Pool;

export const createDatabase = async (): Promise<Database> => {
  const pool = new Pool({
    host: config.database.host,
    port: config.database.port,
    user: config.database.user,
    password: config.database.password,
    database: config.database.database,
    max: config.database.maxConnections,
    connectionTimeoutMillis: config.database.connectionTimeoutMs,
    idleTimeoutMillis: 30000,
    maxUses: 7500,
  });

  pool.on('error', (err) => {
    logger.error({ err }, 'Unexpected PostgreSQL pool error');
  });

  pool.on('connect', () => {
    logger.debug('New client connected to database');
  });

  pool.on('remove', () => {
    logger.debug('Client removed from pool');
  });

  return pool;
};

export const migrate = async (pool: Database): Promise<void> => {
  const client = await pool.connect();
  try {
    await client.query(`SET statement_timeout = ${config.database.queryTimeoutMs}`);

    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id          VARCHAR(26) PRIMARY KEY,
        name        TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        price       NUMERIC(10, 2) NOT NULL CHECK(price >= 0),
        category    TEXT NOT NULL,
        sku         TEXT NOT NULL UNIQUE,
        is_active   BOOLEAN NOT NULL DEFAULT TRUE,
        metadata    JSONB NOT NULL DEFAULT '{}',
        deleted_at  TIMESTAMPTZ,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // ============================================================================
    // INDEXES - Performance Optimization
    // ============================================================================
    //
    // DATA ASSUMPTIONS:
    // 1. Most queries filter by deleted_at IS NULL (soft delete pattern)
    // 2. Price range queries (minPrice, maxPrice) are common filters
    // 3. Results are typically sorted by created_at DESC (newest first)
    // 4. Category filtering is frequently combined with sorting
    // 5. Search uses ILIKE with leading wildcards (%term%)
    // 6. Most products are active (deleted_at IS NULL) - typically 90%+ of rows
    //
    // STRATEGY:
    // - Use partial indexes (WHERE deleted_at IS NULL) to reduce index size
    //   and improve performance for the common case (active products only)
    // - Composite indexes for common filter+sort combinations
    // - pg_trgm for ILIKE search (leading wildcard can't use B-tree)
    // ============================================================================

    // SKU lookup - unique constraint already creates an index
    // Used by: findBySku, findBySkuForUpdate, create (uniqueness check)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku)`);

    // Price range queries - used when filtering by minPrice/maxPrice
    // Partial index reduces size since we only query active products
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_products_active_price 
      ON products(price) 
      WHERE deleted_at IS NULL
    `);

    // Created_at sorting - used for ORDER BY created_at DESC in list queries
    // DESC index matches the query pattern (newest first)
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_products_active_created 
      ON products(created_at DESC) 
      WHERE deleted_at IS NULL
    `);

    // Composite index: category + created_at
    // Optimizes: WHERE category = $1 ORDER BY created_at DESC
    // Common pattern: list products in a category, sorted by newest
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_products_active_category_created 
      ON products(category, created_at DESC) 
      WHERE deleted_at IS NULL
    `);

    // ============================================================================
    // FULL-TEXT SEARCH - pg_trgm for ILIKE queries
    // ============================================================================
    //
    // PROBLEM: ILIKE '%term%' with leading wildcard causes full table scan
    // SOLUTION: Use pg_trgm extension with GIN index for trigram matching
    //
    // ASSUMPTIONS:
    // - Search is case-insensitive (ILIKE)
    // - Partial matches are needed (not just prefix matching)
    // - Dataset is large enough that full scans are unacceptable (>10k rows)
    // - pg_trgm extension is available (standard in PostgreSQL 9.x+)
    //
    // TRADE-OFFS:
    // - GIN index is larger than B-tree (~2-3x table size)
    // - Index updates are slower on INSERT/UPDATE
    // - Trigram matching works best for strings > 3 characters
    // ============================================================================

    try {
      await client.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm`);
      
      // GIN trigram index for ILIKE search on product name
      // Enables index scan instead of full table scan for:
      // WHERE name ILIKE '%search_term%'
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_products_name_trgm 
        ON products USING gin (name gin_trgm_ops)
      `);
      
      logger.info('pg_trgm extension enabled for search optimization');
    } catch (error) {
      // pg_trgm might not be available in all PostgreSQL installations
      // Log warning but don't fail migration - search will still work (just slower)
      logger.warn({ error }, 'pg_trgm extension not available, search will use full table scan');
    }

    logger.info('Database migration completed');
  } finally {
    client.release();
  }
};

export const closeDatabase = async (pool: Database): Promise<void> => {
  await pool.end();
  logger.info('Database connection closed');
};

export const checkDatabaseHealth = async (pool: Database): Promise<boolean> => {
  try {
    const client = await pool.connect();
    try {
      await client.query('SELECT 1');
      return true;
    } finally {
      client.release();
    }
  } catch (error) {
    logger.error({ error }, 'Database health check failed');
    return false;
  }
};
