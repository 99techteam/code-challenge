import { database } from '../database.js';
import { NotFoundError } from '../errors/app-error.js';
import type {
  CreateResourceInput,
  Resource,
  ResourceFields,
  ResourceListQuery,
  ResourceListResponse,
  ResourceRow,
  UpdateResourceInput,
} from '../types/resource.js';

function toResource(row: ResourceRow): Resource {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    category: row.category,
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
  };
}

function escapeLike(value: string): string {
  return value.replace(/[!%_]/g, (character) => `!${character}`);
}

export async function createResource(input: CreateResourceInput): Promise<Resource> {
  const { rows } = await database.query<ResourceRow>(
    `INSERT INTO resources (name, description, category)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [input.name, input.description, input.category],
  );
  return toResource(rows[0]);
}

export async function listResources(query: ResourceListQuery): Promise<ResourceListResponse> {
  const conditions: string[] = [];
  const filterValues: string[] = [];

  if (query.name) {
    filterValues.push(`%${escapeLike(query.name)}%`);
    conditions.push(`name ILIKE $${filterValues.length} ESCAPE '!'`);
  }
  if (query.category) {
    filterValues.push(query.category);
    conditions.push(`category = $${filterValues.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const { rows } = await database.query<ResourceRow>(
    `SELECT * FROM resources ${where} ORDER BY id DESC LIMIT $${filterValues.length + 1} OFFSET $${filterValues.length + 2}`,
    [...filterValues, query.limit, query.offset],
  );
  return { data: rows.map(toResource), limit: query.limit, offset: query.offset };
}

export async function getResourceById(id: number): Promise<Resource> {
  const { rows } = await database.query<ResourceRow>('SELECT * FROM resources WHERE id = $1', [id]);
  if (!rows[0]) throw new NotFoundError();
  return toResource(rows[0]);
}

export async function updateResource(id: number, input: UpdateResourceInput): Promise<Resource> {
  const current = await getResourceById(id);
  const next: ResourceFields = {
    name: input.name ?? current.name,
    description: input.description ?? current.description,
    category: input.category ?? current.category,
  };
  const { rows } = await database.query<ResourceRow>(
    `UPDATE resources
     SET name = $1, description = $2, category = $3, updated_at = NOW()
     WHERE id = $4
     RETURNING *`,
    [next.name, next.description, next.category, id],
  );
  if (!rows[0]) throw new NotFoundError();
  return toResource(rows[0]);
}

export async function deleteResource(id: number): Promise<void> {
  const result = await database.query('DELETE FROM resources WHERE id = $1', [id]);
  if (!result.rowCount) throw new NotFoundError();
}
