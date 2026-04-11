import { createClient } from '@libsql/client';
import path from 'path';

const DB_URL = `file:${path.join(__dirname, '..', 'data.db')}`;

export const db = createClient({ url: DB_URL });

export async function initDb(): Promise<void> {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS resources (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT    NOT NULL,
      description TEXT    NOT NULL DEFAULT '',
      status      TEXT    NOT NULL DEFAULT 'active'
                          CHECK(status IN ('active', 'inactive', 'archived')),
      created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
    )
  `);
}
