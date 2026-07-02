import type { ListTaskEventsFilter } from "@/interfaces/task_event.interface.js";
import * as service from "@/services/task_event.service.js";
import type { Request, Response } from "express";

function toNumber(value: unknown): number | null {
  if (typeof value !== "string" || !/^\d+$/.test(value)) {
    return null;
  }
  return Number(value);
}

export function listTaskEvents(req: Request, res: Response) {
  const taskIdRaw = toNumber(req.query.taskId);
  const eventRaw =
    typeof req.query.event === "string"
      ? req.query.event
      : undefined;

  const filter: ListTaskEventsFilter = {};

  if (taskIdRaw !== null) {
    filter.taskId = taskIdRaw;
  }

  if (eventRaw !== undefined) {
    filter.event = eventRaw;
  }

  const result = service.listTaskEvents(filter);

  return res.json(result);
}

export function getTaskEventById(req: Request, res: Response) {
  const id = toNumber(req.params.id);

  if (id === null) {
    return res.status(400).json({ error: "Invalid event id" });
  }

  const event = service.getTaskEventById(id);

  if (!event) {
    return res.status(404).json({ error: "Not found" });
  }

  return res.json(event);
}

export function getTaskEventsByTaskId(req: Request, res: Response) {
  const taskId = toNumber(req.params.taskId);

  if (taskId === null) {
    return res.status(400).json({ error: "Invalid task id" });
  }

  const events = service.getTaskEventsByTaskId(taskId);

  return res.json(events);
}