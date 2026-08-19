import path from 'path';
import FileSync from 'lowdb/adapters/FileSync';
import low from 'lowdb';
import { Database } from './types';

const DB_FILE = process.env.DB_FILE ?? path.join(__dirname, '..', 'data.json');

const adapter = new FileSync<Database>(DB_FILE);
const db = low(adapter);

db.defaults({ resources: [] }).write();

export default db;
