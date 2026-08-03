import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, test } from "node:test";
import { createApp } from "../src/app";

const directory = mkdtempSync(join(tmpdir(), "problem5-api-"));
const databasePath = join(directory, "test.sqlite");
const resources = createApp({ databasePath });
let server: Server;
let baseUrl = "";
let taskId = "";

before(async () => {
  await new Promise<void>((resolve) => {
    server = resources.app.listen(0, "127.0.0.1", () => {
      const address = server.address() as AddressInfo;
      baseUrl = `http://127.0.0.1:${address.port}`;
      resolve();
    });
  });
});

after(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((error?: Error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });

  resources.database.close();
  rmSync(directory, { recursive: true, force: true });
});

async function json(response: Response): Promise<any> {
  return response.status === 204 ? null : response.json();
}

test("health endpoint", async () => {
  const response = await fetch(`${baseUrl}/health`);

  assert.equal(response.status, 200);
  assert.equal((await json(response)).status, "ok");
});

test("create a task", async () => {
  const response = await fetch(`${baseUrl}/api/v1/tasks`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      title: "Write integration tests",
      description: "Exercise every CRUD endpoint",
      status: "TODO",
      priority: "HIGH",
    }),
  });

  assert.equal(response.status, 201);

  const body = await json(response);
  taskId = body.data.id;

  assert.equal(body.data.title, "Write integration tests");
  assert.equal(
    response.headers.get("location"),
    `/api/v1/tasks/${taskId}`,
  );
});

test("list and filter tasks", async () => {
  const response = await fetch(
    `${baseUrl}/api/v1/tasks?status=TODO&priority=HIGH&search=integration`,
  );
  const body = await json(response);

  assert.equal(response.status, 200);
  assert.equal(body.meta.total, 1);
  assert.equal(body.data[0].id, taskId);
});

test("get task details", async () => {
  const response = await fetch(
    `${baseUrl}/api/v1/tasks/${taskId}`,
  );

  assert.equal(response.status, 200);
  assert.equal((await json(response)).data.id, taskId);
});

test("update task details", async () => {
  const response = await fetch(
    `${baseUrl}/api/v1/tasks/${taskId}`,
    {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        status: "DONE",
        priority: "MEDIUM",
      }),
    },
  );

  const body = await json(response);

  assert.equal(response.status, 200);
  assert.equal(body.data.status, "DONE");
  assert.equal(body.data.version, 2);
});

test("invalid payload creates trouble log", async () => {
  const response = await fetch(`${baseUrl}/api/v1/tasks`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-request-id": "invalid-payload-test",
    },
    body: JSON.stringify({
      title: "",
      unexpected: true,
    }),
  });

  const body = await json(response);

  assert.equal(response.status, 400);
  assert.equal(body.error.code, "VALIDATION_ERROR");
  assert.equal(body.error.requestId, "invalid-payload-test");

  const logsResponse = await fetch(
    `${baseUrl}/api/v1/trouble-logs?requestId=invalid-payload-test`,
  );
  const logsBody = await json(logsResponse);

  assert.equal(logsResponse.status, 200);
  assert.equal(logsBody.meta.total, 1);
  assert.equal(logsBody.data[0].errorCode, "VALIDATION_ERROR");
  assert.equal(logsBody.data[0].statusCode, 400);
});

test("unknown route creates trouble log", async () => {
  const response = await fetch(`${baseUrl}/missing-route`, {
    headers: {
      "x-request-id": "missing-route-test",
    },
  });

  assert.equal(response.status, 404);

  const logsResponse = await fetch(
    `${baseUrl}/api/v1/trouble-logs?requestId=missing-route-test`,
  );
  const logsBody = await json(logsResponse);

  assert.equal(logsBody.meta.total, 1);
  assert.equal(logsBody.data[0].errorCode, "ROUTE_NOT_FOUND");
});

test("delete task and expose three audit records", async () => {
  const deleted = await fetch(
    `${baseUrl}/api/v1/tasks/${taskId}`,
    {
      method: "DELETE",
    },
  );

  assert.equal(deleted.status, 204);

  const missing = await fetch(
    `${baseUrl}/api/v1/tasks/${taskId}`,
  );

  assert.equal(missing.status, 404);
  assert.equal(
    (await json(missing)).error.code,
    "TASK_NOT_FOUND",
  );

  const auditResponse = await fetch(
    `${baseUrl}/api/v1/audit-logs?taskId=${taskId}&limit=10`,
  );
  const auditBody = await json(auditResponse);

  assert.equal(auditResponse.status, 200);
  assert.equal(auditBody.meta.total, 3);

  const actions = auditBody.data
    .map((item: { action: string }) => item.action)
    .sort();

  assert.deepEqual(actions, [
    "CREATE",
    "DELETE",
    "UPDATE",
  ]);
});
