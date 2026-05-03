import { afterEach, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp, type AppHandle } from "../src/app.js";

/**
 * Integration tests for the resources CRUD surface.
 *
 * Each suite spins up a fresh in-memory SQLite via the createApp factory so
 * tests are fully isolated and parallel-safe. We hit the real Express stack
 * (middleware + zod + service + repo) — only the network is virtualised by
 * supertest.
 */

let handle: AppHandle;
const app = () => handle.app;

beforeEach(() => {
  handle = createApp({ databasePath: ":memory:" });
});
afterEach(() => {
  handle.close();
});

const sample = (overrides: Record<string, unknown> = {}) => ({
  name: "Compute Cluster A",
  category: "infrastructure",
  status: "active",
  ...overrides,
});

describe("POST /resources", () => {
  it("creates a resource and returns 201 with the standard envelope", async () => {
    const res = await request(app()).post("/resources").send(sample());
    expect(res.status).toBe(201);
    expect(res.body.ok).toBe(true);
    expect(res.body.data).toMatchObject({
      name: "Compute Cluster A",
      category: "infrastructure",
      status: "active",
    });
    expect(res.body.data.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(typeof res.body.data.createdAt).toBe("string");
    expect(res.body.data.updatedAt).toBe(res.body.data.createdAt);
  });

  it("defaults status to 'active' when omitted", async () => {
    const res = await request(app())
      .post("/resources")
      .send({ name: "X", category: "y" });
    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe("active");
  });

  it("rejects missing fields with 422 + field details", async () => {
    const res = await request(app()).post("/resources").send({ name: "" });
    expect(res.status).toBe(422);
    expect(res.body.ok).toBe(false);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: "name" }),
        expect.objectContaining({ path: "category" }),
      ]),
    );
  });

  it("rejects invalid status enum value", async () => {
    const res = await request(app())
      .post("/resources")
      .send(sample({ status: "exploded" }));
    expect(res.status).toBe(422);
    expect(res.body.error.details[0].path).toBe("status");
  });

  it("trims whitespace and rejects strings that become empty", async () => {
    const res = await request(app())
      .post("/resources")
      .send(sample({ name: "   " }));
    expect(res.status).toBe(422);
  });
});

describe("GET /resources", () => {
  it("returns empty list with no pagination on a fresh DB", async () => {
    const res = await request(app()).get("/resources");
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
    expect(res.body.pagination).toEqual({
      limit: 20,
      nextCursor: null,
      hasMore: false,
    });
  });

  it("filters by category and status", async () => {
    await request(app()).post("/resources").send(sample({ name: "A", category: "infra" }));
    await request(app()).post("/resources").send(sample({ name: "B", category: "infra", status: "draft" }));
    await request(app()).post("/resources").send(sample({ name: "C", category: "media" }));

    const r1 = await request(app()).get("/resources?category=infra");
    expect(r1.status).toBe(200);
    expect(r1.body.data).toHaveLength(2);
    expect(r1.body.data.every((r: { category: string }) => r.category === "infra")).toBe(true);

    const r2 = await request(app()).get("/resources?status=draft");
    expect(r2.body.data).toHaveLength(1);
    expect(r2.body.data[0].name).toBe("B");

    const r3 = await request(app()).get("/resources?q=B");
    expect(r3.body.data).toHaveLength(1);
    expect(r3.body.data[0].name).toBe("B");
  });

  it("paginates with cursor", async () => {
    for (const name of ["A", "B", "C"]) {
      await request(app()).post("/resources").send(sample({ name }));
      await new Promise((r) => setTimeout(r, 5));
    }
    const page1 = await request(app()).get("/resources?limit=2");
    expect(page1.body.data).toHaveLength(2);
    expect(page1.body.pagination.hasMore).toBe(true);
    expect(page1.body.pagination.nextCursor).toBeTruthy();

    const cursor = encodeURIComponent(page1.body.pagination.nextCursor as string);
    const page2 = await request(app()).get(`/resources?limit=2&cursor=${cursor}`);
    expect(page2.body.data).toHaveLength(1);
    expect(page2.body.pagination.hasMore).toBe(false);
  });

  it("paginates correctly even when rows share a created_at", async () => {
    // Insert without delay so timestamps may collide. The composite cursor
    // (created_at, id) must still produce a stable, complete walk.
    const inserts = await Promise.all(
      ["A", "B", "C", "D", "E"].map((name) =>
        request(app()).post("/resources").send(sample({ name })),
      ),
    );
    expect(inserts.every((r) => r.status === 201)).toBe(true);

    const seen = new Set<string>();
    let cursor: string | null = null;
    for (let page = 0; page < 5; page++) {
      const url = `/resources?limit=2${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}`;
      const res = await request(app()).get(url);
      expect(res.status).toBe(200);
      for (const row of res.body.data) seen.add(row.id);
      cursor = res.body.pagination.nextCursor;
      if (!cursor) break;
    }
    expect(seen.size).toBe(5);
  });

  it("rejects an invalid cursor with 422", async () => {
    const res = await request(app()).get("/resources?cursor=" + encodeURIComponent("@@@bad@@@"));
    expect(res.status).toBe(422);
  });

  it("treats LIKE wildcards in `q` as literal characters", async () => {
    await request(app()).post("/resources").send(sample({ name: "alpha" }));
    await request(app()).post("/resources").send(sample({ name: "beta" }));
    await request(app()).post("/resources").send(sample({ name: "100% off" }));

    // q='%' must NOT match every row — it should match only the literal '%'.
    const r1 = await request(app()).get("/resources?q=%25"); // url-encoded '%'
    expect(r1.body.data).toHaveLength(1);
    expect(r1.body.data[0].name).toBe("100% off");

    // q='_' must NOT match every single-char row.
    const r2 = await request(app()).get("/resources?q=_");
    expect(r2.body.data).toHaveLength(0);
  });

  it("rejects limit > 100", async () => {
    const res = await request(app()).get("/resources?limit=999");
    expect(res.status).toBe(422);
  });
});

describe("GET /resources/:id", () => {
  it("returns 200 + the resource for an existing id", async () => {
    const created = await request(app()).post("/resources").send(sample());
    const id = created.body.data.id as string;
    const res = await request(app()).get(`/resources/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(id);
  });

  it("returns 404 for a valid-but-unknown UUID", async () => {
    const res = await request(app()).get("/resources/00000000-0000-4000-8000-000000000000");
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  it("returns 422 for a non-UUID id", async () => {
    const res = await request(app()).get("/resources/not-a-uuid");
    expect(res.status).toBe(422);
  });
});

describe("PATCH /resources/:id", () => {
  it("updates only the supplied fields and bumps updatedAt", async () => {
    const created = await request(app()).post("/resources").send(sample());
    const id = created.body.data.id as string;
    const before = created.body.data.updatedAt as string;

    await new Promise((r) => setTimeout(r, 5));
    const res = await request(app())
      .patch(`/resources/${id}`)
      .send({ status: "archived" });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("archived");
    expect(res.body.data.name).toBe("Compute Cluster A"); // unchanged
    expect(res.body.data.updatedAt > before).toBe(true);
  });

  it("rejects empty body with 422", async () => {
    const created = await request(app()).post("/resources").send(sample());
    const id = created.body.data.id as string;
    const res = await request(app()).patch(`/resources/${id}`).send({});
    expect(res.status).toBe(422);
  });

  it("returns 404 when the id is unknown", async () => {
    const res = await request(app())
      .patch("/resources/00000000-0000-4000-8000-000000000000")
      .send({ status: "archived" });
    expect(res.status).toBe(404);
  });
});

describe("DELETE /resources/:id", () => {
  it("returns 204 and the resource is gone afterwards", async () => {
    const created = await request(app()).post("/resources").send(sample());
    const id = created.body.data.id as string;

    const del = await request(app()).delete(`/resources/${id}`);
    expect(del.status).toBe(204);

    const get = await request(app()).get(`/resources/${id}`);
    expect(get.status).toBe(404);
  });

  it("returns 404 when the id is unknown", async () => {
    const res = await request(app()).delete("/resources/00000000-0000-4000-8000-000000000000");
    expect(res.status).toBe(404);
  });
});

describe("infrastructure", () => {
  it("/health returns 200 ok", async () => {
    const res = await request(app()).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });

  it("/health/ready confirms DB connectivity", async () => {
    const res = await request(app()).get("/health/ready");
    expect(res.status).toBe(200);
    expect(res.body.db).toBe("ok");
  });

  it("echoes a supplied X-Request-Id", async () => {
    const res = await request(app())
      .get("/health")
      .set("X-Request-Id", "abc-test-123");
    expect(res.headers["x-request-id"]).toBe("abc-test-123");
  });

  it("generates an X-Request-Id when none is supplied", async () => {
    const res = await request(app()).get("/health");
    expect(res.headers["x-request-id"]).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("404s unknown routes with the standard envelope", async () => {
    const res = await request(app()).get("/no-such-thing");
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("ROUTE_NOT_FOUND");
  });
});
