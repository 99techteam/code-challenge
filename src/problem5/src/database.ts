/**
 * Persistence layer for the resource API.
 *
 * Task requirement 2: connect the backend to a simple database for data
 * persistence. Uses PGlite, an embedded PostgreSQL build that runs inside
 * Node and persists its files to a local directory. No Docker or separate
 * database server is required.
 */
import { PGlite } from '@electric-sql/pglite';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const dataDirSetting = process.env.PGLITE_DATA_DIR ?? 'data/pglite';
const isInMemory = dataDirSetting.includes('://');
const dataDir = isInMemory ? dataDirSetting : resolve(dataDirSetting);

if (!isInMemory) {
  mkdirSync(dataDir, { recursive: true });
}

export const database = new PGlite(dataDir);

/**
 * Creates the resource table and its indexes when they do not exist.
 *
 * Called before the server starts listening so requests never reach an
 * uninitialised database.
 */
export async function initializeDatabase(): Promise<void> {
  await database.waitReady;
  await database.query(`
    CREATE TABLE IF NOT EXISTS resources (
      id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      name TEXT NOT NULL CHECK (length(btrim(name)) > 0),
      description TEXT NOT NULL DEFAULT '',
      category TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await database.query('CREATE INDEX IF NOT EXISTS resources_category_idx ON resources (category)');
}
