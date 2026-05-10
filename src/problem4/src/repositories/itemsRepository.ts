import { randomUUID } from "node:crypto";
import { db } from "../db.js";
import type { ItemRow } from "../types/item.js";

export interface CreateItemInput {
  name: string;
  description?: string;
  category?: string;
}

export interface UpdateItemInput {
  name?: string;
  description?: string;
  category?: string;
}

export interface ListItemsFilters {
  category?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

const insertStmt = db.prepare(
  `INSERT INTO items (id, name, description, category, created_at, updated_at)
   VALUES (?, ?, ?, ?, ?, ?)`,
);

const selectById = db.prepare(`SELECT * FROM items WHERE id = ?`);

export const createItem = (input: CreateItemInput): ItemRow => {
  const now = new Date().toISOString();
  const id = randomUUID();
  const name = input.name.trim();
  const description = (input.description ?? "").trim();
  const category = (input.category ?? "general").trim() || "general";
  insertStmt.run(id, name, description, category, now, now);
  const row = selectById.get(id) as ItemRow | undefined;
  if (!row) {
    throw new Error("Failed to read created item");
  }
  return row;
};

export const getItemById = (id: string): ItemRow | undefined =>
  selectById.get(id) as ItemRow | undefined;

export const listItems = (filters: ListItemsFilters): ItemRow[] => {
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (filters.category) {
    conditions.push("category = ?");
    params.push(filters.category.trim());
  }

  if (filters.search) {
    const term = `%${filters.search.trim()}%`;
    conditions.push("(name LIKE ? OR description LIKE ?)");
    params.push(term, term);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const limit = Math.min(Math.max(filters.limit ?? 50, 1), 200);
  const offset = Math.max(filters.offset ?? 0, 0);

  const sql = `SELECT * FROM items ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`;
  const stmt = db.prepare(sql);
  return stmt.all(...params, limit, offset) as ItemRow[];
};

const updateStmt = db.prepare(
  `UPDATE items SET
     name = COALESCE(?, name),
     description = COALESCE(?, description),
     category = COALESCE(?, category),
     updated_at = ?
   WHERE id = ?`,
);

export const updateItem = (id: string, input: UpdateItemInput): ItemRow | undefined => {
  const existing = selectById.get(id);
  if (!existing) {
    return undefined;
  }
  const name = input.name !== undefined ? input.name.trim() : null;
  const description = input.description !== undefined ? input.description.trim() : null;
  const category =
    input.category !== undefined ? (input.category.trim() || "general") : null;
  const updatedAt = new Date().toISOString();
  updateStmt.run(name, description, category, updatedAt, id);
  return selectById.get(id) as ItemRow | undefined;
};

const deleteStmt = db.prepare(`DELETE FROM items WHERE id = ?`);

export const deleteItem = (id: string): boolean => {
  const result = deleteStmt.run(id);
  return result.changes > 0;
};
