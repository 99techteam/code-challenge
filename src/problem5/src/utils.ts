import Database from "better-sqlite3";
import type { Task, TaskStatus } from "./interfaces/task.interface.js";
import type { Request } from "express";

const instance = new Database("code-challenge.db");

instance.pragma("foreign_keys = ON");

export function query<T = unknown>(sql: string, params: unknown[] = []) {
  return instance.prepare(sql).all(...params) as T[];
}

export function queryOne<T = unknown>(sql: string, params: unknown[] = []) {
  return instance.prepare(sql).get(...params) as T;
}

export function execute(sql: string, params: unknown[] = []) {
  return instance.prepare(sql).run(...params);
}

export function exec(sql: string) {
  instance.exec(sql);
}


export function daysUntil(date: string) {
  const diff = new Date(date).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function calculateUrgency(task: Task) {
  const dueWeight = task.due_at
    ? Math.max(0, 10 - daysUntil(task.due_at))
    : 0;

  return task.priority * 10 + dueWeight;
}

export const taskStatuses = ["pending", "in_progress", "done"] as const;

export function isTaskStatus(value: unknown): value is TaskStatus {
  return (
    typeof value === "string" &&
    taskStatuses.includes(value as TaskStatus)
  );
}

export function isValidId(value: string): boolean {
  return /^\d+$/.test(value) && Number(value) > 0;
}

export function getTaskId(req: Request): number | null {
  const rawId = req.params.id;
  if (typeof rawId !== "string") {
    return null;
  }
  if (!isValidId(rawId)) {
    return null;
  }
  return Number(rawId);
}

export function getSingleQueryValue(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}
