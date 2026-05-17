import { Database } from "bun:sqlite";

const isTestEnv = process.env.NODE_ENV === "test";

const resolveDbPath = (): string => {
  if (isTestEnv) {
    const configured = process.env.DB_PATH;
    if (configured && configured !== ":memory:") {
      console.warn(
        `[db] NODE_ENV=test — ignoring DB_PATH=${configured} and using an in-memory database to protect dev/prod data`,
      );
    }
    return ":memory:";
  }
  return process.env.DB_PATH ?? "./data/app.db";
};

const DB_PATH = resolveDbPath();

const db = new Database(DB_PATH, { create: true });

db.run("PRAGMA journal_mode = WAL;");
db.run("PRAGMA foreign_keys = ON;");

db.run(`
  CREATE TABLE IF NOT EXISTS resources (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    description TEXT,
    status      TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'archived')),
    created_at  TEXT NOT NULL,
    updated_at  TEXT NOT NULL
  );
`);

db.run(`CREATE INDEX IF NOT EXISTS idx_resources_status ON resources(status);`);
db.run(`CREATE INDEX IF NOT EXISTS idx_resources_created_at ON resources(created_at);`);

db.run(`
  CREATE TABLE IF NOT EXISTS idempotency_keys (
    key             TEXT NOT NULL,
    scope           TEXT NOT NULL,
    request_hash    TEXT NOT NULL,
    response_status INTEGER,
    response_body   TEXT,
    created_at      TEXT NOT NULL,
    completed_at    TEXT,
    PRIMARY KEY (scope, key)
  );
`);

db.run(
  `CREATE INDEX IF NOT EXISTS idx_idempotency_created_at ON idempotency_keys(created_at);`,
);

export default db;
