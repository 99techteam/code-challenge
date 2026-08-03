import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createApp } from "../src/app";

interface CreatedTaskResponse {
  data: {
    id: string;
  };
}

interface ListResponse {
  meta: {
    total: number;
  };
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

/**
 * Retries only transport-level failures. HTTP error responses are returned
 * normally and validated by the caller.
 */
async function fetchWithRetry(
  url: string,
  init: RequestInit,
  maximumAttempts = 4,
): Promise<Response> {
  let lastError: unknown;

  for (
    let attempt = 1;
    attempt <= maximumAttempts;
    attempt += 1
  ) {
    try {
      return await fetch(url, init);
    } catch (error) {
      lastError = error;

      if (attempt === maximumAttempts) {
        break;
      }

      await delay(25 * 2 ** (attempt - 1));
    }
  }

  throw new Error(
    `Transport failure after ${maximumAttempts} attempts: ${url}`,
    {
      cause: lastError,
    },
  );
}

async function expectJson<T>(
  url: string,
  init: RequestInit,
  expectedStatus: number,
): Promise<T> {
  const response = await fetchWithRetry(url, init);
  const text = await response.text();

  if (response.status !== expectedStatus) {
    throw new Error(
      [
        `${init.method ?? "GET"} ${url}`,
        `expected HTTP ${expectedStatus}`,
        `received HTTP ${response.status}`,
        `body=${text}`,
      ].join("; "),
    );
  }

  try {
    return JSON.parse(text) as T;
  } catch (error) {
    throw new Error(
      `Response is not valid JSON: ${init.method ?? "GET"} ${url}`,
      {
        cause: error,
      },
    );
  }
}

async function expectStatus(
  url: string,
  init: RequestInit,
  expectedStatus: number,
): Promise<void> {
  const response = await fetchWithRetry(url, init);

  if (response.status !== expectedStatus) {
    const body = await response.text();

    throw new Error(
      [
        `${init.method ?? "GET"} ${url}`,
        `expected HTTP ${expectedStatus}`,
        `received HTTP ${response.status}`,
        `body=${body}`,
      ].join("; "),
    );
  }

  // Consume the body so the connection can be reused cleanly.
  await response.arrayBuffer();
}

/**
 * Runs bounded concurrency and waits for every worker before throwing.
 *
 * The old Promise.all implementation failed fast. Its finally block then
 * closed the server while other requests were still in flight, producing
 * secondary ECONNREFUSED errors that hid the original failure.
 */
async function mapWithConcurrency<T, R>(
  items: readonly T[],
  concurrency: number,
  operation: (
    item: T,
    index: number,
  ) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  const errors: Error[] = [];
  let nextIndex = 0;

  async function worker(): Promise<void> {
    while (true) {
      const index = nextIndex;
      nextIndex += 1;

      if (index >= items.length) {
        return;
      }

      const item = items[index];

      if (item === undefined) {
        errors.push(
          new Error(`Missing work item at index ${index}`),
        );
        continue;
      }

      try {
        results[index] = await operation(item, index);
      } catch (error) {
        errors.push(
          new Error(
            `Stress operation failed at index ${index}`,
            {
              cause: error,
            },
          ),
        );
      }
    }
  }

  const workerCount = Math.min(
    Math.max(1, concurrency),
    items.length,
  );

  await Promise.all(
    Array.from(
      { length: workerCount },
      () => worker(),
    ),
  );

  if (errors.length > 0) {
    throw new AggregateError(
      errors,
      `${errors.length} stress operations failed`,
    );
  }

  return results;
}

async function waitUntilListening(
  server: Server,
): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const onListening = (): void => {
      server.off("error", onError);
      resolve();
    };

    const onError = (error: Error): void => {
      server.off("listening", onListening);
      reject(error);
    };

    server.once("listening", onListening);
    server.once("error", onError);
  });
}

async function closeServer(
  server: Server,
): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    server.close((error?: Error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });

    server.closeIdleConnections();
  });
}

async function main(): Promise<void> {
  const directory = mkdtempSync(
    join(tmpdir(), "problem5-stress-"),
  );

  const resources = createApp({
    databasePath: join(directory, "stress.sqlite"),
  });

  // A larger backlog helps on Windows when many clients connect quickly.
  const server = resources.app.listen({
    port: 0,
    host: "127.0.0.1",
    backlog: 1_024,
  });

  try {
    await waitUntilListening(server);

    const address = server.address();

    if (
      address === null ||
      typeof address === "string"
    ) {
      throw new Error(
        "Stress server did not expose a TCP address",
      );
    }

    const { port } = address as AddressInfo;
    const baseUrl = `http://127.0.0.1:${port}`;
    const startedAt = Date.now();

    // Confirm that the server is reachable before starting the load.
    await expectJson<{ status: string }>(
      `${baseUrl}/health`,
      {
        method: "GET",
      },
      200,
    );

    const createIndexes = Array.from(
      { length: 250 },
      (_, index) => index,
    );

    const createdIds = await mapWithConcurrency(
      createIndexes,
      25,
      async (index) => {
        const body = await expectJson<CreatedTaskResponse>(
          `${baseUrl}/api/v1/tasks`,
          {
            method: "POST",
            headers: {
              "content-type": "application/json",
              "x-request-id": `stress-create-${index}`,
            },
            body: JSON.stringify({
              title: `Stress task ${index}`,
              status:
                index % 2 === 0
                  ? "TODO"
                  : "IN_PROGRESS",
              priority:
                index % 3 === 0
                  ? "HIGH"
                  : "MEDIUM",
            }),
          },
          201,
        );

        return body.data.id;
      },
    );

    await mapWithConcurrency(
      createdIds.slice(0, 100),
      20,
      async (id, index) => {
        await expectJson(
          `${baseUrl}/api/v1/tasks/${id}`,
          {
            method: "PATCH",
            headers: {
              "content-type": "application/json",
              "x-request-id": `stress-update-${index}`,
            },
            body: JSON.stringify({
              status: "DONE",
            }),
          },
          200,
        );
      },
    );

    await mapWithConcurrency(
      createdIds.slice(0, 50),
      10,
      async (id, index) => {
        await expectStatus(
          `${baseUrl}/api/v1/tasks/${id}`,
          {
            method: "DELETE",
            headers: {
              "x-request-id": `stress-delete-${index}`,
            },
          },
          204,
        );
      },
    );

    const invalidIndexes = Array.from(
      { length: 50 },
      (_, index) => index,
    );

    await mapWithConcurrency(
      invalidIndexes,
      20,
      async (index) => {
        await expectJson(
          `${baseUrl}/api/v1/tasks`,
          {
            method: "POST",
            headers: {
              "content-type": "application/json",
              "x-request-id": `stress-invalid-${index}`,
            },
            body: JSON.stringify({
              title: "",
            }),
          },
          400,
        );
      },
    );

    const auditBody = await expectJson<ListResponse>(
      `${baseUrl}/api/v1/audit-logs?limit=1`,
      {
        method: "GET",
      },
      200,
    );

    const troubleBody = await expectJson<ListResponse>(
      `${baseUrl}/api/v1/trouble-logs?errorCode=VALIDATION_ERROR&limit=1`,
      {
        method: "GET",
      },
      200,
    );

    assert.equal(
      auditBody.meta.total,
      400,
      "Expected 250 creates + 100 updates + 50 deletes",
    );

    assert.equal(
      troubleBody.meta.total,
      50,
      "Expected one trouble record for each invalid request",
    );

    assert.equal(
      resources.observabilityRepository.countTroubleLogs(),
      50,
    );

    console.log("STRESS_TEST_PASS");
    console.log("creates=250");
    console.log("updates=100");
    console.log("deletes=50");
    console.log("auditRecords=400");
    console.log("troubleRecords=50");
    console.log("peakConcurrency=25");
    console.log(`elapsedMs=${Date.now() - startedAt}`);
  } finally {
    await closeServer(server);
    resources.database.close();

    rmSync(directory, {
      recursive: true,
      force: true,
    });
  }
}

main().catch((error: unknown) => {
  if (error instanceof AggregateError) {
    console.error(error.message);

    error.errors.forEach(
      (
        childError: unknown,
        index: number,
      ) => {
        console.error(
          `[${index + 1}]`,
          childError,
        );
      },
    );
  } else {
    console.error(error);
  }

  process.exitCode = 1;
});
