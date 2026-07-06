import db from '../db/connection';
import { Item, ListQuery } from '../models';

type WhereParts = { clause: string; values: unknown[] };

function buildWhereClause(filters: ListQuery): WhereParts {
  const parts: string[] = [];
  const values: unknown[] = [];

  if (filters.category) {
    parts.push('category = ?');
    values.push(filters.category);
  }
  if (filters.status) {
    parts.push('status = ?');
    values.push(filters.status);
  }
  if (filters.search) {
    parts.push('(name LIKE ? OR description LIKE ?)');
    const pattern = `%${filters.search}%`;
    values.push(pattern, pattern);
  }

  const clause = parts.length ? ` AND ${parts.join(' AND ')}` : '';
  return { clause, values };
}

export function insertItem(item: Item): Item {
  const stmt = db.prepare(`
    INSERT INTO resources (name, description, category, status)
    VALUES (?, ?, ?, ?)
  `);

  const result = stmt.run(
    item.name,
    item.description ?? null,
    item.category ?? null,
    item.status ?? 'active'
  );

  return findById(Number(result.lastInsertRowid))!;
}

export function findById(id: number): Item | undefined {
  const row = db.prepare('SELECT * FROM resources WHERE id = ?').get(id);
  return row as Item | undefined;
}

export function findMany(filters: ListQuery = {}): Item[] {
  const { clause, values } = buildWhereClause(filters);
  let sql = `SELECT * FROM resources WHERE 1=1${clause} ORDER BY created_at DESC`;

  if (filters.limit !== undefined) {
    sql += ' LIMIT ?';
    values.push(filters.limit);
  }
  if (filters.offset !== undefined) {
    sql += ' OFFSET ?';
    values.push(filters.offset);
  }

  return db.prepare(sql).all(...values) as Item[];
}

export function countMatching(filters: ListQuery = {}): number {
  const { clause, values } = buildWhereClause(filters);
  const row = db
    .prepare(`SELECT COUNT(*) as count FROM resources WHERE 1=1${clause}`)
    .get(...values) as { count: number };
  return row.count;
}

export function patchItem(id: number, patch: Partial<Item>): Item | null {
  const current = findById(id);
  if (!current) return null;

  const assignments: string[] = [];
  const values: unknown[] = [];

  for (const key of ['name', 'description', 'category', 'status'] as const) {
    if (patch[key] !== undefined) {
      assignments.push(`${key} = ?`);
      values.push(patch[key]);
    }
  }

  if (assignments.length === 0) return current;

  assignments.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id);

  db.prepare(`UPDATE resources SET ${assignments.join(', ')} WHERE id = ?`).run(...values);
  return findById(id)!;
}

export function removeItem(id: number): boolean {
  const result = db.prepare('DELETE FROM resources WHERE id = ?').run(id);
  return result.changes > 0;
}
