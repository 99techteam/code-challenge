import Database from 'better-sqlite3';
import path from 'path';
import { initSchema } from './schema';

const dbPath = path.join(__dirname, '..', '..', 'database.sqlite');
const db = new Database(dbPath);

db.pragma('foreign_keys = ON');
initSchema(db);

console.log('db ready');

export default db;
