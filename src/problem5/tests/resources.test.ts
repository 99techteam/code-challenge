import { afterEach, describe, expect, test } from "bun:test";
import request from "supertest";
import { createApp } from "../src/app.ts";
import db from "../src/db/index.ts";

const app = createApp();

const clearDb = (): void => {
  db.run("DELETE FROM resources");
  db.run("DELETE FROM idempotency_keys");
};

afterEach(clearDb);

describe("POST /resources", () => {
  test("creates a resource with defaults", async () => {
    const res = await request(app)
      .post("/resources")
      .send({ name: "alpha" })
      .expect(201);
    expect(res.body).toMatchObject({
      name: "alpha",
      description: null,
      status: "active",
    });
    expect(res.body.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(res.body.createdAt).toBe(res.body.updatedAt);
  });

  test("accepts description and explicit status", async () => {
    const res = await request(app)
      .post("/resources")
      .send({ name: "beta", description: "  spaced  ", status: "inactive" })
      .expect(201);
    expect(res.body.description).toBe("spaced");
    expect(res.body.status).toBe("inactive");
  });

  test("rejects missing name", async () => {
    const res = await request(app).post("/resources").send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Validation failed");
  });

  test("rejects empty name", async () => {
    const res = await request(app).post("/resources").send({ name: "  " });
    expect(res.status).toBe(400);
  });

  test("rejects unknown status value", async () => {
    const res = await request(app)
      .post("/resources")
      .send({ name: "x", status: "weird" });
    expect(res.status).toBe(400);
  });

  test("rejects malformed JSON body", async () => {
    const res = await request(app)
      .post("/resources")
      .set("content-type", "application/json")
      .send("{not json");
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Invalid JSON body");
  });
});

describe("GET /resources", () => {
  test("returns empty page when nothing exists", async () => {
    const res = await request(app).get("/resources").expect(200);
    expect(res.body).toEqual({ items: [], total: 0, limit: 20, offset: 0 });
  });

  test("lists all resources with pagination metadata", async () => {
    await request(app).post("/resources").send({ name: "a" });
    await request(app).post("/resources").send({ name: "b", status: "archived" });

    const res = await request(app).get("/resources").expect(200);
    expect(res.body).toMatchObject({ total: 2, limit: 20, offset: 0 });
    expect(res.body.items).toHaveLength(2);
  });

  test("filters by status", async () => {
    await request(app).post("/resources").send({ name: "active-one" });
    await request(app)
      .post("/resources")
      .send({ name: "archived-one", status: "archived" });

    const res = await request(app).get("/resources?status=archived").expect(200);
    expect(res.body.total).toBe(1);
    expect(res.body.items[0].name).toBe("archived-one");
  });

  test("filters by q substring on name and description", async () => {
    await request(app)
      .post("/resources")
      .send({ name: "alpha widget", description: "tool" });
    await request(app)
      .post("/resources")
      .send({ name: "beta", description: "gadget" });

    const byName = await request(app).get("/resources?q=widget").expect(200);
    expect(byName.body.total).toBe(1);
    expect(byName.body.items[0].name).toBe("alpha widget");

    const byDesc = await request(app).get("/resources?q=gadget").expect(200);
    expect(byDesc.body.total).toBe(1);
    expect(byDesc.body.items[0].name).toBe("beta");
  });

  test("honours limit and offset", async () => {
    for (const name of ["a", "b", "c"]) {
      await request(app).post("/resources").send({ name });
    }
    const res = await request(app)
      .get("/resources?limit=1&offset=1")
      .expect(200);
    expect(res.body).toMatchObject({ total: 3, limit: 1, offset: 1 });
    expect(res.body.items).toHaveLength(1);
  });

  test("rejects limit above 100", async () => {
    const res = await request(app).get("/resources?limit=999");
    expect(res.status).toBe(400);
  });

  test("rejects negative offset", async () => {
    const res = await request(app).get("/resources?offset=-1");
    expect(res.status).toBe(400);
  });
});

describe("GET /resources/:id", () => {
  test("returns the matching resource", async () => {
    const create = await request(app).post("/resources").send({ name: "x" });
    const res = await request(app)
      .get(`/resources/${create.body.id}`)
      .expect(200);
    expect(res.body).toEqual(create.body);
  });

  test("404 for unknown id", async () => {
    const res = await request(app).get("/resources/does-not-exist");
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Resource not found");
  });
});

describe("PATCH /resources/:id", () => {
  test("updates only the provided fields and bumps updatedAt", async () => {
    const created = await request(app)
      .post("/resources")
      .send({ name: "old", description: "keep" });

    await Bun.sleep(5);
    const res = await request(app)
      .patch(`/resources/${created.body.id}`)
      .send({ name: "new" })
      .expect(200);

    expect(res.body.name).toBe("new");
    expect(res.body.description).toBe("keep");
    expect(res.body.status).toBe("active");
    expect(res.body.createdAt).toBe(created.body.createdAt);
    expect(res.body.updatedAt > created.body.updatedAt).toBe(true);
  });

  test("can null out description", async () => {
    const created = await request(app)
      .post("/resources")
      .send({ name: "x", description: "to be removed" });
    const res = await request(app)
      .patch(`/resources/${created.body.id}`)
      .send({ description: null })
      .expect(200);
    expect(res.body.description).toBeNull();
  });

  test("rejects an empty body", async () => {
    const created = await request(app).post("/resources").send({ name: "x" });
    const res = await request(app)
      .patch(`/resources/${created.body.id}`)
      .send({});
    expect(res.status).toBe(400);
  });

  test("rejects unknown status", async () => {
    const created = await request(app).post("/resources").send({ name: "x" });
    const res = await request(app)
      .patch(`/resources/${created.body.id}`)
      .send({ status: "bogus" });
    expect(res.status).toBe(400);
  });

  test("404 for missing id", async () => {
    const res = await request(app)
      .patch("/resources/nope")
      .send({ name: "x" });
    expect(res.status).toBe(404);
  });
});

describe("DELETE /resources/:id", () => {
  test("removes the resource and 204s", async () => {
    const created = await request(app).post("/resources").send({ name: "x" });
    await request(app).delete(`/resources/${created.body.id}`).expect(204);
    await request(app).get(`/resources/${created.body.id}`).expect(404);
  });

  test("404 for missing id", async () => {
    await request(app).delete("/resources/nope").expect(404);
  });
});

describe("Idempotency on POST /resources", () => {
  test("no key → each retry creates a new row", async () => {
    const r1 = await request(app).post("/resources").send({ name: "dup" });
    const r2 = await request(app).post("/resources").send({ name: "dup" });
    expect(r1.body.id).not.toBe(r2.body.id);
    const list = await request(app).get("/resources");
    expect(list.body.total).toBe(2);
  });

  test("same key + same body → replays original response, no duplicate", async () => {
    const key = "demo-key-1";
    const first = await request(app)
      .post("/resources")
      .set("Idempotency-Key", key)
      .send({ name: "once", description: "first try" });
    expect(first.status).toBe(201);

    const second = await request(app)
      .post("/resources")
      .set("Idempotency-Key", key)
      .send({ name: "once", description: "first try" });
    expect(second.status).toBe(201);
    expect(second.body.id).toBe(first.body.id);
    expect(second.body.createdAt).toBe(first.body.createdAt);
    expect(second.headers["idempotent-replayed"]).toBe("true");

    const list = await request(app).get("/resources");
    expect(list.body.total).toBe(1);
  });

  test("same key + different body → 422 mismatch", async () => {
    const key = "demo-key-2";
    await request(app)
      .post("/resources")
      .set("Idempotency-Key", key)
      .send({ name: "a" });
    const mismatch = await request(app)
      .post("/resources")
      .set("Idempotency-Key", key)
      .send({ name: "b" });
    expect(mismatch.status).toBe(422);
    expect(mismatch.body.error).toContain("different request payload");
  });

  test("malformed key → 400", async () => {
    const res = await request(app)
      .post("/resources")
      .set("Idempotency-Key", "bad key!")
      .send({ name: "x" });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain("Invalid Idempotency-Key");
  });

  test("different keys → independent creates", async () => {
    const a = await request(app)
      .post("/resources")
      .set("Idempotency-Key", "key-a")
      .send({ name: "x" });
    const b = await request(app)
      .post("/resources")
      .set("Idempotency-Key", "key-b")
      .send({ name: "x" });
    expect(a.body.id).not.toBe(b.body.id);
    const list = await request(app).get("/resources");
    expect(list.body.total).toBe(2);
  });

  test("validation failures are NOT replayed (4xx not cached as success)", async () => {
    const key = "demo-key-3";
    const bad = await request(app)
      .post("/resources")
      .set("Idempotency-Key", key)
      .send({});
    expect(bad.status).toBe(400);

    const retry = await request(app)
      .post("/resources")
      .set("Idempotency-Key", key)
      .send({ name: "now-valid" });
    expect(retry.status).toBe(422);
  });
});
