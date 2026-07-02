import { calculateUrgency, execute, query, queryOne } from "@/utils.js";
import { getTaskTagsBulk } from "@/services/task_tag.service.js";
import type {
  CreateTaskInput,
  ListTasksFilter,
  SqlValue,
  Task,
  TaskStatus,
  UpdateTaskInput
} from "@/interfaces/task.interface.js";

function normalizePriority(priority: unknown): number {
  if (priority === undefined || priority === null) {
    throw new Error("priority is required");
  }

  if (typeof priority !== "number" || !Number.isInteger(priority)) {
    throw new Error("priority must be integer");
  }

  if (priority < 1 || priority > 10) {
    throw new Error("priority must be between 1 and 10");
  }

  return priority;
}

function enrichTasks(tasks: Task[]) {
  const ids = tasks.map(t => t.id);
  const tagMap = getTaskTagsBulk(ids);

  return tasks.map(task => ({
    ...task,
    urgencyScore: calculateUrgency(task),
    tags: tagMap.get(task.id) ?? []
  }));
}

export function createTask(input: CreateTaskInput) {
  const result = execute(
    `
      INSERT INTO tasks (title, description, priority, due_at, updated_at)
      VALUES (?, ?, ?, ?, datetime('now'))
    `,
    [
      input.title,
      input.description ?? null,
      normalizePriority(input.priority),
      input.due_at ?? null
    ]
  );

  const id = Number(result.lastInsertRowid);

  execute(
    `
      INSERT INTO task_events (task_id, event, payload)
      VALUES (?, 'TASK_CREATED', ?)
    `,
    [id, JSON.stringify(input)]
  );

  return getTaskById(id);
}

export function getTaskById(id: number) {
  const task = queryOne<Task>(
    "SELECT * FROM tasks WHERE id = ?",
    [id]
  );

  if (!task) return null;

  const tagsMap = getTaskTagsBulk([id]);

  return {
    ...task,
    urgencyScore: calculateUrgency(task),
    tags: tagsMap.get(id) ?? []
  };
}

export function listTasks(filter: ListTasksFilter = {}) {
  const params: SqlValue[] = [];

  let sql = `
    SELECT t.*
    FROM tasks t
    WHERE 1 = 1
  `;

  if (filter.status) {
    sql += ` AND t.status = ?`;
    params.push(filter.status);
  }

  if (filter.priority !== undefined) {
    sql += ` AND t.priority = ?`;
    params.push(filter.priority);
  }

  if (filter.tags?.length) {
    const placeholders = filter.tags.map(() => "?").join(",");

    sql += `
      AND EXISTS (
        SELECT 1
        FROM task_tags tt
        JOIN tags tg ON tg.id = tt.tag_id
        WHERE tt.task_id = t.id
        AND tg.name IN (${placeholders})
      )
    `;

    params.push(...filter.tags);
  }

  const tasks = query<Task>(sql, params);

  return enrichTasks(tasks)
    .sort((a, b) => b.urgencyScore - a.urgencyScore);
}

export function updateStatus(id: number, status: TaskStatus) {
  const current = queryOne<Task>(
    "SELECT * FROM tasks WHERE id = ?",
    [id]
  );

  if (!current) return null;

  execute(
    `
      UPDATE tasks
      SET status = ?, updated_at = datetime('now')
      WHERE id = ?
    `,
    [status, id]
  );

  execute(
    `
      INSERT INTO task_events (task_id, event, payload)
      VALUES (?, 'STATUS_CHANGED', ?)
    `,
    [id, JSON.stringify({ from: current.status, to: status })]
  );

  return getTaskById(id);
}

export function updateTask(id: number, input: UpdateTaskInput) {
  const current = queryOne<Task>(
    "SELECT * FROM tasks WHERE id = ?",
    [id]
  );

  if (!current) return null;

  const updates: string[] = [];
  const params: SqlValue[] = [];

  if (input.title !== undefined) {
    updates.push("title = ?");
    params.push(input.title);
  }

  if (input.description !== undefined) {
    updates.push("description = ?");
    params.push(input.description);
  }

  if (input.priority !== undefined) {
    updates.push("priority = ?");
    params.push(normalizePriority(input.priority));
  }

  if (input.due_at !== undefined) {
    updates.push("due_at = ?");
    params.push(input.due_at);
  }

  if (!updates.length) return getTaskById(id);

  updates.push("updated_at = datetime('now')");
  params.push(id);

  execute(
    `
      UPDATE tasks
      SET ${updates.join(", ")}
      WHERE id = ?
    `,
    params
  );

  execute(
    `
      INSERT INTO task_events (task_id, event, payload)
      VALUES (?, 'TASK_UPDATED', ?)
    `,
    [id, JSON.stringify(input)]
  );

  return getTaskById(id);
}

export function deleteTask(id: number) {
  const current = queryOne<Task>(
    "SELECT * FROM tasks WHERE id = ?",
    [id]
  );

  if (!current) return null;

  execute(
    `
      INSERT INTO task_events (task_id, event, payload)
      VALUES (?, 'TASK_DELETED', ?)
    `,
    [id, JSON.stringify(current)]
  );

  execute("DELETE FROM tasks WHERE id = ?", [id]);

  return current;
}