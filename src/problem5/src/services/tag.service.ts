import type { Tag } from "@/interfaces/tag.interface.js";
import { execute, query, queryOne } from "@/utils.js";

export function createTag(name: string) {
  execute(
    `INSERT OR IGNORE INTO tags (name) VALUES (?)`,
    [name]
  );

  return getTagByName(name);
}

export function getTagByName(name: string) {
  return queryOne<Tag>(
    `SELECT id, name FROM tags WHERE name = ?`,
    [name]
  );
}

export function getOrCreateTag(name: string) {
  const existing = getTagByName(name);
  if (existing) return existing;

  execute(`INSERT INTO tags (name) VALUES (?)`, [name]);
  return getTagByName(name);
}

export function listTags() {
  return query<Tag>(
    `SELECT id, name FROM tags ORDER BY name ASC`,
    []
  );
}