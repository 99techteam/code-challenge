import "../../__tests__/setup";
import request from "supertest";
import { DataSource, Repository } from "typeorm";
import { Application } from "express";
import { TaskOrmEntity } from "../../src/infrastructure/persistence/entities/task.orm-entity";
import { TypeOrmTaskRepository } from "../../src/infrastructure/persistence/repositories/typeorm-task.repository";
import { TaskStatus } from "../../src/domain/value-objects/task-status.vo";
import { TaskPriority } from "../../src/domain/value-objects/task-priority.vo";
import { createApp } from "../../src/app";

let dataSource: DataSource;
let ormRepo: Repository<TaskOrmEntity>;
let app: Application;

beforeAll(async () => {
  dataSource = new DataSource({
    type: "sqljs",
    entities: [TaskOrmEntity],
    synchronize: true,
    logging: false,
  });
  await dataSource.initialize();
  ormRepo = dataSource.getRepository(TaskOrmEntity);
  const taskRepository = new TypeOrmTaskRepository(ormRepo);
  app = createApp(taskRepository);
});

afterAll(async () => {
  await dataSource.destroy();
});

afterEach(async () => {
  await ormRepo.clear();
});

// ─── Health ────────────────────────────────────────────────────────────────

describe("GET /api/health", () => {
  it("returns 200 with status ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.timestamp).toBeDefined();
  });
});

// ─── POST /api/tasks ───────────────────────────────────────────────────────

describe("POST /api/tasks", () => {
  it("creates a task with valid body", async () => {
    const res = await request(app).post("/api/tasks").send({ title: "New task" });
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.title).toBe("New task");
    expect(res.body.status).toBe(TaskStatus.TODO);
    expect(res.body.priority).toBe(TaskPriority.MEDIUM);
  });

  it("creates a task with all fields", async () => {
    const res = await request(app).post("/api/tasks").send({
      title: "Full task",
      description: "Details",
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      dueDate: "2025-12-31",
    });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe(TaskStatus.IN_PROGRESS);
    expect(res.body.priority).toBe(TaskPriority.HIGH);
  });

  it("returns 400 when title is missing", async () => {
    const res = await request(app).post("/api/tasks").send({ description: "No title" });
    expect(res.status).toBe(400);
    expect(res.body.status).toBe("error");
    expect(res.body.errors).toBeDefined();
  });

  it("returns 400 when title exceeds 200 characters", async () => {
    const res = await request(app).post("/api/tasks").send({ title: "x".repeat(201) });
    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid status enum", async () => {
    const res = await request(app).post("/api/tasks").send({ title: "Test", status: "INVALID" });
    expect(res.status).toBe(400);
  });
});

// ─── GET /api/tasks ────────────────────────────────────────────────────────

describe("GET /api/tasks", () => {
  beforeEach(async () => {
    const seeds = [
      { id: "id-1", title: "Alpha", status: TaskStatus.TODO, priority: TaskPriority.HIGH },
      { id: "id-2", title: "Beta", status: TaskStatus.DONE, priority: TaskPriority.LOW },
      { id: "id-3", title: "Gamma", status: TaskStatus.IN_PROGRESS, priority: TaskPriority.MEDIUM },
    ];
    await ormRepo.save(seeds.map((s) => Object.assign(new TaskOrmEntity(), s)));
  });

  it("returns all tasks", async () => {
    const res = await request(app).get("/api/tasks");
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(3);
    expect(res.body.data).toHaveLength(3);
    expect(res.body.page).toBe(1);
    expect(res.body.limit).toBe(10);
  });

  it("filters by status", async () => {
    const res = await request(app).get("/api/tasks?status=TODO");
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
    expect(res.body.data[0].title).toBe("Alpha");
  });

  it("filters by priority", async () => {
    const res = await request(app).get("/api/tasks?priority=LOW");
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
    expect(res.body.data[0].title).toBe("Beta");
  });

  it("searches by title (case-insensitive)", async () => {
    const res = await request(app).get("/api/tasks?search=alpha");
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
    expect(res.body.data[0].title).toBe("Alpha");
  });

  it("paginates correctly", async () => {
    const res = await request(app).get("/api/tasks?page=1&limit=2");
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.totalPages).toBe(2);
  });

  it("returns second page sorted by title ASC", async () => {
    const res = await request(app).get(
      "/api/tasks?page=2&limit=2&sort_by=title&sort_order=ASC"
    );
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].title).toBe("Gamma");
  });

  it("returns 400 for invalid status filter", async () => {
    const res = await request(app).get("/api/tasks?status=INVALID");
    expect(res.status).toBe(400);
  });

  it("returns 400 for non-integer page", async () => {
    const res = await request(app).get("/api/tasks?page=abc");
    expect(res.status).toBe(400);
  });
});

// ─── GET /api/tasks/:id ────────────────────────────────────────────────────

describe("GET /api/tasks/:id", () => {
  it("returns task when found", async () => {
    const orm = Object.assign(new TaskOrmEntity(), { id: "test-id", title: "Find me" });
    await ormRepo.save(orm);
    const res = await request(app).get("/api/tasks/test-id");
    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Find me");
  });

  it("returns 404 when not found", async () => {
    const res = await request(app).get("/api/tasks/non-existent");
    expect(res.status).toBe(404);
    expect(res.body.status).toBe("error");
  });
});

// ─── PUT /api/tasks/:id ────────────────────────────────────────────────────

describe("PUT /api/tasks/:id", () => {
  it("updates task successfully", async () => {
    const orm = Object.assign(new TaskOrmEntity(), { id: "upd-id", title: "Original" });
    await ormRepo.save(orm);
    const res = await request(app)
      .put("/api/tasks/upd-id")
      .send({ title: "Updated", status: TaskStatus.DONE });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Updated");
    expect(res.body.status).toBe(TaskStatus.DONE);
  });

  it("partially updates — unchanged fields stay", async () => {
    const orm = Object.assign(new TaskOrmEntity(), {
      id: "par-id",
      title: "Original",
      priority: TaskPriority.HIGH,
    });
    await ormRepo.save(orm);
    const res = await request(app).put("/api/tasks/par-id").send({ title: "New" });
    expect(res.status).toBe(200);
    expect(res.body.priority).toBe(TaskPriority.HIGH);
  });

  it("returns 404 for non-existent task", async () => {
    const res = await request(app).put("/api/tasks/bad-id").send({ title: "x" });
    expect(res.status).toBe(404);
  });

  it("returns 400 for invalid priority", async () => {
    const orm = Object.assign(new TaskOrmEntity(), { id: "val-id", title: "Test" });
    await ormRepo.save(orm);
    const res = await request(app).put("/api/tasks/val-id").send({ priority: "INVALID" });
    expect(res.status).toBe(400);
  });
});

// ─── DELETE /api/tasks/:id ─────────────────────────────────────────────────

describe("DELETE /api/tasks/:id", () => {
  it("deletes task and returns it", async () => {
    const orm = Object.assign(new TaskOrmEntity(), { id: "del-id", title: "Delete me" });
    await ormRepo.save(orm);
    const res = await request(app).delete("/api/tasks/del-id");
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);
    expect(res.body.task.id).toBe("del-id");
    expect(await ormRepo.findOneBy({ id: "del-id" })).toBeNull();
  });

  it("returns 404 for non-existent task", async () => {
    const res = await request(app).delete("/api/tasks/non-existent");
    expect(res.status).toBe(404);
  });
});
