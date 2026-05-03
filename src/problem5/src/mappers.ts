import type { Resource, ResourceRow } from "./types.js";

export function rowToResource(row: ResourceRow): Resource {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
