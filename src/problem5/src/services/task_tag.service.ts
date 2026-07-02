import { execute, query, queryOne } from "@/utils.js";
import { getOrCreateTag } from "./tag.service.js";
import type { Tag } from "@/interfaces/tag.interface.js";

function assertTaskExists(taskId: number) {
  const task = queryOne<{ id: number }>(
    `SELECT id FROM tasks WHERE id = ?`,
    [taskId]
  );

  if (!task) {
    throw new Error("Task not found");
  }
}

export function addTagToTask(taskId: number, tagName: string) {
  assertTaskExists(taskId);

  const tag = getOrCreateTag(tagName);

  execute(
    `
      INSERT OR IGNORE INTO task_tags (task_id, tag_id)
      VALUES (?, ?)
    `,
    [taskId, tag.id]
  );

  return getTaskTags(taskId);
}

export function removeTagFromTask(taskId: number, tagId: number) {
  assertTaskExists(taskId);

  execute(
    `
      DELETE FROM task_tags
      WHERE task_id = ? AND tag_id = ?
    `,
    [taskId, tagId]
  );

  return getTaskTags(taskId);
}

export function getTaskTags(taskId: number): Tag[] {
  return query<Tag>(
    `
      SELECT t.id, t.name
      FROM tags t
      JOIN task_tags tt ON tt.tag_id = t.id
      WHERE tt.task_id = ?
      ORDER BY t.name ASC
    `,
    [taskId]
  );
}

export function getTaskTagsBulk(taskIds: number[]): Map<number, Tag[]> {
  const map = new Map<number, Tag[]>();

  if (!taskIds.length) return map;

  const placeholders = taskIds.map(() => "?").join(",");

  const rows = query<
    Tag & { task_id: number }
  >(
    `
      SELECT tt.task_id, t.id, t.name
      FROM task_tags tt
      JOIN tags t ON t.id = tt.tag_id
      WHERE tt.task_id IN (${placeholders})
    `,
    taskIds
  );

  for (const id of taskIds) {
    map.set(id, []);
  }

  for (const row of rows) {
    const { task_id, id, name } = row;

    const list = map.get(task_id);
    if (list) {
      list.push({ id, name });
    }
  }

  return map;
}