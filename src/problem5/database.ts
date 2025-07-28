import Database from 'better-sqlite3';

const DBSOURCE = './src/problem5/db.sqlite';

const db = new Database(DBSOURCE);

db.exec(`CREATE TABLE IF NOT EXISTS resources (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
)`);

console.log('Connected to the SQLite database.');

export { db };
