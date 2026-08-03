import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { DatabaseSync } from "node:sqlite";

export class Database {
  private readonly connection: DatabaseSync;

  public constructor(path: string) {
    if (path !== ":memory:") {
      mkdirSync(dirname(path), { recursive: true });
    }

    this.connection = new DatabaseSync(path);
    this.connection.exec("PRAGMA foreign_keys = ON");
    this.connection.exec("PRAGMA busy_timeout = 5000");

    if (path !== ":memory:") {
      this.connection.exec("PRAGMA journal_mode = WAL");
    }

    this.migrate();
  }

  public prepare(sql: string): ReturnType<DatabaseSync["prepare"]> {
    return this.connection.prepare(sql);
  }

  public exec(sql: string): void {
    this.connection.exec(sql);
  }

  public transaction<T>(operation: () => T): T {
    this.connection.exec("BEGIN IMMEDIATE");

    try {
      const result = operation();
      this.connection.exec("COMMIT");
      return result;
    } catch (error) {
      this.connection.exec("ROLLBACK");
      throw error;
    }
  }

  public close(): void {
    this.connection.close();
  }

  private hasMigration(version: number): boolean {
    const row = this.connection
      .prepare("SELECT version FROM schema_migrations WHERE version = ?")
      .get(version) as { version: number } | undefined;

    return row !== undefined;
  }

  private recordMigration(version: number): void {
    this.connection
      .prepare(
        "INSERT INTO schema_migrations(version, applied_at) VALUES (?, ?)",
      )
      .run(version, new Date().toISOString());
  }

  private migrate(): void {
    this.connection.exec(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version INTEGER PRIMARY KEY,
        applied_at TEXT NOT NULL
      );
    `);

    if (!this.hasMigration(1)) {
      this.transaction(() => {
        this.connection.exec(`
          CREATE TABLE IF NOT EXISTS tasks (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL CHECK(length(title) BETWEEN 1 AND 120),
            description TEXT,
            status TEXT NOT NULL CHECK(status IN ('TODO', 'IN_PROGRESS', 'DONE')),
            priority TEXT NOT NULL CHECK(priority IN ('LOW', 'MEDIUM', 'HIGH')),
            due_date TEXT,
            version INTEGER NOT NULL DEFAULT 1 CHECK(version >= 1),
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
          );

          CREATE INDEX IF NOT EXISTS idx_tasks_status
            ON tasks(status);
          CREATE INDEX IF NOT EXISTS idx_tasks_priority
            ON tasks(priority);
          CREATE INDEX IF NOT EXISTS idx_tasks_due_date
            ON tasks(due_date);
          CREATE INDEX IF NOT EXISTS idx_tasks_created_at
            ON tasks(created_at);

          CREATE TABLE IF NOT EXISTS task_audit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            trace_id TEXT NOT NULL,
            action TEXT NOT NULL
              CHECK(action IN ('CREATE', 'UPDATE', 'DELETE')),
            task_id TEXT NOT NULL,
            before_json TEXT,
            after_json TEXT,
            created_at TEXT NOT NULL
          );

          CREATE INDEX IF NOT EXISTS idx_task_audit_task_id
            ON task_audit_logs(task_id);
          CREATE INDEX IF NOT EXISTS idx_task_audit_trace_id
            ON task_audit_logs(trace_id);
          CREATE INDEX IF NOT EXISTS idx_task_audit_created_at
            ON task_audit_logs(created_at);
        `);

        this.recordMigration(1);
      });
    }

    if (!this.hasMigration(2)) {
      this.transaction(() => {
        this.connection.exec(`
          CREATE TABLE IF NOT EXISTS trouble_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            request_id TEXT NOT NULL,
            method TEXT NOT NULL,
            path TEXT NOT NULL,
            status_code INTEGER NOT NULL,
            error_code TEXT NOT NULL,
            message TEXT NOT NULL,
            details_json TEXT,
            stack TEXT,
            duration_ms INTEGER NOT NULL CHECK(duration_ms >= 0),
            created_at TEXT NOT NULL
          );

          CREATE INDEX IF NOT EXISTS idx_trouble_request_id
            ON trouble_logs(request_id);
          CREATE INDEX IF NOT EXISTS idx_trouble_error_code
            ON trouble_logs(error_code);
          CREATE INDEX IF NOT EXISTS idx_trouble_status_code
            ON trouble_logs(status_code);
          CREATE INDEX IF NOT EXISTS idx_trouble_created_at
            ON trouble_logs(created_at);
        `);

        this.recordMigration(2);
      });
    }
  }
}
