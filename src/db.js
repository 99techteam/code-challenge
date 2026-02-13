import Database from 'better-sqlite3';

// Create or connect to the database file (creates foobar.db if missing)
const db = new Database('ProgramDatabase.db');

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');

// Initialize schema (create tables if they don’t exist)
db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    age INTEGER,
    phone TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();

// Trigger to auto-update the updated_at field on changes
db.prepare(`
 CREATE TRIGGER IF NOT EXISTS update_users_timestamps
  AFTER UPDATE ON users
  BEGIN
    UPDATE users
    SET updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.id;
  END;
`).run();

const pragma = db.prepare("PRAGMA table_info(users)").all();
const hasScore = pragma.some(col => col.name === "score");

if (!hasScore) {
  db.prepare("ALTER TABLE users ADD COLUMN score INTEGER DEFAULT 0").run();
}
// Export the connection so other modules can use it
export default db;
