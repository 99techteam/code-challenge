import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

import { ResourceCreateInput, ResourceListFilters, ResourceRecord, ResourceStatus, ResourceUpdateInput } from './types';

const DATA_DIR = path.resolve(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'resources.sqlite');

function ensureDataDirectory(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

ensureDataDirectory();

const db = new Database(DB_FILE);
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS resources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'draft',
    tags TEXT NOT NULL DEFAULT '[]',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
`);

interface ResourceRow {
  id: number;
  title: string;
  description: string;
  status: ResourceStatus;
  tags: string;
  created_at: string;
  updated_at: string;
}

function mapRow(row: ResourceRow): ResourceRecord {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    tags: JSON.parse(row.tags) as string[],
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

const insertResourceStmt = db.prepare(`
  INSERT INTO resources (title, description, status, tags, created_at, updated_at)
  VALUES (@title, @description, @status, @tags, @createdAt, @updatedAt)
`);

const selectByIdStmt = db.prepare<ResourceRow>('SELECT * FROM resources WHERE id = ?');

const deleteByIdStmt = db.prepare('DELETE FROM resources WHERE id = ?');

export function createResource(payload: ResourceCreateInput): ResourceRecord {
  const now = new Date().toISOString();
  const info = insertResourceStmt.run({
    title: payload.title,
    description: payload.description ?? '',
    status: payload.status ?? 'draft',
    tags: JSON.stringify(payload.tags ?? []),
    createdAt: now,
    updatedAt: now
  });

  return getResourceById(Number(info.lastInsertRowid))!;
}

export function getResourceById(id: number): ResourceRecord | null {
  const row = selectByIdStmt.get(id) as ResourceRow | undefined;
  if (!row) {
    return null;
  }

  return mapRow(row);
}

export function listResources(filters: ResourceListFilters): ResourceRecord[] {
  const whereClauses: string[] = [];
  const params: Record<string, unknown> = {};

  if (filters.status) {
    whereClauses.push('status = @status');
    params.status = filters.status;
  }

  if (filters.q) {
    whereClauses.push('(title LIKE @q OR description LIKE @q)');
    params.q = `%${filters.q}%`;
  }

  if (filters.tag) {
    whereClauses.push('tags LIKE @tagPattern');
    params.tagPattern = `%"${filters.tag}"%`;
  }

  const limit = filters.limit ?? 50;
  const offset = filters.offset ?? 0;

  params.limit = limit;
  params.offset = offset;

  const sql = `
    SELECT *
    FROM resources
    ${whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : ''}
    ORDER BY created_at DESC
    LIMIT @limit OFFSET @offset
  `;

  const stmt = db.prepare<ResourceRow>(sql);
  const rows = stmt.all(params) as unknown as ResourceRow[];

  return rows.map(mapRow);
}

export function updateResource(id: number, changes: ResourceUpdateInput): ResourceRecord | null {
  const sets: string[] = [];
  const params: Record<string, unknown> = { id };

  if (changes.title !== undefined) {
    sets.push('title = @title');
    params.title = changes.title;
  }

  if (changes.description !== undefined) {
    sets.push('description = @description');
    params.description = changes.description;
  }

  if (changes.status !== undefined) {
    sets.push('status = @status');
    params.status = changes.status;
  }

  if (changes.tags !== undefined) {
    sets.push('tags = @tags');
    params.tags = JSON.stringify(changes.tags);
  }

  if (sets.length === 0) {
    return getResourceById(id);
  }

  const updatedAt = new Date().toISOString();
  sets.push('updated_at = @updatedAt');
  params.updatedAt = updatedAt;

  const stmt = db.prepare(`
    UPDATE resources
    SET ${sets.join(', ')}
    WHERE id = @id
  `);

  const result = stmt.run(params);

  if (result.changes === 0) {
    return null;
  }

  return getResourceById(id);
}

export function deleteResource(id: number): boolean {
  const result = deleteByIdStmt.run(id);
  return result.changes > 0;
}

