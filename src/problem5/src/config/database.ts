import sqlite3 from 'sqlite3';
import path from 'path';
import logger from './logger';

const dbPath = process.env.DB_PATH || path.join(__dirname, '../../database.sqlite');

export const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    logger.error(`Error connecting to database: ${err.message}`);
  } else {
    logger.info(`Connected to SQLite database at ${dbPath}`);
  }
});

export const initializeDatabase = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.run(`
      CREATE TABLE IF NOT EXISTS resources (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        category TEXT,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        logger.error(`Error creating table: ${err.message}`);
        reject(err);
      } else {
        logger.info('Resources table initialized successfully');
        resolve();
      }
    });
  });
};
