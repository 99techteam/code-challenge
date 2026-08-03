import { randomUUID } from "node:crypto";
import { Database } from "../database";
import type {
  CreateTaskInput,
  Task,
  TaskFilters,
  TaskListResult,
  UpdateTaskInput,
} from "../domain/task";

interface TaskRow {
  id: string;
  title: string;
  description: string | null;
  status: Task["status"];
  priority: Task["priority"];
  due_date: string | null;
  version: number;
  created_at: string;
  updated_at: string;
}

const SORT_COLUMNS: Record<TaskFilters["sortBy"], string> = {
  title: "title",
  status: "status",
  priority: "priority",
  dueDate: "due_date",
  createdAt: "created_at",
  updatedAt: "updated_at",
};

function mapTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    dueDate: row.due_date,
    version: row.version,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class TaskRepository {
  public constructor(private readonly database: Database) {}

  public create(input: CreateTaskInput, traceId: string): Task {
    const now = new Date().toISOString();
    const task: Task = {
      id: randomUUID(),
      title: input.title,
      description: input.description ?? null,
      status: input.status ?? "TODO",
      priority: input.priority ?? "MEDIUM",
      dueDate: input.dueDate ?? null,
      version: 1,
      createdAt: now,
      updatedAt: now,
    };

    return this.database.transaction(() => {
      this.database
        .prepare(`
          INSERT INTO tasks(
            id, title, description, status, priority, due_date,
            version, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `)
        .run(
          task.id,
          task.title,
          task.description,
          task.status,
          task.priority,
          task.dueDate,
          task.version,
          task.createdAt,
          task.updatedAt,
        );

      this.writeAudit(traceId, "CREATE", task.id, null, task);
      return task;
    });
  }

  public list(filters: TaskFilters): TaskListResult {
    const conditions: string[] = [];
    const parameters: Array<string | number> = [];

    if (filters.search) {
      conditions.push("(title LIKE ? ESCAPE '\\' OR description LIKE ? ESCAPE '\\')");
      const escaped = filters.search.replace(/[\\%_]/g, "\\$&");
      const pattern = `%${escaped}%`;
      parameters.push(pattern, pattern);
    }

    if (filters.status) {
      conditions.push("status = ?");
      parameters.push(filters.status);
    }

    if (filters.priority) {
      conditions.push("priority = ?");
      parameters.push(filters.priority);
    }

    if (filters.dueAfter) {
      conditions.push("due_date IS NOT NULL AND due_date >= ?");
      parameters.push(filters.dueAfter);
    }

    if (filters.dueBefore) {
      conditions.push("due_date IS NOT NULL AND due_date <= ?");
      parameters.push(filters.dueBefore);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const sortColumn = SORT_COLUMNS[filters.sortBy];
    const sortOrder = filters.order.toUpperCase();

    const countRow = this.database
      .prepare(`SELECT COUNT(*) AS total FROM tasks ${where}`)
      .get(...parameters) as { total: number };

    const rows = this.database
      .prepare(`
        SELECT * FROM tasks
        ${where}
        ORDER BY ${sortColumn} ${sortOrder}, id ASC
        LIMIT ? OFFSET ?
      `)
      .all(...parameters, filters.limit, filters.offset) as unknown as TaskRow[];

    return {
      items: rows.map(mapTask),
      total: Number(countRow.total),
      limit: filters.limit,
      offset: filters.offset,
    };
  }

  public findById(id: string): Task | null {
    const row = this.database
      .prepare("SELECT * FROM tasks WHERE id = ?")
      .get(id) as TaskRow | undefined;

    return row ? mapTask(row) : null;
  }

  public update(id: string, input: UpdateTaskInput, traceId: string): Task | null {
    return this.database.transaction(() => {
      const existing = this.findById(id);

      if (!existing) {
        return null;
      }

      const updated: Task = {
        ...existing,
        ...input,
        description:
          input.description === undefined ? existing.description : input.description,
        dueDate: input.dueDate === undefined ? existing.dueDate : input.dueDate,
        version: existing.version + 1,
        updatedAt: new Date().toISOString(),
      };

      const result = this.database
        .prepare(`
          UPDATE tasks
          SET title = ?, description = ?, status = ?, priority = ?, due_date = ?,
              version = ?, updated_at = ?
          WHERE id = ? AND version = ?
        `)
        .run(
          updated.title,
          updated.description,
          updated.status,
          updated.priority,
          updated.dueDate,
          updated.version,
          updated.updatedAt,
          id,
          existing.version,
        );

      if (Number(result.changes) !== 1) {
        throw new Error("Concurrent update detected");
      }

      this.writeAudit(traceId, "UPDATE", id, existing, updated);
      return updated;
    });
  }

  public delete(id: string, traceId: string): boolean {
    return this.database.transaction(() => {
      const existing = this.findById(id);

      if (!existing) {
        return false;
      }

      const result = this.database
        .prepare("DELETE FROM tasks WHERE id = ?")
        .run(id);

      if (Number(result.changes) !== 1) {
        throw new Error("Task could not be deleted");
      }

      this.writeAudit(traceId, "DELETE", id, existing, null);
      return true;
    });
  }

  public countAuditLogs(taskId?: string): number {
    const row = taskId
      ? (this.database
          .prepare("SELECT COUNT(*) AS total FROM task_audit_logs WHERE task_id = ?")
          .get(taskId) as { total: number })
      : (this.database
          .prepare("SELECT COUNT(*) AS total FROM task_audit_logs")
          .get() as { total: number });

    return Number(row.total);
  }

  private writeAudit(
    traceId: string,
    action: "CREATE" | "UPDATE" | "DELETE",
    taskId: string,
    before: Task | null,
    after: Task | null,
  ): void {
    this.database
      .prepare(`
        INSERT INTO task_audit_logs(
          trace_id, action, task_id, before_json, after_json, created_at
        ) VALUES (?, ?, ?, ?, ?, ?)
      `)
      .run(
        traceId,
        action,
        taskId,
        before ? JSON.stringify(before) : null,
        after ? JSON.stringify(after) : null,
        new Date().toISOString(),
      );
  }
}
