import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { createApp, JsonResourceDatabase } from "./index";

test("Problem 5 CRUD flow persists resources and supports filters", async () => {
  const tempDirectory = await mkdtemp(path.join(tmpdir(), "problem5-"));
  const databaseFile = path.join(tempDirectory, "database.json");
  const app = createApp(new JsonResourceDatabase(databaseFile));
  const server = app.listen(0);

  try {
    const address = server.address();
    assert(address && typeof address === "object");

    const baseUrl = `http://127.0.0.1:${address.port}`;

    const created = await request(baseUrl, "/resources", {
      method: "POST",
      body: {
        title: "Interview preparation notes",
        description: "Backend CRUD practice task",
        category: "study",
        tags: ["typescript", "express"],
      },
    });

    assert.equal(created.status, 201);
    assert.equal(created.body.data.title, "Interview preparation notes");

    const id = created.body.data.id as string;
    const filtered = await request(
      baseUrl,
      "/resources?category=study&tag=typescript&search=backend",
    );

    assert.equal(filtered.status, 200);
    assert.equal(filtered.body.count, 1);

    const detail = await request(baseUrl, `/resources/${id}`);
    assert.equal(detail.status, 200);
    assert.equal(detail.body.data.id, id);

    const updated = await request(baseUrl, `/resources/${id}`, {
      method: "PATCH",
      body: { status: "archived" },
    });

    assert.equal(updated.status, 200);
    assert.equal(updated.body.data.status, "archived");

    const deleted = await request(baseUrl, `/resources/${id}`, { method: "DELETE" });
    assert.equal(deleted.status, 204);

    const missing = await request(baseUrl, `/resources/${id}`);
    assert.equal(missing.status, 404);
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
    await rm(tempDirectory, { recursive: true, force: true });
  }
});

test("Problem 5 validates request bodies", async () => {
  const app = createApp(new JsonResourceDatabase(path.join(tmpdir(), "problem5-validation.json")));
  const server = app.listen(0);

  try {
    const address = server.address();
    assert(address && typeof address === "object");

    const response = await request(`http://127.0.0.1:${address.port}`, "/resources", {
      method: "POST",
      body: { category: "study" },
    });

    assert.equal(response.status, 400);
    assert.equal(response.body.error, "title is required and must be a non-empty string");
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
});

async function request(
  baseUrl: string,
  pathname: string,
  options: { method?: string; body?: unknown } = {},
): Promise<{ status: number; body: any }> {
  const response = await fetch(`${baseUrl}${pathname}`, {
    method: options.method ?? "GET",
    headers: options.body === undefined ? undefined : { "Content-Type": "application/json" },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  const text = await response.text();

  return {
    status: response.status,
    body: text ? JSON.parse(text) : null,
  };
}
