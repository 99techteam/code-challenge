import type { RequestHandler } from 'express';
import { Router } from 'express';
import { z } from 'zod';
import { taskDb, type CreateTaskInput, type UpdateTaskInput } from './db';
import type { TaskPriority, TaskStatus } from './types';

const statusEnum = ['todo', 'in_progress', 'done'] as const satisfies readonly TaskStatus[];
const priorityEnum = ['low', 'medium', 'high'] as const satisfies readonly TaskPriority[];

const dateSchema = z
  .union([z.string().datetime({ offset: true }), z.string().datetime()])
  .or(z.null())
  .optional();

const baseSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(2000).optional(),
  status: z.enum(statusEnum).optional(),
  priority: z.enum(priorityEnum).optional(),
  dueDate: dateSchema
});

const createSchema = baseSchema.extend({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).optional().default(''),
  status: z.enum(statusEnum).optional().default('todo'),
  priority: z.enum(priorityEnum).optional().default('medium')
});

const updateSchema = baseSchema.refine((data) => Object.keys(data).length > 0, {
  message: 'Provide at least one field to update'
});

const listSchema = z.object({
  status: z.enum(statusEnum).optional(),
  priority: z.enum(priorityEnum).optional(),
  search: z.string().optional(),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  offset: z.coerce.number().int().nonnegative().optional().default(0)
});

const router = Router();

const asyncHandler = (fn: RequestHandler): RequestHandler => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

router.post(
  '/tasks',
  asyncHandler(async (req, res) => {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Invalid payload', issues: parsed.error.issues });
    }
    const input: CreateTaskInput = {
      title: parsed.data.title,
      description: parsed.data.description ?? '',
      status: parsed.data.status,
      priority: parsed.data.priority,
      dueDate: parsed.data.dueDate ?? null
    };
    const task = await taskDb.createTask(input);
    res.status(201).json(task);
  })
);

router.get(
  '/tasks',
  asyncHandler(async (req, res) => {
    const parsed = listSchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Invalid query parameters', issues: parsed.error.issues });
    }
    const filters = {
      status: parsed.data.status ?? undefined,
      priority: parsed.data.priority ?? undefined,
      search: parsed.data.search ?? undefined,
      limit: parsed.data.limit,
      offset: parsed.data.offset
    };
    const { items, total } = await taskDb.listTasks(filters);
    res.json({
      items,
      total,
      limit: parsed.data.limit ?? 20,
      offset: parsed.data.offset ?? 0
    });
  })
);

router.get(
  '/tasks/:id',
  asyncHandler(async (req, res) => {
    const taskId = req.params.id;
    if (!taskId) {
      return res.status(400).json({ message: 'Task id is required' });
    }
    const task = await taskDb.getTask(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(task);
  })
);

router.patch(
  '/tasks/:id',
  asyncHandler(async (req, res) => {
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Invalid payload', issues: parsed.error.issues });
    }
    const updates: UpdateTaskInput = {};
    if (parsed.data.title !== undefined) updates.title = parsed.data.title;
    if (parsed.data.description !== undefined) updates.description = parsed.data.description;
    if (parsed.data.status !== undefined) updates.status = parsed.data.status;
    if (parsed.data.priority !== undefined) updates.priority = parsed.data.priority;
    if (parsed.data.dueDate !== undefined) {
      updates.dueDate = parsed.data.dueDate === '' ? null : parsed.data.dueDate;
    }
    const taskId = req.params.id;
    if (!taskId) {
      return res.status(400).json({ message: 'Task id is required' });
    }
    const updated = await taskDb.updateTask(taskId, updates);
    if (!updated) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(updated);
  })
);

router.delete(
  '/tasks/:id',
  asyncHandler(async (req, res) => {
    const taskId = req.params.id;
    if (!taskId) {
      return res.status(400).json({ message: 'Task id is required' });
    }
    const deleted = await taskDb.deleteTask(taskId);
    if (!deleted) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.status(204).send();
  })
);

export default router;
