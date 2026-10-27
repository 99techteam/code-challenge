import express, { type ErrorRequestHandler } from 'express';
import { z, ZodError } from 'zod';
import { TaskStore } from './db.js';

const statusSchema = z.enum(['todo', 'in_progress', 'done']);
const createSchema = z.strictObject({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(2000).default(''),
  status: statusSchema.default('todo'),
});
const updateSchema = z.strictObject({
  title: z.string().trim().min(1).max(120).optional(),
  description: z.string().trim().max(2000).optional(),
  status: statusSchema.optional(),
}).refine(input => Object.keys(input).length > 0, 'Provide at least one field');
const listSchema = z.strictObject({
  status: statusSchema.optional(),
  q: z.string().trim().max(120).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
const idSchema = z.coerce.number().int().positive().safe();

export function createApp(store: TaskStore) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '32kb' }));

  app.post('/api/tasks', (req, res) => {
    const input = createSchema.parse(req.body);
    res.status(201).json({ data: store.create(input) });
  });
  app.get('/api/tasks', (req, res) => {
    const filters = listSchema.parse(req.query);
    const { data, total } = store.list(filters);
    res.json({ data, pagination: { page: filters.page, limit: filters.limit, total, totalPages: Math.ceil(total / filters.limit) } });
  });
  app.get('/api/tasks/:id', (req, res) => {
    const task = store.get(idSchema.parse(req.params.id));
    if (!task) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Task not found' } });
    res.json({ data: task });
  });
  app.patch('/api/tasks/:id', (req, res) => {
    const id = idSchema.parse(req.params.id);
    const changes = updateSchema.parse(req.body);
    const task = store.update(id, changes);
    if (!task) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Task not found' } });
    res.json({ data: task });
  });
  app.delete('/api/tasks/:id', (req, res) => {
    if (!store.delete(idSchema.parse(req.params.id))) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Task not found' } });
    res.status(204).send();
  });
  app.use((_req, res) => res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found' } }));
  const onError: ErrorRequestHandler = (error: unknown, _req, res, _next) => {
    if (error instanceof ZodError) {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid request', details: error.issues.map(issue => ({ path: issue.path.join('.'), message: issue.message })) } });
      return;
    }
    if (error instanceof SyntaxError && 'body' in error) {
      res.status(400).json({ error: { code: 'INVALID_JSON', message: 'Malformed JSON body' } });
      return;
    }
    console.error(error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Unexpected server error' } });
  };
  app.use(onError);
  return app;
}
