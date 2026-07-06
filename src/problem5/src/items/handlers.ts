import { Request, Response } from 'express';
import { Item, JsonErr, JsonOk, ListQuery } from '../models';
import * as repo from './repository';

function parseId(raw: string): number | null {
  const id = parseInt(raw, 10);
  return Number.isNaN(id) ? null : id;
}

function parseCreateBody(body: unknown): { ok: true; data: Item } | { ok: false; error: string } {
  if (!body || typeof body !== 'object') {
    return { ok: false, error: 'Name is required and must be a non-empty string' };
  }

  const { name, description, category, status } = body as Record<string, unknown>;

  if (typeof name !== 'string' || name.trim().length === 0) {
    return { ok: false, error: 'Name is required and must be a non-empty string' };
  }

  return {
    ok: true,
    data: {
      name: name.trim(),
      description: typeof description === 'string' ? description.trim() : undefined,
      category: typeof category === 'string' ? category.trim() : undefined,
      status: typeof status === 'string' ? status : 'active'
    }
  };
}

export function handleCreate(req: Request, res: Response): void {
  try {
    const parsed = parseCreateBody(req.body);
    if (!parsed.ok) {
      res.status(400).json({ success: false, error: parsed.error } satisfies JsonErr);
      return;
    }

    const created = repo.insertItem(parsed.data);
    res.status(201).json({
      success: true,
      data: created,
      message: 'Resource created successfully'
    } satisfies JsonOk<Item>);
  } catch (err) {
    console.error('create failed:', err);
    res.status(500).json({ success: false, error: 'Internal server error' } satisfies JsonErr);
  }
}

export function handleList(req: Request, res: Response): void {
  try {
    const filters: ListQuery = {
      category: req.query.category as string | undefined,
      status: req.query.status as string | undefined,
      search: req.query.search as string | undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset as string, 10) : undefined
    };

    const resources = repo.findMany(filters);
    const total = repo.countMatching(filters);

    res.json({
      success: true,
      data: {
        resources,
        total,
        limit: filters.limit,
        offset: filters.offset ?? 0
      }
    });
  } catch (err) {
    console.error('list failed:', err);
    res.status(500).json({ success: false, error: 'Internal server error' } satisfies JsonErr);
  }
}

export function handleGet(req: Request, res: Response): void {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      res.status(400).json({ success: false, error: 'Invalid resource ID' } satisfies JsonErr);
      return;
    }

    const item = repo.findById(id);
    if (!item) {
      res.status(404).json({ success: false, error: 'Resource not found' } satisfies JsonErr);
      return;
    }

    res.json({ success: true, data: item } satisfies JsonOk<Item>);
  } catch (err) {
    console.error('get failed:', err);
    res.status(500).json({ success: false, error: 'Internal server error' } satisfies JsonErr);
  }
}

export function handleUpdate(req: Request, res: Response): void {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      res.status(400).json({ success: false, error: 'Invalid resource ID' } satisfies JsonErr);
      return;
    }

    const { name, description, category, status } = req.body ?? {};
    if (name === undefined && description === undefined && category === undefined && status === undefined) {
      res.status(400).json({
        success: false,
        error: 'At least one field must be provided for update'
      } satisfies JsonErr);
      return;
    }

    const patch: Partial<Item> = {};
    if (name !== undefined) patch.name = String(name).trim();
    if (description !== undefined) patch.description = String(description).trim();
    if (category !== undefined) patch.category = String(category).trim();
    if (status !== undefined) patch.status = status;

    const updated = repo.patchItem(id, patch);
    if (!updated) {
      res.status(404).json({ success: false, error: 'Resource not found' } satisfies JsonErr);
      return;
    }

    res.json({
      success: true,
      data: updated,
      message: 'Resource updated successfully'
    } satisfies JsonOk<Item>);
  } catch (err) {
    console.error('update failed:', err);
    res.status(500).json({ success: false, error: 'Internal server error' } satisfies JsonErr);
  }
}

export function handleDelete(req: Request, res: Response): void {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      res.status(400).json({ success: false, error: 'Invalid resource ID' } satisfies JsonErr);
      return;
    }

    const removed = repo.removeItem(id);
    if (!removed) {
      res.status(404).json({ success: false, error: 'Resource not found' } satisfies JsonErr);
      return;
    }

    res.json({ success: true, message: 'Resource deleted successfully' });
  } catch (err) {
    console.error('delete failed:', err);
    res.status(500).json({ success: false, error: 'Internal server error' } satisfies JsonErr);
  }
}
