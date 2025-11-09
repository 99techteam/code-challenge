import Database from 'better-sqlite3';
import path from 'path';

// Initialize SQLite database
const db = new Database(path.join(__dirname, '..', 'database.sqlite'));

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create resources table
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS resources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`;

db.exec(createTableQuery);

// Create index for better query performance
db.exec('CREATE INDEX IF NOT EXISTS idx_category ON resources(category)');
db.exec('CREATE INDEX IF NOT EXISTS idx_status ON resources(status)');

console.log('✅ Database initialized successfully');

export default db;

