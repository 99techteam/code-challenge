/**
 * Database configuration and connection for Scoreboard System
 */

import sqlite3 from "sqlite3";
import { DatabaseConfig } from "../types";

export class Database {
  private db: sqlite3.Database;
  private config: DatabaseConfig;

  constructor(config: DatabaseConfig) {
    this.config = config;
    this.db = new sqlite3.Database(config.path);
  }

  /**
   * Initialize database tables
   */
  public async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const createUsersTable = `
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          username TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          isActive BOOLEAN DEFAULT 1,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `;

      const createScoresTable = `
        CREATE TABLE IF NOT EXISTS scores (
          id TEXT PRIMARY KEY,
          userId TEXT NOT NULL,
          username TEXT NOT NULL,
          score INTEGER NOT NULL,
          action TEXT NOT NULL,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          isValidated BOOLEAN DEFAULT 0,
          FOREIGN KEY (userId) REFERENCES users (id)
        )
      `;

      const createIndexes = `
        CREATE INDEX IF NOT EXISTS idx_scores_user_id ON scores(userId);
        CREATE INDEX IF NOT EXISTS idx_scores_score ON scores(score DESC);
        CREATE INDEX IF NOT EXISTS idx_scores_timestamp ON scores(timestamp);
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
      `;

      this.db.serialize(() => {
        this.db.run(createUsersTable, (err) => {
          if (err) {
            reject(err);
            return;
          }
        });

        this.db.run(createScoresTable, (err) => {
          if (err) {
            reject(err);
            return;
          }
        });

        this.db.run(createIndexes, (err) => {
          if (err) {
            reject(err);
            return;
          }
          console.log("✅ Database initialized successfully");
          resolve();
        });
      });
    });
  }

  /**
   * Execute a query with parameters
   */
  public async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows as T[]);
        }
      });
    });
  }

  /**
   * Execute a single query (INSERT, UPDATE, DELETE)
   */
  public async run(
    sql: string,
    params: any[] = []
  ): Promise<sqlite3.RunResult> {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this);
        }
      });
    });
  }

  /**
   * Get a single row
   */
  public async get<T = any>(
    sql: string,
    params: any[] = []
  ): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row as T);
        }
      });
    });
  }

  /**
   * Close database connection
   */
  public async close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          reject(err);
        } else {
          console.log("✅ Database connection closed");
          resolve();
        }
      });
    });
  }

  /**
   * Get database instance
   */
  public getDb(): sqlite3.Database {
    return this.db;
  }
}
