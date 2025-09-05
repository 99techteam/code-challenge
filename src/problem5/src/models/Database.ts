/**
 * Database connection and operations
 */

import sqlite3 from "sqlite3";
import { promisify } from "util";
import { DatabaseConfig } from "../types";

export class Database {
  private db: sqlite3.Database;

  constructor(config: DatabaseConfig) {
    this.db = new sqlite3.Database(config.path);
  }

  /**
   * Initialize database and create tables
   */
  public async initialize(): Promise<void> {
    const run = promisify(this.db.run.bind(this.db));

    await run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        age INTEGER NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("✅ Database initialized successfully");
  }

  /**
   * Get a single record
   */
  public async get<T>(sql: string, params: any[] = []): Promise<T | undefined> {
    const get = promisify(this.db.get.bind(this.db));
    return await get(sql, params);
  }

  /**
   * Get multiple records
   */
  public async all<T>(sql: string, params: any[] = []): Promise<T[]> {
    const all = promisify(this.db.all.bind(this.db));
    return await all(sql, params);
  }

  /**
   * Execute a query
   */
  public async run(
    sql: string,
    params: any[] = []
  ): Promise<{ lastID: number; changes: number }> {
    return new Promise((resolve, reject) => {
      this.db.run(
        sql,
        params,
        function (this: sqlite3.RunResult, err: Error | null) {
          if (err) {
            reject(err);
          } else {
            resolve({
              lastID: this.lastID,
              changes: this.changes,
            });
          }
        }
      );
    });
  }

  /**
   * Close database connection
   */
  public async close(): Promise<void> {
    const close = promisify(this.db.close.bind(this.db));
    await close();
  }
}
