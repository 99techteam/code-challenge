import * as service from "@/services/task_tag.service.js";
import type { Request, Response } from "express";

function toNumber(value: unknown): number | null {
  if (typeof value !== "string" || !/^\d+$/.test(value)) {
    return null;
  }
  return Number(value);
}

export function addTag(req: Request, res: Response) {
  const taskId = toNumber(req.params.taskId);
  if (taskId === null) {
    return res.status(400).json({ error: "Invalid task id" });
  }

  const tagName = req.body?.name;
  if (typeof tagName !== "string" || tagName.trim() === "") {
    return res.status(400).json({ error: "Invalid tag name" });
  }

  try {
    const result = service.addTagToTask(taskId, tagName.trim());
    return res.json(result);
  } catch (e) {
    return res.status(404).json({ error: (e as Error).message });
  }
}

export function removeTag(req: Request, res: Response) {
  const taskId = toNumber(req.params.taskId);
  const tagId = toNumber(req.params.tagId);

  if (taskId === null || tagId === null) {
    return res.status(400).json({ error: "Invalid ids" });
  }

  try {
    const result = service.removeTagFromTask(taskId, tagId);
    return res.json(result);
  } catch (e) {
    return res.status(404).json({ error: (e as Error).message });
  }
}

export function getTaskTags(req: Request, res: Response) {
  const taskId = toNumber(req.params.taskId);

  if (taskId === null) {
    return res.status(400).json({ error: "Invalid task id" });
  }

  const result = service.getTaskTags(taskId);
  return res.json(result);
}