import { AppError } from "../errors";
import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  type CreateTaskInput,
  type TaskFilters,
  type TaskPriority,
  type TaskStatus,
  type UpdateTaskInput,
} from "../domain/task";

const CREATE_FIELDS = new Set([
  "title",
  "description",
  "status",
  "priority",
  "dueDate",
]);

const UPDATE_FIELDS = CREATE_FIELDS;

function requireObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new AppError(400, "VALIDATION_ERROR", "Request body must be an object");
  }

  return value as Record<string, unknown>;
}

function rejectUnknownFields(
  object: Record<string, unknown>,
  allowed: ReadonlySet<string>,
): void {
  const unknown = Object.keys(object).filter((key) => !allowed.has(key));

  if (unknown.length > 0) {
    throw new AppError(400, "VALIDATION_ERROR", "Unknown request fields", {
      unknownFields: unknown,
    });
  }
}

function parseTitle(value: unknown): string {
  if (typeof value !== "string") {
    throw new AppError(400, "VALIDATION_ERROR", "title must be a string");
  }

  const title = value.trim();

  if (title.length < 1 || title.length > 120) {
    throw new AppError(
      400,
      "VALIDATION_ERROR",
      "title must contain between 1 and 120 characters",
    );
  }

  return title;
}

function parseDescription(value: unknown): string | null {
  if (value === null) {
    return null;
  }

  if (typeof value !== "string") {
    throw new AppError(
      400,
      "VALIDATION_ERROR",
      "description must be a string or null",
    );
  }

  const description = value.trim();

  if (description.length > 2_000) {
    throw new AppError(
      400,
      "VALIDATION_ERROR",
      "description must not exceed 2000 characters",
    );
  }

  return description || null;
}

function parseStatus(value: unknown): TaskStatus {
  if (typeof value !== "string" || !TASK_STATUSES.includes(value as TaskStatus)) {
    throw new AppError(400, "VALIDATION_ERROR", "Invalid task status", {
      allowed: TASK_STATUSES,
    });
  }

  return value as TaskStatus;
}

function parsePriority(value: unknown): TaskPriority {
  if (
    typeof value !== "string" ||
    !TASK_PRIORITIES.includes(value as TaskPriority)
  ) {
    throw new AppError(400, "VALIDATION_ERROR", "Invalid task priority", {
      allowed: TASK_PRIORITIES,
    });
  }

  return value as TaskPriority;
}

function parseDate(value: unknown, field: string): string | null {
  if (value === null) {
    return null;
  }

  if (typeof value !== "string" || value.trim() === "") {
    throw new AppError(400, "VALIDATION_ERROR", `${field} must be an ISO date`);
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new AppError(400, "VALIDATION_ERROR", `${field} must be an ISO date`);
  }

  return date.toISOString();
}

export function parseCreateTask(body: unknown): CreateTaskInput {
  const object = requireObject(body);
  rejectUnknownFields(object, CREATE_FIELDS);

  if (!("title" in object)) {
    throw new AppError(400, "VALIDATION_ERROR", "title is required");
  }

  return {
    title: parseTitle(object.title),
    description:
      "description" in object ? parseDescription(object.description) : null,
    status: "status" in object ? parseStatus(object.status) : "TODO",
    priority:
      "priority" in object ? parsePriority(object.priority) : "MEDIUM",
    dueDate: "dueDate" in object ? parseDate(object.dueDate, "dueDate") : null,
  };
}

export function parseUpdateTask(body: unknown): UpdateTaskInput {
  const object = requireObject(body);
  rejectUnknownFields(object, UPDATE_FIELDS);

  if (Object.keys(object).length === 0) {
    throw new AppError(
      400,
      "VALIDATION_ERROR",
      "At least one field must be provided",
    );
  }

  const result: UpdateTaskInput = {};

  if ("title" in object) result.title = parseTitle(object.title);
  if ("description" in object) {
    result.description = parseDescription(object.description);
  }
  if ("status" in object) result.status = parseStatus(object.status);
  if ("priority" in object) result.priority = parsePriority(object.priority);
  if ("dueDate" in object) result.dueDate = parseDate(object.dueDate, "dueDate");

  return result;
}

function singleQueryValue(value: unknown, field: string): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new AppError(400, "VALIDATION_ERROR", `${field} must appear once`);
  }

  return value;
}

function parseNonNegativeInteger(
  value: string | undefined,
  fallback: number,
  field: string,
  maximum: number,
): number {
  if (value === undefined) {
    return fallback;
  }

  if (!/^\d+$/.test(value)) {
    throw new AppError(
      400,
      "VALIDATION_ERROR",
      `${field} must be a non-negative integer`,
    );
  }

  const parsed = Number(value);

  if (!Number.isSafeInteger(parsed) || parsed > maximum) {
    throw new AppError(
      400,
      "VALIDATION_ERROR",
      `${field} must not exceed ${maximum}`,
    );
  }

  return parsed;
}

export function parseTaskFilters(query: Record<string, unknown>): TaskFilters {
  const search = singleQueryValue(query.search, "search")?.trim();
  const statusValue = singleQueryValue(query.status, "status");
  const priorityValue = singleQueryValue(query.priority, "priority");
  const dueAfterValue = singleQueryValue(query.dueAfter, "dueAfter");
  const dueBeforeValue = singleQueryValue(query.dueBefore, "dueBefore");
  const sortByValue = singleQueryValue(query.sortBy, "sortBy") ?? "createdAt";
  const orderValue = singleQueryValue(query.order, "order")?.toLowerCase() ?? "desc";

  const allowedSorts = [
    "title",
    "status",
    "priority",
    "dueDate",
    "createdAt",
    "updatedAt",
  ] as const;

  if (!allowedSorts.includes(sortByValue as TaskFilters["sortBy"])) {
    throw new AppError(400, "VALIDATION_ERROR", "Invalid sortBy", {
      allowed: allowedSorts,
    });
  }

  if (orderValue !== "asc" && orderValue !== "desc") {
    throw new AppError(400, "VALIDATION_ERROR", "order must be asc or desc");
  }

  const filters: TaskFilters = {
    sortBy: sortByValue as TaskFilters["sortBy"],
    order: orderValue,
    limit: parseNonNegativeInteger(
      singleQueryValue(query.limit, "limit"),
      20,
      "limit",
      100,
    ),
    offset: parseNonNegativeInteger(
      singleQueryValue(query.offset, "offset"),
      0,
      "offset",
      1_000_000,
    ),
  };

  if (search) filters.search = search;
  if (statusValue !== undefined) filters.status = parseStatus(statusValue);
  if (priorityValue !== undefined) {
    filters.priority = parsePriority(priorityValue);
  }
  if (dueAfterValue !== undefined) {
    const dueAfter = parseDate(dueAfterValue, "dueAfter");
    if (dueAfter !== null) filters.dueAfter = dueAfter;
  }
  if (dueBeforeValue !== undefined) {
    const dueBefore = parseDate(dueBeforeValue, "dueBefore");
    if (dueBefore !== null) filters.dueBefore = dueBefore;
  }

  return filters;
}
