import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';
import initSqlJs, { Database as SqlDatabase, SqlJsStatic } from 'sql.js';
import type { ListTasksQuery, Task, TaskPriority, TaskStatus } from './types';

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'tasks.sqlite');
const SQL_WASM_DIR = path.join(__dirname, '..', 'node_modules', 'sql.js', 'dist');

export interface CreateTaskInput {
  title: string;
  description?: string | undefined;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
}

export interface UpdateTaskInput {
  title?: string | undefined;
  description?: string | undefined;
  status?: TaskStatus | undefined;
  priority?: TaskPriority | undefined;
  dueDate?: string | null | undefined;
}

type SqlParamValue = string | number | null;

class TaskDatabase {
  private sqlInstance?: SqlJsStatic;
  private db?: SqlDatabase;
  private ready: Promise<void>;

  constructor() {
    this.ready = this.initialize();
  }

  private async initialize() {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const SQL = await initSqlJs({
      locateFile: (file: string) => path.join(SQL_WASM_DIR, file)
    });
    this.sqlInstance = SQL;

    const fileBuffer = await fs
      .readFile(DB_FILE)
      .catch(() => Buffer.from([]));

    this.db = fileBuffer.length ? new SQL.Database(fileBuffer) : new SQL.Database();
    this.db.run(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        status TEXT NOT NULL,
        priority TEXT NOT NULL,
        dueDate TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      )
    `);
  }

  private assertDb(): SqlDatabase {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    return this.db;
  }

  private async persist() {
    const db = this.assertDb();
    const data = db.export();
    await fs.writeFile(DB_FILE, Buffer.from(data));
  }

  private rowToTask(row: Record<string, unknown>): Task {
    return {
      id: String(row.id ?? ''),
      title: String(row.title ?? ''),
      description: String(row.description ?? ''),
      status: row.status as TaskStatus,
      priority: row.priority as TaskPriority,
      dueDate: row.dueDate === null || row.dueDate === undefined ? null : String(row.dueDate),
      createdAt: String(row.createdAt ?? ''),
      updatedAt: String(row.updatedAt ?? '')
    };
  }

  async createTask(input: CreateTaskInput): Promise<Task> {
    await this.ready;
    const now = new Date().toISOString();
    const task: Task = {
      id: randomUUID(),
      title: input.title,
      description: input.description ?? '',
      status: input.status,
      priority: input.priority,
      dueDate: input.dueDate,
      createdAt: now,
      updatedAt: now
    };

    const db = this.assertDb();
    const stmt = db.prepare(
      `INSERT INTO tasks (id, title, description, status, priority, dueDate, createdAt, updatedAt)
       VALUES ($id, $title, $description, $status, $priority, $dueDate, $createdAt, $updatedAt)`
    );
    stmt.run({
      $id: task.id,
      $title: task.title,
      $description: task.description,
      $status: task.status,
      $priority: task.priority,
      $dueDate: task.dueDate,
      $createdAt: task.createdAt,
      $updatedAt: task.updatedAt
    });
    stmt.free();
    await this.persist();
    return task;
  }

  async listTasks(query: ListTasksQuery): Promise<{ items: Task[]; total: number }> {
    await this.ready;
    const db = this.assertDb();
    const whereClauses: string[] = [];
    const params: Record<string, SqlParamValue> = {};

    if (query.status) {
      whereClauses.push('status = $status');
      params.$status = query.status;
    }
    if (query.priority) {
      whereClauses.push('priority = $priority');
      params.$priority = query.priority;
    }
    if (query.search) {
      whereClauses.push('(title LIKE $search OR description LIKE $search)');
      params.$search = `%${query.search}%`;
    }

    const where = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';
    const limit = query.limit ?? 20;
    const offset = query.offset ?? 0;

    const listStmt = db.prepare(
      `SELECT * FROM tasks ${where} ORDER BY datetime(createdAt) DESC LIMIT $limit OFFSET $offset`
    );
    listStmt.bind({ ...params, $limit: limit, $offset: offset });

    const items: Task[] = [];
    while (listStmt.step()) {
      items.push(this.rowToTask(listStmt.getAsObject()));
    }
    listStmt.free();

    const countStmt = db.prepare(`SELECT COUNT(*) as count FROM tasks ${where}`);
    countStmt.bind(params);
    let total = 0;
    if (countStmt.step()) {
      const row = countStmt.getAsObject();
      const countValue = row.count;
      total = typeof countValue === 'number' ? countValue : Number(countValue ?? 0);
    }
    countStmt.free();

    return { items, total };
  }

  async getTask(id: string): Promise<Task | null> {
    await this.ready;
    const db = this.assertDb();
    const stmt = db.prepare('SELECT * FROM tasks WHERE id = $id LIMIT 1');
    stmt.bind({ $id: id });
    const task = stmt.step() ? this.rowToTask(stmt.getAsObject()) : null;
    stmt.free();
    return task;
  }

  async updateTask(id: string, input: UpdateTaskInput): Promise<Task | null> {
    await this.ready;
    const db = this.assertDb();
    const task = await this.getTask(id);
    if (!task) return null;

    const updated: Task = {
      ...task,
      title: input.title ?? task.title,
      description: input.description ?? task.description,
      status: input.status ?? task.status,
      priority: input.priority ?? task.priority,
      dueDate: input.dueDate === undefined ? task.dueDate : input.dueDate,
      updatedAt: new Date().toISOString()
    };

    const stmt = db.prepare(
      `UPDATE tasks
       SET title = $title,
           description = $description,
           status = $status,
           priority = $priority,
           dueDate = $dueDate,
           updatedAt = $updatedAt
       WHERE id = $id`
    );
    stmt.run({
      $id: updated.id,
      $title: updated.title,
      $description: updated.description,
      $status: updated.status,
      $priority: updated.priority,
      $dueDate: updated.dueDate,
      $updatedAt: updated.updatedAt
    });
    stmt.free();
    await this.persist();
    return updated;
  }

  async deleteTask(id: string): Promise<boolean> {
    await this.ready;
    const db = this.assertDb();
    const stmt = db.prepare('DELETE FROM tasks WHERE id = $id');
    stmt.run({ $id: id });
    const changes = db.getRowsModified();
    stmt.free();
    if (changes > 0) {
      await this.persist();
      return true;
    }
    return false;
  }
}

export const taskDb = new TaskDatabase();
