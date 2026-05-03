import { logger } from "../logger.js";
import type { DB } from "./connection.js";

/**
 * Idempotent schema bootstrap. Runs on every boot.
 *
 * Schema rationale:
 *   - id          : UUID stored as TEXT — opaque, unguessable, no integer enum
 *                   problems with multiple writers.
 *   - status      : CHECK constraint enforces the enum at the engine layer
 *                   (defense in depth alongside zod at the API layer).
 *   - created_at  : ISO-8601 string for portability + lexicographic sortability.
 *   - updated_at  : updated by service layer on every mutation.
 *   - Indexes     : (category) and (status) for the documented filter queries.
 */
export function migrate(db: DB): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS resources (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      category    TEXT NOT NULL,
      status      TEXT NOT NULL CHECK (status IN ('active','archived','draft')),
      created_at  TEXT NOT NULL,
      updated_at  TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_resources_category ON resources(category);
    CREATE INDEX IF NOT EXISTS idx_resources_status   ON resources(status);
    CREATE INDEX IF NOT EXISTS idx_resources_created  ON resources(created_at);
  `);
  logger.debug("schema migration complete");
}
