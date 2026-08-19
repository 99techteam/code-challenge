import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db';
import { CreateResourceInput, UpdateResourceInput } from '../types';

const router = Router();

function validateCreate(body: any): { valid: true; data: CreateResourceInput } | { valid: false; error: string } {
  if (typeof body.name !== 'string' || body.name.trim() === '') {
    return { valid: false, error: 'name is required and must be a non-empty string' };
  }
  if (body.description !== undefined && typeof body.description !== 'string') {
    return { valid: false, error: 'description must be a string' };
  }
  if (body.category !== undefined && typeof body.category !== 'string') {
    return { valid: false, error: 'category must be a string' };
  }
  if (body.price !== undefined && (typeof body.price !== 'number' || body.price < 0)) {
    return { valid: false, error: 'price must be a non-negative number' };
  }
  return { valid: true, data: body };
}

function validateUpdate(body: any): { valid: true; data: UpdateResourceInput } | { valid: false; error: string } {
  if (body.name !== undefined && (typeof body.name !== 'string' || body.name.trim() === '')) {
    return { valid: false, error: 'name must be a non-empty string' };
  }
  if (body.description !== undefined && typeof body.description !== 'string') {
    return { valid: false, error: 'description must be a string' };
  }
  if (body.category !== undefined && typeof body.category !== 'string') {
    return { valid: false, error: 'category must be a string' };
  }
  if (body.price !== undefined && (typeof body.price !== 'number' || body.price < 0)) {
    return { valid: false, error: 'price must be a non-negative number' };
  }
  return { valid: true, data: body };
}

// POST /resources — create
router.post('/', (req: Request, res: Response) => {
  const result = validateCreate(req.body ?? {});
  if (!result.valid) return res.status(400).json({ error: result.error });

  const now = new Date().toISOString();
  const resource = {
    id: uuidv4(),
    name: result.data.name,
    description: result.data.description ?? '',
    category: result.data.category ?? '',
    price: result.data.price ?? 0,
    createdAt: now,
    updatedAt: now,
  };

  db.get('resources').push(resource).write();
  res.status(201).json(resource);
});

// GET /resources — list with basic filters: category, search (name/description), minPrice, maxPrice
router.get('/', (req: Request, res: Response) => {
  const { category, search, minPrice, maxPrice } = req.query;
  let resources = db.get('resources').value();

  if (typeof category === 'string' && category !== '') {
    resources = resources.filter((r) => r.category.toLowerCase() === category.toLowerCase());
  }

  if (typeof search === 'string' && search !== '') {
    const needle = search.toLowerCase();
    resources = resources.filter(
      (r) => r.name.toLowerCase().includes(needle) || r.description.toLowerCase().includes(needle)
    );
  }

  if (typeof minPrice === 'string' && minPrice !== '') {
    const min = Number(minPrice);
    if (!Number.isNaN(min)) resources = resources.filter((r) => r.price >= min);
  }

  if (typeof maxPrice === 'string' && maxPrice !== '') {
    const max = Number(maxPrice);
    if (!Number.isNaN(max)) resources = resources.filter((r) => r.price <= max);
  }

  res.json(resources);
});

// GET /resources/:id — detail
router.get('/:id', (req: Request, res: Response) => {
  const resource = db.get('resources').find({ id: req.params.id }).value();
  if (!resource) return res.status(404).json({ error: 'Resource not found' });
  res.json(resource);
});

// PUT /resources/:id — update
router.put('/:id', (req: Request, res: Response) => {
  const existing = db.get('resources').find({ id: req.params.id }).value();
  if (!existing) return res.status(404).json({ error: 'Resource not found' });

  const result = validateUpdate(req.body ?? {});
  if (!result.valid) return res.status(400).json({ error: result.error });

  const updated = {
    ...existing,
    ...result.data,
    updatedAt: new Date().toISOString(),
  };

  db.get('resources').find({ id: req.params.id }).assign(updated).write();
  res.json(updated);
});

// DELETE /resources/:id — delete
router.delete('/:id', (req: Request, res: Response) => {
  const existing = db.get('resources').find({ id: req.params.id }).value();
  if (!existing) return res.status(404).json({ error: 'Resource not found' });

  db.get('resources').remove({ id: req.params.id }).write();
  res.status(204).send();
});

export default router;
