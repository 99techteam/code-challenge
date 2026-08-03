import { Database } from "../database";
import type {
  AuditLog,
  AuditLogFilters,
  ListResult,
  TroubleLog,
  TroubleLogFilters,
  TroubleLogInput,
} from "../domain/observability";

interface AuditLogRow {
  id: number;
  trace_id: string;
  action: AuditLog["action"];
  task_id: string;
  before_json: string | null;
  after_json: string | null;
  created_at: string;
}

interface TroubleLogRow {
  id: number;
  request_id: string;
  method: string;
  path: string;
  status_code: number;
  error_code: string;
  message: string;
  details_json: string | null;
  stack: string | null;
  duration_ms: number;
  created_at: string;
}

function parseJson(value: string | null): unknown | null {
  return value === null ? null : JSON.parse(value);
}

function mapAuditLog(row: AuditLogRow): AuditLog {
  return {
    id: Number(row.id),
    traceId: row.trace_id,
    action: row.action,
    taskId: row.task_id,
    before: parseJson(row.before_json),
    after: parseJson(row.after_json),
    createdAt: row.created_at,
  };
}

function mapTroubleLog(row: TroubleLogRow): TroubleLog {
  return {
    id: Number(row.id),
    requestId: row.request_id,
    method: row.method,
    path: row.path,
    statusCode: Number(row.status_code),
    errorCode: row.error_code,
    message: row.message,
    details: parseJson(row.details_json),
    stack: row.stack,
    durationMs: Number(row.duration_ms),
    createdAt: row.created_at,
  };
}

export class ObservabilityRepository {
  public constructor(private readonly database: Database) {}

  public listAuditLogs(
    filters: AuditLogFilters,
  ): ListResult<AuditLog> {
    const conditions: string[] = [];
    const parameters: Array<string | number> = [];

    if (filters.taskId) {
      conditions.push("task_id = ?");
      parameters.push(filters.taskId);
    }

    if (filters.traceId) {
      conditions.push("trace_id = ?");
      parameters.push(filters.traceId);
    }

    if (filters.action) {
      conditions.push("action = ?");
      parameters.push(filters.action);
    }

    const where =
      conditions.length > 0
        ? `WHERE ${conditions.join(" AND ")}`
        : "";

    const countRow = this.database
      .prepare(`
        SELECT COUNT(*) AS total
        FROM task_audit_logs
        ${where}
      `)
      .get(...parameters) as { total: number };

    const rows = this.database
      .prepare(`
        SELECT *
        FROM task_audit_logs
        ${where}
        ORDER BY id DESC
        LIMIT ? OFFSET ?
      `)
      .all(
        ...parameters,
        filters.limit,
        filters.offset,
      ) as unknown as AuditLogRow[];

    return {
      items: rows.map(mapAuditLog),
      total: Number(countRow.total),
      limit: filters.limit,
      offset: filters.offset,
    };
  }

  public findAuditLogById(id: number): AuditLog | null {
    const row = this.database
      .prepare(`
        SELECT *
        FROM task_audit_logs
        WHERE id = ?
      `)
      .get(id) as AuditLogRow | undefined;

    return row ? mapAuditLog(row) : null;
  }

  public writeTroubleLog(input: TroubleLogInput): TroubleLog {
    const createdAt = new Date().toISOString();
    const result = this.database
      .prepare(`
        INSERT INTO trouble_logs(
          request_id,
          method,
          path,
          status_code,
          error_code,
          message,
          details_json,
          stack,
          duration_ms,
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        input.requestId,
        input.method,
        input.path,
        input.statusCode,
        input.errorCode,
        input.message,
        input.details === undefined
          ? null
          : JSON.stringify(input.details),
        input.stack ?? null,
        input.durationMs,
        createdAt,
      );

    return {
      id: Number(result.lastInsertRowid),
      requestId: input.requestId,
      method: input.method,
      path: input.path,
      statusCode: input.statusCode,
      errorCode: input.errorCode,
      message: input.message,
      details: input.details ?? null,
      stack: input.stack ?? null,
      durationMs: input.durationMs,
      createdAt,
    };
  }

  public listTroubleLogs(
    filters: TroubleLogFilters,
  ): ListResult<TroubleLog> {
    const conditions: string[] = [];
    const parameters: Array<string | number> = [];

    if (filters.requestId) {
      conditions.push("request_id = ?");
      parameters.push(filters.requestId);
    }

    if (filters.method) {
      conditions.push("method = ?");
      parameters.push(filters.method);
    }

    if (filters.errorCode) {
      conditions.push("error_code = ?");
      parameters.push(filters.errorCode);
    }

    if (filters.statusCode !== undefined) {
      conditions.push("status_code = ?");
      parameters.push(filters.statusCode);
    }

    const where =
      conditions.length > 0
        ? `WHERE ${conditions.join(" AND ")}`
        : "";

    const countRow = this.database
      .prepare(`
        SELECT COUNT(*) AS total
        FROM trouble_logs
        ${where}
      `)
      .get(...parameters) as { total: number };

    const rows = this.database
      .prepare(`
        SELECT *
        FROM trouble_logs
        ${where}
        ORDER BY id DESC
        LIMIT ? OFFSET ?
      `)
      .all(
        ...parameters,
        filters.limit,
        filters.offset,
      ) as unknown as TroubleLogRow[];

    return {
      items: rows.map(mapTroubleLog),
      total: Number(countRow.total),
      limit: filters.limit,
      offset: filters.offset,
    };
  }

  public findTroubleLogById(id: number): TroubleLog | null {
    const row = this.database
      .prepare(`
        SELECT *
        FROM trouble_logs
        WHERE id = ?
      `)
      .get(id) as TroubleLogRow | undefined;

    return row ? mapTroubleLog(row) : null;
  }

  public countTroubleLogs(): number {
    const row = this.database
      .prepare(`
        SELECT COUNT(*) AS total
        FROM trouble_logs
      `)
      .get() as { total: number };

    return Number(row.total);
  }
}
