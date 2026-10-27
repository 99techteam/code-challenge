import { DatabaseSync } from 'node:sqlite';

export type Task = { id: number; title: string; description: string; status: 'todo' | 'in_progress' | 'done'; createdAt: string; updatedAt: string };
export type TaskInput = Pick<Task, 'title' | 'description' | 'status'>;
type Row = { id: number; title: string; description: string; status: Task['status']; created_at: string; updated_at: string };

function toTask(row: Row): Task {
  return { id: row.id, title: row.title, description: row.description, status: row.status, createdAt: row.created_at, updatedAt: row.updated_at };
}

export class TaskStore {
  private readonly db: DatabaseSync;
  constructor(path: string) {
    this.db = new DatabaseSync(path);
    this.db.exec(`CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL CHECK (status IN ('todo', 'in_progress', 'done')),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );`);
  }
  close(): void { this.db.close(); }
  create(input: TaskInput): Task {
    const now = new Date().toISOString();
    const result = this.db.prepare('INSERT INTO tasks (title, description, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?)').run(input.title, input.description, input.status, now, now);
    return this.get(Number(result.lastInsertRowid))!;
  }
  get(id: number): Task | null {
    const row = this.db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as Row | undefined;
    return row ? toTask(row) : null;
  }
  list({ status, q, page, limit }: { status?: Task['status']; q?: string; page: number; limit: number }): { data: Task[]; total: number } {
    const where: string[] = [];
    const values: (string | number)[] = [];
    if (status) { where.push('status = ?'); values.push(status); }
    if (q) {
      where.push("title LIKE ? ESCAPE '\\' COLLATE NOCASE");
      values.push(`%${q.replace(/[\\%_]/g, '\\$&')}%`);
    }
    const predicate = where.length ? ` WHERE ${where.join(' AND ')}` : '';
    const total = (this.db.prepare(`SELECT COUNT(*) AS count FROM tasks${predicate}`).get(...values) as { count: number }).count;
    const rows = this.db.prepare(`SELECT * FROM tasks${predicate} ORDER BY id DESC LIMIT ? OFFSET ?`).all(...values, limit, (page - 1) * limit) as Row[];
    return { data: rows.map(toTask), total };
  }
  update(id: number, changes: Partial<TaskInput>): Task | null {
    const existing = this.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...changes };
    this.db.prepare('UPDATE tasks SET title = ?, description = ?, status = ?, updated_at = ? WHERE id = ?')
      .run(updated.title, updated.description, updated.status, new Date().toISOString(), id);
    return this.get(id);
  }
  delete(id: number): boolean {
    return this.db.prepare('DELETE FROM tasks WHERE id = ?').run(id).changes > 0;
  }
}
