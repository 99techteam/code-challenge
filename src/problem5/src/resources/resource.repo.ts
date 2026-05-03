import type { DB } from "../db/connection.js";
import { ValidationError } from "../errors.js";
import type {
  CreateResourceInput,
  ListResourcesQuery,
  Resource,
  UpdateResourceInput,
} from "./resource.schema.js";

/**
 * Resource repository — the only module that speaks SQL.
 *
 * Why parameterised statements only:
 *   - No string interpolation into SQL — defense against injection. All
 *     user-derived values flow through `?` / `@named` placeholders.
 *
 * Why prepared statements:
 *   - better-sqlite3 caches the parsed plan, halving CRUD latency for hot
 *     queries vs constructing a fresh statement each call.
 */

interface ResourceRow {
  id: string;
  name: string;
  category: string;
  status: Resource["status"];
  created_at: string;
  updated_at: string;
}

const rowToResource = (row: ResourceRow): Resource => ({
  id: row.id,
  name: row.name,
  category: row.category,
  status: row.status,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

/**
 * Cursor format: base64url(`<ISO timestamp>|<uuid>`).
 *
 * Composite cursor `(created_at, id)` resolves the timestamp-collision
 * problem: two rows inserted in the same millisecond are still uniquely
 * orderable. Without this, a cursor of `created_at < @ts` could skip rows
 * that share the boundary timestamp.
 */
interface DecodedCursor {
  ts: string;
  id: string;
}

function encodeCursor(ts: string, id: string): string {
  return Buffer.from(`${ts}|${id}`, "utf8").toString("base64url");
}

function decodeCursor(raw: string): DecodedCursor {
  let decoded: string;
  try {
    decoded = Buffer.from(raw, "base64url").toString("utf8");
  } catch {
    throw new ValidationError("Invalid cursor", { cursor: raw });
  }
  const [ts, id] = decoded.split("|", 2);
  if (!ts || !id) throw new ValidationError("Invalid cursor", { cursor: raw });
  return { ts, id };
}

/**
 * Escape SQL `LIKE` metacharacters in user-supplied search terms.
 * Without this, a query of `q=%` would match every row (DoS) and `q=_`
 * would match every single character. Pair with `ESCAPE '\'` in the SQL.
 */
function escapeLikePattern(q: string): string {
  return q.replace(/[\\%_]/g, (c) => `\\${c}`);
}

export interface ResourceRepository {
  insert(
    input: CreateResourceInput & {
      id: string;
      createdAt: string;
      updatedAt: string;
    },
  ): Resource;
  findById(id: string): Resource | null;
  list(query: ListResourcesQuery): { items: Resource[]; nextCursor: string | null };
  update(
    id: string,
    patch: UpdateResourceInput & { updatedAt: string },
  ): Resource | null;
  delete(id: string): boolean;
}

export function createResourceRepository(db: DB): ResourceRepository {
  const insertStmt = db.prepare<unknown[], ResourceRow>(`
    INSERT INTO resources (id, name, category, status, created_at, updated_at)
    VALUES (@id, @name, @category, @status, @createdAt, @updatedAt)
  `);
  const findByIdStmt = db.prepare<[string], ResourceRow>(`
    SELECT id, name, category, status, created_at, updated_at
    FROM resources WHERE id = ?
  `);
  const deleteStmt = db.prepare(`DELETE FROM resources WHERE id = ?`);

  // Cache prepared list-query variants by filter shape. SQLite caches by
  // statement-string identity, so we deduplicate the cache key explicitly to
  // avoid statement-table growth under varied query shapes.
  const listStmtCache = new Map<string, ReturnType<DB["prepare"]>>();
  function getListStmt(sql: string): ReturnType<DB["prepare"]> {
    const cached = listStmtCache.get(sql);
    if (cached) return cached;
    const stmt = db.prepare(sql);
    listStmtCache.set(sql, stmt);
    return stmt;
  }

  return {
    insert(input) {
      insertStmt.run(input);
      const row = findByIdStmt.get(input.id);
      if (!row) throw new Error("insert succeeded but row not found");
      return rowToResource(row);
    },

    findById(id) {
      const row = findByIdStmt.get(id);
      return row ? rowToResource(row) : null;
    },

    list(query) {
      const where: string[] = [];
      const params: Record<string, unknown> = { limit: query.limit + 1 };
      if (query.category) {
        where.push("category = @category");
        params.category = query.category;
      }
      if (query.status) {
        where.push("status = @status");
        params.status = query.status;
      }
      if (query.q) {
        // ESCAPE clause + manual escape of `%` and `_` so user-supplied
        // wildcards are matched literally, not interpreted by SQLite.
        where.push("name LIKE @q ESCAPE '\\'");
        params.q = `%${escapeLikePattern(query.q)}%`;
      }
      if (query.cursor) {
        const { ts, id } = decodeCursor(query.cursor);
        // Composite ordering: (created_at, id) DESC.
        // (a, b) < (x, y)  ≡  a < x  OR (a = x AND b < y)
        where.push(
          "(created_at < @cursor_ts OR (created_at = @cursor_ts AND id < @cursor_id))",
        );
        params.cursor_ts = ts;
        params.cursor_id = id;
      }

      const sql = `
        SELECT id, name, category, status, created_at, updated_at
        FROM resources
        ${where.length ? "WHERE " + where.join(" AND ") : ""}
        ORDER BY created_at DESC, id DESC
        LIMIT @limit
      `;
      const rows = (getListStmt(sql).all(params) as ResourceRow[]);

      const hasMore = rows.length > query.limit;
      const items = (hasMore ? rows.slice(0, query.limit) : rows).map(rowToResource);
      const last = items[items.length - 1];
      const nextCursor = hasMore && last ? encodeCursor(last.createdAt, last.id) : null;
      return { items, nextCursor };
    },

    update(id, patch) {
      const sets: string[] = [];
      const params: Record<string, unknown> = { id, updatedAt: patch.updatedAt };
      if (patch.name !== undefined) {
        sets.push("name = @name");
        params.name = patch.name;
      }
      if (patch.category !== undefined) {
        sets.push("category = @category");
        params.category = patch.category;
      }
      if (patch.status !== undefined) {
        sets.push("status = @status");
        params.status = patch.status;
      }
      sets.push("updated_at = @updatedAt");

      const sql = `UPDATE resources SET ${sets.join(", ")} WHERE id = @id`;
      const result = db.prepare(sql).run(params);
      if (result.changes === 0) return null;
      const row = findByIdStmt.get(id);
      return row ? rowToResource(row) : null;
    },

    delete(id) {
      return deleteStmt.run(id).changes > 0;
    },
  };
}
