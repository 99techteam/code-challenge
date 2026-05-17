import { randomUUID } from "node:crypto";
import db from "../db/index.ts";
import type {
  CreateResourceInput,
  ListResourcesQuery,
  ResourceStatus,
  UpdateResourceInput,
} from "../schemas/resource.ts";

export type Resource = {
  id: string;
  name: string;
  description: string | null;
  status: ResourceStatus;
  createdAt: string;
  updatedAt: string;
};

type ResourceRow = {
  id: string;
  name: string;
  description: string | null;
  status: ResourceStatus;
  created_at: string;
  updated_at: string;
};

const mapRow = (row: ResourceRow): Resource => ({
  id: row.id,
  name: row.name,
  description: row.description,
  status: row.status,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export function createResource(input: CreateResourceInput): Resource {
  const id = randomUUID();
  const now = new Date().toISOString();
  const row = {
    $id: id,
    $name: input.name,
    $description: input.description ?? null,
    $status: input.status,
    $created_at: now,
    $updated_at: now,
  };
  db.prepare(
    `INSERT INTO resources (id, name, description, status, created_at, updated_at)
     VALUES ($id, $name, $description, $status, $created_at, $updated_at)`,
  ).run(row);
  return mapRow({
    id: row.$id,
    name: row.$name,
    description: row.$description,
    status: row.$status,
    created_at: row.$created_at,
    updated_at: row.$updated_at,
  });
}

export function getResource(id: string): Resource | null {
  const row = db
    .prepare<ResourceRow, [string]>(`SELECT * FROM resources WHERE id = ?`)
    .get(id);
  return row ? mapRow(row) : null;
}

export function listResources(query: ListResourcesQuery): {
  items: Resource[];
  total: number;
  limit: number;
  offset: number;
} {
  const where: string[] = [];
  const params: Record<string, string> = {};

  if (query.status) {
    where.push("status = $status");
    params.$status = query.status;
  }
  if (query.q) {
    where.push("(name LIKE $q OR description LIKE $q)");
    params.$q = `%${query.q}%`;
  }

  const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const totalRow = db
    .prepare<{ count: number }, Record<string, string>>(
      `SELECT COUNT(*) AS count FROM resources ${whereClause}`,
    )
    .get(params);
  const total = totalRow?.count ?? 0;

  const rows = db
    .prepare<ResourceRow, Record<string, string | number>>(
      `SELECT * FROM resources ${whereClause}
       ORDER BY created_at DESC
       LIMIT $limit OFFSET $offset`,
    )
    .all({ ...params, $limit: query.limit, $offset: query.offset });

  return {
    items: rows.map(mapRow),
    total,
    limit: query.limit,
    offset: query.offset,
  };
}

export function updateResource(
  id: string,
  input: UpdateResourceInput,
): Resource | null {
  const existing = getResource(id);
  if (!existing) return null;

  const next: Resource = {
    ...existing,
    name: input.name ?? existing.name,
    description:
      input.description === undefined ? existing.description : input.description,
    status: input.status ?? existing.status,
    updatedAt: new Date().toISOString(),
  };

  db.prepare(
    `UPDATE resources
     SET name = $name,
         description = $description,
         status = $status,
         updated_at = $updated_at
     WHERE id = $id`,
  ).run({
    $id: id,
    $name: next.name,
    $description: next.description,
    $status: next.status,
    $updated_at: next.updatedAt,
  });

  return next;
}

export function deleteResource(id: string): boolean {
  const result = db.prepare(`DELETE FROM resources WHERE id = ?`).run(id);
  return result.changes > 0;
}
