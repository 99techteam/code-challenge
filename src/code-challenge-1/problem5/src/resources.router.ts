import { Router, Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { db } from './db';
import {
  createResourceSchema,
  updateResourceSchema,
  listQuerySchema,
} from './schemas';
import type { Resource } from './types';

const router = Router();

function handleZodError(err: ZodError, res: Response) {
  return res.status(400).json({
    error: 'validation_error',
    details: err.errors.map((e) => ({ path: e.path.join('.'), message: e.message })),
  });
}

/**
 * POST /resources
 * Create a new resource.
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = createResourceSchema.parse(req.body);

    const result = await db.execute({
      sql: `INSERT INTO resources (name, description, status) VALUES (?, ?, ?)`,
      args: [body.name, body.description, body.status],
    });

    const row = await db.execute({
      sql: `SELECT * FROM resources WHERE id = ?`,
      args: [result.lastInsertRowid!],
    });

    return res.status(201).json({ data: rowToResource(row.rows[0]) });
  } catch (err) {
    if (err instanceof ZodError) return handleZodError(err, res);
    next(err);
  }
});

/**
 * GET /resources
 * List resources with optional filters: status, name (partial match), pagination.
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = listQuerySchema.parse(req.query);
    const { status, name, page, limit } = query;
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }
    if (name) {
      conditions.push("name LIKE '%' || ? || '%'");
      params.push(name);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await db.execute({
      sql: `SELECT COUNT(*) as count FROM resources ${where}`,
      args: params,
    });
    const total = Number(countResult.rows[0].count);

    const dataResult = await db.execute({
      sql: `SELECT * FROM resources ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      args: [...params, limit, offset],
    });

    return res.json({
      data: dataResult.rows.map(rowToResource),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    if (err instanceof ZodError) return handleZodError(err, res);
    next(err);
  }
});

/**
 * GET /resources/:id
 * Get a single resource by ID.
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'invalid id' });
    }

    const result = await db.execute({
      sql: `SELECT * FROM resources WHERE id = ?`,
      args: [id],
    });

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'resource not found' });
    }

    return res.json({ data: rowToResource(result.rows[0]) });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /resources/:id
 * Update one or more fields of a resource.
 */
router.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'invalid id' });
    }

    const existing = await db.execute({
      sql: `SELECT id FROM resources WHERE id = ?`,
      args: [id],
    });
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'resource not found' });
    }

    const body = updateResourceSchema.parse(req.body);
    const entries = Object.entries(body) as [string, string][];
    const setClauses = entries.map(([key]) => `${key} = ?`).join(', ');
    const values = entries.map(([, v]) => v);

    await db.execute({
      sql: `UPDATE resources SET ${setClauses}, updated_at = datetime('now') WHERE id = ?`,
      args: [...values, id],
    });

    const updated = await db.execute({
      sql: `SELECT * FROM resources WHERE id = ?`,
      args: [id],
    });

    return res.json({ data: rowToResource(updated.rows[0]) });
  } catch (err) {
    if (err instanceof ZodError) return handleZodError(err, res);
    next(err);
  }
});

/**
 * DELETE /resources/:id
 * Delete a resource by ID.
 */
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'invalid id' });
    }

    const result = await db.execute({
      sql: `DELETE FROM resources WHERE id = ?`,
      args: [id],
    });

    if (result.rowsAffected === 0) {
      return res.status(404).json({ error: 'resource not found' });
    }

    return res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// helper: convert libsql Row to typed Resource
function rowToResource(row: Record<string, unknown>): Resource {
  return {
    id:          Number(row.id),
    name:        String(row.name),
    description: String(row.description),
    status:      row.status as Resource['status'],
    created_at:  String(row.created_at),
    updated_at:  String(row.updated_at),
  };
}

export default router;
