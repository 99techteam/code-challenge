import * as db from '../database';
import { Resource } from '../types';

export async function createResource(name: string, description?: string, category?: string, status?: string): Promise<{ id: number }> {
   const result = await db.run(`
      INSERT INTO resources (name, description, category, status) 
      VALUES (?, ?, ?, ?);
    `,
    [name, description, category, status]
    );
  return { id: result.id };
}

export async function listResources(query: string, params: any[], limit: number, offset: number): Promise<{ data: Resource[]; total: number }> {
    const count_result = await db.get(
      query.replace('SELECT *', 'SELECT COUNT(*) as count'),
      params
    );
    const total = count_result?.count || 0;

    query += ' ORDER BY createdAt DESC LIMIT ? OFFSET ?';
    
    params.push(limit, offset);

    const data = await db.all(query, params);

    return { data, total };
}

export async function getResourceById(id: number): Promise<Resource> {
    const resource = await db.get('SELECT * FROM resources WHERE id = ?', [id]);
    return resource;
}

export async function updateResource(id: number, updates: { fields: string[], params: any[] }): Promise<void> {
    updates.params.push(id);
    const query = `UPDATE resources SET ${updates.fields.join(', ')} WHERE id = ?`;
    await db.run(query, updates.params);
}

export async function deleteResource(id: number): Promise<void> {
    await db.run('DELETE FROM resources WHERE id = ?', [id]);
}
