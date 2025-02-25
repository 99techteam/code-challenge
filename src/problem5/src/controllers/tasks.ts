import { Request, Response, NextFunction, RequestHandler } from 'express';
import * as taskModel from '../models/tasks';

export type AsyncRequestHandler = (
    req: Request,
    res: Response,
    next: NextFunction
) => Promise<void>;

export function asyncHandler(fn: AsyncRequestHandler): RequestHandler {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

export async function createTask(req: Request, res: Response, next: NextFunction) {
    const { title, description } = req.body;
    if (!title) {
        res.status(400).json({ error: 'Title is required' });
        return;
    }
    try {
        const taskId = await taskModel.createTask({ title, description });
        res.status(201).json({ id: taskId });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create task' });
    }
}
export async function listTasks(req: Request, res: Response, next: NextFunction) {
    const { completed, title } = req.query;
    const filters: { completed?: boolean; title?: string } = {};
    if (completed !== undefined) filters.completed = completed === 'true';
    if (typeof title === 'string') filters.title = title;
    try {
        const tasks = await taskModel.getTasks(filters);
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve tasks' });
    }
}

export async function getTask(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    try {
        const task = await taskModel.getTaskById(Number(id));
        if (task) res.json(task);
        else res.status(404).json({ error: 'Task not found' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve task' });
    }
}

export async function updateTask(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const { title, description, completed } = req.body;
    const updates: Partial<taskModel.Task> = {};

    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (completed !== undefined) updates.completed = completed;

    if (Object.keys(updates).length === 0) {
        res.status(400).json({ error: 'No fields to update' });
        return; // Explicitly return undefined
    }

    try {
        const updated = await taskModel.updateTask(Number(id), updates);
        if (updated) {
            res.json({ message: 'Task updated' });
        } else {
            res.status(404).json({ error: 'Task not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to update task' });
    }
    // Implicitly returns Promise<undefined>
}

export async function deleteTask(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    try {
        const deleted = await taskModel.deleteTask(Number(id));
        if (deleted) res.json({ message: 'Task deleted' });
        else res.status(404).json({ error: 'Task not found' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete task' });
    }
}