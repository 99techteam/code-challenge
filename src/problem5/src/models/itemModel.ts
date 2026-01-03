import { randomUUID } from 'crypto';
import db from '../database/db';
import { Item, CreateItemDto, UpdateItemDto, ItemFilters } from '../types/item';

export class ItemModel {
  static create(data: CreateItemDto): Item {
    const id = randomUUID();
    const stmt = db.prepare(`
      INSERT INTO items (id, name, description, status)
      VALUES (?, ?, ?, ?)
    `);
    
    stmt.run(
      id,
      data.name,
      data.description || null,
      data.status || 'active'
    );
    
    return this.findById(id)!;
  }

  static findById(id: string): Item | null {
    const stmt = db.prepare('SELECT * FROM items WHERE id = ?');
    const row = stmt.get(id) as Item | undefined;
    return row || null;
  }

  static findAll(filters: ItemFilters = {}): Item[] {
    let query = 'SELECT * FROM items WHERE 1=1';
    const params: any[] = [];

    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }

    if (filters.search) {
      query += ' AND (name LIKE ? OR description LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm);
    }

    query += ' ORDER BY created_at DESC';

    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);
    }

    if (filters.offset) {
      query += ' OFFSET ?';
      params.push(filters.offset);
    }

    const stmt = db.prepare(query);
    return stmt.all(...params) as Item[];
  }

  static update(id: string, data: UpdateItemDto): Item | null {
    const existing = this.findById(id);
    if (!existing) return null;

    const updates: string[] = [];
    const params: any[] = [];

    if (data.name !== undefined) {
      updates.push('name = ?');
      params.push(data.name);
    }
    if (data.description !== undefined) {
      updates.push('description = ?');
      params.push(data.description);
    }
    if (data.status !== undefined) {
      updates.push('status = ?');
      params.push(data.status);
    }

    if (updates.length === 0) return existing;

    params.push(id);
    const stmt = db.prepare(`
      UPDATE items 
      SET ${updates.join(', ')}
      WHERE id = ?
    `);
    
    stmt.run(...params);
    return this.findById(id);
  }

  static delete(id: string): boolean {
    const stmt = db.prepare('DELETE FROM items WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }
}

