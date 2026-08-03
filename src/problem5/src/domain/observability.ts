export const AUDIT_ACTIONS = [
  "CREATE",
  "UPDATE",
  "DELETE",
] as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export interface AuditLog {
  id: number;
  traceId: string;
  action: AuditAction;
  taskId: string;
  before: unknown | null;
  after: unknown | null;
  createdAt: string;
}

export interface AuditLogFilters {
  taskId?: string;
  traceId?: string;
  action?: AuditAction;
  limit: number;
  offset: number;
}

export interface TroubleLog {
  id: number;
  requestId: string;
  method: string;
  path: string;
  statusCode: number;
  errorCode: string;
  message: string;
  details: unknown | null;
  stack: string | null;
  durationMs: number;
  createdAt: string;
}

export interface TroubleLogFilters {
  requestId?: string;
  method?: string;
  errorCode?: string;
  statusCode?: number;
  limit: number;
  offset: number;
}

export interface TroubleLogInput {
  requestId: string;
  method: string;
  path: string;
  statusCode: number;
  errorCode: string;
  message: string;
  details?: unknown;
  stack?: string;
  durationMs: number;
}

export interface ListResult<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}
