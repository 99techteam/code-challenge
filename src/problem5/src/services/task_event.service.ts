import type { ListTaskEventsFilter, TaskEvent } from "@/interfaces/task_event.interface.js";
import { query, queryOne } from "@/utils.js";

export function listTaskEvents(filter: ListTaskEventsFilter = {}) {
  let sql = "SELECT * FROM task_events WHERE 1 = 1";
  const params: (string | number)[] = [];

  if (filter.taskId !== undefined) {
    sql += " AND task_id = ?";
    params.push(filter.taskId);
  }

  if (filter.event !== undefined) {
    sql += " AND event = ?";
    params.push(filter.event);
  }

  sql += " ORDER BY created_at DESC";

  return query<TaskEvent>(sql, params);
}

export function getTaskEventById(id: number) {
  return queryOne<TaskEvent>(
    "SELECT * FROM task_events WHERE id = ?",
    [id]
  );
}

export function getTaskEventsByTaskId(taskId: number) {
  return query<TaskEvent>(
    "SELECT * FROM task_events WHERE task_id = ? ORDER BY created_at DESC",
    [taskId]
  );
}