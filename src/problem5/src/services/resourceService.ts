import db from '../database';
import { Resource, ResourceFilters } from '../types';

export class ResourceService {
  /**
   * Create a new resource
   */
  create(resource: Resource): Resource {
    const stmt = db.prepare(`
      INSERT INTO resources (name, description, category, status)
      VALUES (?, ?, ?, ?)
    `);

    const info = stmt.run(
      resource.name,
      resource.description || null,
      resource.category || null,
      resource.status || 'active'
    );

    return this.getById(Number(info.lastInsertRowid))!;
  }

  /**
   * List resources with optional filters
   */
  list(filters: ResourceFilters = {}): Resource[] {
    let query = 'SELECT * FROM resources WHERE 1=1';
    const params: any[] = [];

    // Apply filters
    if (filters.category) {
      query += ' AND category = ?';
      params.push(filters.category);
    }

    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }

    if (filters.search) {
      query += ' AND (name LIKE ? OR description LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    // Order by most recent first
    query += ' ORDER BY created_at DESC';

    // Pagination
    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);
    }

    if (filters.offset) {
      query += ' OFFSET ?';
      params.push(filters.offset);
    }

    const stmt = db.prepare(query);
    return stmt.all(...params) as Resource[];
  }

  /**
   * Get a resource by ID
   */
  getById(id: number): Resource | undefined {
    const stmt = db.prepare('SELECT * FROM resources WHERE id = ?');
    return stmt.get(id) as Resource | undefined;
  }

  /**
   * Update a resource
   */
  update(id: number, resource: Partial<Resource>): Resource | null {
    const existing = this.getById(id);
    if (!existing) {
      return null;
    }

    const updates: string[] = [];
    const params: any[] = [];

    if (resource.name !== undefined) {
      updates.push('name = ?');
      params.push(resource.name);
    }

    if (resource.description !== undefined) {
      updates.push('description = ?');
      params.push(resource.description);
    }

    if (resource.category !== undefined) {
      updates.push('category = ?');
      params.push(resource.category);
    }

    if (resource.status !== undefined) {
      updates.push('status = ?');
      params.push(resource.status);
    }

    if (updates.length === 0) {
      return existing;
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    const query = `UPDATE resources SET ${updates.join(', ')} WHERE id = ?`;
    const stmt = db.prepare(query);
    stmt.run(...params);

    return this.getById(id)!;
  }

  /**
   * Delete a resource
   */
  delete(id: number): boolean {
    const stmt = db.prepare('DELETE FROM resources WHERE id = ?');
    const info = stmt.run(id);
    return info.changes > 0;
  }

  /**
   * Get total count with filters (for pagination)
   */
  count(filters: ResourceFilters = {}): number {
    let query = 'SELECT COUNT(*) as count FROM resources WHERE 1=1';
    const params: any[] = [];

    if (filters.category) {
      query += ' AND category = ?';
      params.push(filters.category);
    }

    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }

    if (filters.search) {
      query += ' AND (name LIKE ? OR description LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    const stmt = db.prepare(query);
    const result = stmt.get(...params) as { count: number };
    return result.count;
  }
}

