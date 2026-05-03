import Database, { type Database as SqliteDB } from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { logger } from "../logger.js";

/**
 * SQLite connection factory.
 */
export type DB = SqliteDB;

export function openDatabase(filePath: string): DB {
  if (filePath !== ":memory:") {
    mkdirSync(dirname(filePath), { recursive: true });
  }
  const db = new Database(filePath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.pragma("busy_timeout = 5000");
  logger.debug({ filePath }, "sqlite connection opened");
  return db;
}
