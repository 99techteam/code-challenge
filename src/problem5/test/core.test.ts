import assert from "node:assert/strict";
import { test } from "node:test";
import { Database } from "../src/database";
import { ObservabilityRepository } from "../src/repositories/observability.repository";
import { TaskRepository } from "../src/repositories/task.repository";
import { ObservabilityService } from "../src/services/observability.service";
import { TaskService } from "../src/services/task.service";

const taskFilters = {
  sortBy: "createdAt" as const,
  order: "desc" as const,
  limit: 20,
  offset: 0,
};

test("CRUD audit and trouble logs persist in SQLite", () => {
  const database = new Database(":memory:");
  const taskRepository = new TaskRepository(database);
  const observabilityRepository =
    new ObservabilityRepository(database);

  const taskService = new TaskService(taskRepository);
  const observabilityService =
    new ObservabilityService(observabilityRepository);

  try {
    const created = taskService.create(
      {
        title: "Build API",
        description: "Persistence test",
        status: "TODO",
        priority: "HIGH",
        dueDate: null,
      },
      "trace-create",
    );

    const updated = taskService.update(
      created.id,
      {
        status: "IN_PROGRESS",
      },
      "trace-update",
    );

    assert.equal(updated.version, 2);
    assert.equal(taskService.list(taskFilters).total, 1);

    taskService.delete(created.id, "trace-delete");

    const auditLogs = observabilityService.listAuditLogs({
      taskId: created.id,
      limit: 20,
      offset: 0,
    });

    assert.equal(auditLogs.total, 3);
    assert.equal(auditLogs.items[0]?.action, "DELETE");
    assert.equal(auditLogs.items[1]?.action, "UPDATE");
    assert.equal(auditLogs.items[2]?.action, "CREATE");

    observabilityService.recordTrouble({
      requestId: "request-test",
      method: "POST",
      path: "/api/v1/tasks",
      statusCode: 400,
      errorCode: "VALIDATION_ERROR",
      message: "title is required",
      details: {
        field: "title",
      },
      durationMs: 3,
    });

    const troubleLogs = observabilityService.listTroubleLogs({
      requestId: "request-test",
      limit: 20,
      offset: 0,
    });

    assert.equal(troubleLogs.total, 1);
    assert.equal(
      troubleLogs.items[0]?.errorCode,
      "VALIDATION_ERROR",
    );
    assert.deepEqual(
      troubleLogs.items[0]?.details,
      { field: "title" },
    );
  } finally {
    database.close();
  }
});
