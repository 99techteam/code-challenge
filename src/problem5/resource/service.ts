import { db } from '../database';
import { Resource } from './types';
import { v4 as uuidv4 } from 'uuid';

export const getResources = (filter: { name?: string, from?: string, to?: string } = {}): Resource[] => {
  let query = 'SELECT * FROM resources';
  const params: (string | number)[] = [];
  const conditions: string[] = [];

  if (filter.name) {
    conditions.push('name LIKE ?');
    params.push(`%${filter.name}%`);
  }

  if (filter.from) {
    conditions.push('createdAt >= ?');
    params.push(filter.from);
  }

  if (filter.to) {
    conditions.push('createdAt <= ?');
    params.push(filter.to);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  const stmt = db.prepare(query);
  return stmt.all(...params) as Resource[];
};

export const getResourceById = (id: string): Resource | undefined => {
  const stmt = db.prepare('SELECT * FROM resources WHERE id = ?');
  return stmt.get(id) as Resource | undefined;
};

export const createResource = (data: Omit<Resource, 'id' | 'createdAt' | 'updatedAt'>): Resource => {
  const now = new Date();
  const newResource: Resource = {
    id: uuidv4(),
    name: data.name,
    description: data.description,
    createdAt: now,
    updatedAt: now,
  };

  const stmt = db.prepare('INSERT INTO resources (id, name, description, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)');
  stmt.run(newResource.id, newResource.name, newResource.description, newResource.createdAt.toISOString(), newResource.updatedAt.toISOString());
  return newResource;
};

export const updateResource = (id: string, data: Partial<Omit<Resource, 'id' | 'createdAt' | 'updatedAt'>>): Resource | undefined => {
  const fields = Object.keys(data);
  if (fields.length === 0) {
    return getResourceById(id);
  }

  const now = new Date().toISOString();
  const setClause = fields.map(field => `${field} = ?`).join(', ');
  const values = fields.map(field => data[field as keyof typeof data]);

  const stmt = db.prepare(`UPDATE resources SET ${setClause}, updatedAt = ? WHERE id = ?`);
  const info = stmt.run(...values, now, id);

  if (info.changes > 0) {
    return getResourceById(id);
  }
  return undefined;
};

export const deleteResource = (id: string): boolean => {
  const stmt = db.prepare('DELETE FROM resources WHERE id = ?');
  const info = stmt.run(id);
  return info.changes > 0;
};
