import { db } from '../config/database';
import { Resource, ResourceFilters, CreateResourceDTO, UpdateResourceDTO } from '../types/resource';

export class ResourceModel {
  // Create a new resource
  static create(data: CreateResourceDTO): Promise<Resource> {
    return new Promise((resolve, reject) => {
      const { name, description, category, status } = data;
      const sql = `
        INSERT INTO resources (name, description, category, status)
        VALUES (?, ?, ?, ?)
      `;

      db.run(sql, [name, description || null, category || null, status || 'active'], function(err) {
        if (err) {
          reject(err);
        } else {
          ResourceModel.findById(this.lastID)
            .then(resolve)
            .catch(reject);
        }
      });
    });
  }

  // Find all resources with optional filters
  static findAll(filters: ResourceFilters = {}): Promise<Resource[]> {
    return new Promise((resolve, reject) => {
      let sql = 'SELECT * FROM resources WHERE 1=1';
      const params: any[] = [];

      // Apply filters
      if (filters.name) {
        sql += ' AND name LIKE ?';
        params.push(`%${filters.name}%`);
      }

      if (filters.category) {
        sql += ' AND category = ?';
        params.push(filters.category);
      }

      if (filters.status) {
        sql += ' AND status = ?';
        params.push(filters.status);
      }

      sql += ' ORDER BY created_at DESC';

      // Apply pagination
      if (filters.limit) {
        sql += ' LIMIT ?';
        params.push(filters.limit);
      }

      if (filters.offset) {
        sql += ' OFFSET ?';
        params.push(filters.offset);
      }

      db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows as Resource[]);
        }
      });
    });
  }

  // Find a resource by ID
  static findById(id: number): Promise<Resource> {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM resources WHERE id = ?';

      db.get(sql, [id], (err, row) => {
        if (err) {
          reject(err);
        } else if (!row) {
          reject(new Error('Resource not found'));
        } else {
          resolve(row as Resource);
        }
      });
    });
  }

  // Update a resource
  static update(id: number, data: UpdateResourceDTO): Promise<Resource> {
    return new Promise((resolve, reject) => {
      const fields: string[] = [];
      const params: any[] = [];

      if (data.name !== undefined) {
        fields.push('name = ?');
        params.push(data.name);
      }

      if (data.description !== undefined) {
        fields.push('description = ?');
        params.push(data.description);
      }

      if (data.category !== undefined) {
        fields.push('category = ?');
        params.push(data.category);
      }

      if (data.status !== undefined) {
        fields.push('status = ?');
        params.push(data.status);
      }

      if (fields.length === 0) {
        return reject(new Error('No fields to update'));
      }

      fields.push('updated_at = CURRENT_TIMESTAMP');
      params.push(id);

      const sql = `UPDATE resources SET ${fields.join(', ')} WHERE id = ?`;

      db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else if (this.changes === 0) {
          reject(new Error('Resource not found'));
        } else {
          ResourceModel.findById(id)
            .then(resolve)
            .catch(reject);
        }
      });
    });
  }

  // Delete a resource
  static delete(id: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const sql = 'DELETE FROM resources WHERE id = ?';

      db.run(sql, [id], function(err) {
        if (err) {
          reject(err);
        } else if (this.changes === 0) {
          reject(new Error('Resource not found'));
        } else {
          resolve();
        }
      });
    });
  }

  // Count total resources (useful for pagination)
  static count(filters: ResourceFilters = {}): Promise<number> {
    return new Promise((resolve, reject) => {
      let sql = 'SELECT COUNT(*) as count FROM resources WHERE 1=1';
      const params: any[] = [];

      if (filters.name) {
        sql += ' AND name LIKE ?';
        params.push(`%${filters.name}%`);
      }

      if (filters.category) {
        sql += ' AND category = ?';
        params.push(filters.category);
      }

      if (filters.status) {
        sql += ' AND status = ?';
        params.push(filters.status);
      }

      db.get(sql, params, (err, row: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(row.count);
        }
      });
    });
  }
}
