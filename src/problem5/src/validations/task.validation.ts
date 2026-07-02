import { HttpError } from "@/errors/http.error.js";
import type { TaskStatus } from "@/interfaces/task.interface.js";

export function validatePriority(value: unknown): number | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "number" || !Number.isInteger(value)) {
    throw new HttpError(400, "priority must be integer");
  }
  if (value < 1 || value > 10) {
    throw new HttpError(400, "priority must be between 1 and 10");
  }
  return value;
}

export function validateStatus(value: unknown): TaskStatus {
  if (value === "pending" || value === "in_progress" || value === "done") {
    return value;
  }
  throw new HttpError(400, "invalid status");
}