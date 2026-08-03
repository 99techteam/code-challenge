import {
  AUDIT_ACTIONS,
  type AuditAction,
  type AuditLogFilters,
  type TroubleLogFilters,
} from "../domain/observability";
import { AppError } from "../errors";

function singleQueryValue(
  value: unknown,
  field: string,
): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new AppError(
      400,
      "VALIDATION_ERROR",
      `${field} must appear once`,
    );
  }

  const normalized = value.trim();
  return normalized === "" ? undefined : normalized;
}

function parseInteger(
  value: string | undefined,
  fallback: number,
  field: string,
  minimum: number,
  maximum: number,
): number {
  if (value === undefined) {
    return fallback;
  }

  if (!/^\d+$/.test(value)) {
    throw new AppError(
      400,
      "VALIDATION_ERROR",
      `${field} must be an integer`,
    );
  }

  const parsed = Number(value);

  if (
    !Number.isSafeInteger(parsed) ||
    parsed < minimum ||
    parsed > maximum
  ) {
    throw new AppError(
      400,
      "VALIDATION_ERROR",
      `${field} must be between ${minimum} and ${maximum}`,
    );
  }

  return parsed;
}

export function parseLogId(value: unknown): number {
  if (typeof value !== "string") {
    throw new AppError(
      400,
      "VALIDATION_ERROR",
      "Log id is required",
    );
  }

  return parseInteger(value, 0, "id", 1, Number.MAX_SAFE_INTEGER);
}

export function parseAuditLogFilters(
  query: Record<string, unknown>,
): AuditLogFilters {
  const actionValue = singleQueryValue(query.action, "action")?.toUpperCase();

  if (
    actionValue !== undefined &&
    !AUDIT_ACTIONS.includes(actionValue as AuditAction)
  ) {
    throw new AppError(
      400,
      "VALIDATION_ERROR",
      "Invalid audit action",
      { allowed: AUDIT_ACTIONS },
    );
  }

  const filters: AuditLogFilters = {
    limit: parseInteger(
      singleQueryValue(query.limit, "limit"),
      20,
      "limit",
      1,
      100,
    ),
    offset: parseInteger(
      singleQueryValue(query.offset, "offset"),
      0,
      "offset",
      0,
      1_000_000,
    ),
  };

  const taskId = singleQueryValue(query.taskId, "taskId");
  const traceId = singleQueryValue(query.traceId, "traceId");

  if (taskId) filters.taskId = taskId;
  if (traceId) filters.traceId = traceId;
  if (actionValue) filters.action = actionValue as AuditAction;

  return filters;
}

export function parseTroubleLogFilters(
  query: Record<string, unknown>,
): TroubleLogFilters {
  const filters: TroubleLogFilters = {
    limit: parseInteger(
      singleQueryValue(query.limit, "limit"),
      20,
      "limit",
      1,
      100,
    ),
    offset: parseInteger(
      singleQueryValue(query.offset, "offset"),
      0,
      "offset",
      0,
      1_000_000,
    ),
  };

  const requestId = singleQueryValue(query.requestId, "requestId");
  const method = singleQueryValue(query.method, "method")?.toUpperCase();
  const errorCode = singleQueryValue(query.errorCode, "errorCode");
  const statusCodeValue = singleQueryValue(query.statusCode, "statusCode");

  if (requestId) filters.requestId = requestId;
  if (method) filters.method = method;
  if (errorCode) filters.errorCode = errorCode;

  if (statusCodeValue !== undefined) {
    filters.statusCode = parseInteger(
      statusCodeValue,
      0,
      "statusCode",
      100,
      599,
    );
  }

  return filters;
}
