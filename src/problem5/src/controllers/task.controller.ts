import type { CreateTaskInput, ListTasksFilter, UpdateTaskInput } from "@/interfaces/task.interface.js";
import * as service from "@/services/task.service.js";
import { getSingleQueryValue, getTaskId, isTaskStatus } from "@/utils.js";
import { validatePriority, validateStatus } from "@/validations/task.validation.js";
import type { Request, Response } from "express";

export function createTask(req: Request, res: Response) {
  const body = req.body as Partial<CreateTaskInput>;

  if (!body || typeof body.title !== "string" || body.title.trim() === "") {
    return res.status(400).json({ error: "title is required" });
  }

  try {
    const input: CreateTaskInput = {
      title: body.title
    };
    if (body.description !== undefined) input.description = body.description;
    if (body.due_at !== undefined) input.due_at = body.due_at;
    const priority = validatePriority(body.priority)
    if (priority !== undefined) input.priority = priority;
    const task = service.createTask(input);
    return res.status(201).json(task);
  } catch (e) {
    return res.status(400).json({ error: (e as Error).message });
  }
}

export function listTasks(req: Request, res: Response) {
  const statusRaw = getSingleQueryValue(req.query.status);
  const priorityRaw = getSingleQueryValue(req.query.priority);
  const tagsRaw = req.query.tags;

  let status: any;

  if (statusRaw !== undefined) {
    if (!isTaskStatus(statusRaw)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    status = statusRaw;
  }

  let priority: number | undefined;

  try {
    if (priorityRaw !== undefined) {
      priority = validatePriority(Number(priorityRaw));
    }
  } catch (e) {
    return res.status(400).json({ error: (e as Error).message });
  }

  const tags =
    typeof tagsRaw === "string"
      ? tagsRaw.split(",").map(t => t.trim()).filter(Boolean)
      : undefined;

  const filter: ListTasksFilter = {
    ...(status && { status }),
    ...(priority !== undefined && { priority }),
    ...(tags && { tags })
  };

  return res.json(service.listTasks(filter));
}

export function getTaskById(req: Request, res: Response) {
  const id = getTaskId(req);
  if (id === null) return res.status(400).json({ error: "Invalid task id" });

  const task = service.getTaskById(id);
  if (!task) return res.status(404).json({ error: "Not found" });

  return res.json(task);
}

export function updateStatus(req: Request, res: Response) {
  const id = getTaskId(req);
  if (id === null) return res.status(400).json({ error: "Invalid task id" });

  try {
    const status = validateStatus((req.body as any).status);
    const task = service.updateStatus(id, status);

    if (!task) return res.status(404).json({ error: "Not found" });

    return res.json(task);
  } catch (e) {
    return res.status(400).json({ error: (e as Error).message });
  }
}

export function updateTask(req: Request, res: Response) {
  const id = getTaskId(req);
  if (id === null) return res.status(400).json({ error: "Invalid task id" });

  try {
    const input: UpdateTaskInput = {
      ...req.body,
      priority: req.body.priority !== undefined
        ? validatePriority(req.body.priority)
        : undefined
    };

    const task = service.updateTask(id, input);
    if (!task) return res.status(404).json({ error: "Not found" });

    return res.json(task);
  } catch (e) {
    return res.status(400).json({ error: (e as Error).message });
  }
}

export function deleteTask(req: Request, res: Response) {
  const id = getTaskId(req);
  if (id === null) return res.status(400).json({ error: "Invalid task id" });

  const task = service.deleteTask(id);
  if (!task) return res.status(404).json({ error: "Not found" });

  return res.status(204).send();
}