import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

// Open the database connection once and reuse it across the application
const dbPromise = open({
  filename: './tasks.db', // Database file in the project root
  driver: sqlite3.Database
});

export default dbPromise;