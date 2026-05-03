import type Database from "better-sqlite3";
import type {
  CreateResourceInput,
  ListResourcesQuery,
  ResourceRow,
  UpdateResourceInput,
} from "./types.js";

export class ResourceRepository {
  constructor(private readonly db: Database.Database) {}

  create(input: CreateResourceInput): ResourceRow {
    const status = input.status ?? "draft";
    const stmt = this.db.prepare(`
      INSERT INTO resources (title, description, status)
      VALUES (@title, @description, @status)
      RETURNING id, title, description, status, created_at, updated_at
    `);
    return stmt.get({
      title: input.title,
      description: input.description ?? null,
      status,
    }) as ResourceRow;
  }

  findById(id: number): ResourceRow | undefined {
    const stmt = this.db.prepare(`
      SELECT id, title, description, status, created_at, updated_at
      FROM resources WHERE id = ?
    `);
    return stmt.get(id) as ResourceRow | undefined;
  }

  list(filters: ListResourcesQuery): ResourceRow[] {
    const conditions: string[] = [];
    const params: Record<string, string | number> = {};

    if (filters.status) {
      conditions.push("status = @status");
      params.status = filters.status;
    }
    if (filters.q && filters.q.trim() !== "") {
      conditions.push(
        "(title LIKE @q OR IFNULL(description, '') LIKE @q)"
      );
      params.q = `%${filters.q.trim()}%`;
    }

    const where =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const limit = Math.min(Math.max(filters.limit ?? 50, 1), 200);
    const offset = Math.max(filters.offset ?? 0, 0);

    const sql = `
      SELECT id, title, description, status, created_at, updated_at
      FROM resources
      ${where}
      ORDER BY id DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    const stmt = this.db.prepare(sql);
    return stmt.all(params) as ResourceRow[];
  }

  update(id: number, input: UpdateResourceInput): ResourceRow | undefined {
    const existing = this.findById(id);
    if (!existing) return undefined;

    const title = input.title ?? existing.title;
    const description =
      input.description !== undefined ? input.description : existing.description;
    const status = input.status ?? existing.status;

    const stmt = this.db.prepare(`
      UPDATE resources
      SET title = @title,
          description = @description,
          status = @status,
          updated_at = datetime('now')
      WHERE id = @id
      RETURNING id, title, description, status, created_at, updated_at
    `);
    return stmt.get({
      id,
      title,
      description,
      status,
    }) as ResourceRow | undefined;
  }

  delete(id: number): boolean {
    const stmt = this.db.prepare(`DELETE FROM resources WHERE id = ?`);
    const result = stmt.run(id);
    return result.changes > 0;
  }
}
