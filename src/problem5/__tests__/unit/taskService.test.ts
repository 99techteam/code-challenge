import "../../__tests__/setup";
import { DataSource, Repository } from "typeorm";
import { TaskOrmEntity } from "../../src/infrastructure/persistence/entities/task.orm-entity";
import { TypeOrmTaskRepository } from "../../src/infrastructure/persistence/repositories/typeorm-task.repository";
import { CreateTaskUseCase } from "../../src/application/use-cases/create-task.use-case";
import { ListTasksUseCase } from "../../src/application/use-cases/list-tasks.use-case";
import { GetTaskByIdUseCase } from "../../src/application/use-cases/get-task-by-id.use-case";
import { UpdateTaskUseCase } from "../../src/application/use-cases/update-task.use-case";
import { DeleteTaskUseCase } from "../../src/application/use-cases/delete-task.use-case";
import { TaskStatus } from "../../src/domain/value-objects/task-status.vo";
import { TaskPriority } from "../../src/domain/value-objects/task-priority.vo";
import { SortField, SortOrder } from "../../src/application/dtos/query-task.dto";

let dataSource: DataSource;
let ormRepo: Repository<TaskOrmEntity>;
let taskRepository: TypeOrmTaskRepository;

// Use cases under test
let createTask: CreateTaskUseCase;
let listTasks: ListTasksUseCase;
let getTaskById: GetTaskByIdUseCase;
let updateTask: UpdateTaskUseCase;
let deleteTask: DeleteTaskUseCase;

beforeAll(async () => {
  dataSource = new DataSource({
    type: "sqljs",
    entities: [TaskOrmEntity],
    synchronize: true,
    logging: false,
  });
  await dataSource.initialize();
  ormRepo = dataSource.getRepository(TaskOrmEntity);
  taskRepository = new TypeOrmTaskRepository(ormRepo);

  createTask = new CreateTaskUseCase(taskRepository);
  listTasks = new ListTasksUseCase(taskRepository);
  getTaskById = new GetTaskByIdUseCase(taskRepository);
  updateTask = new UpdateTaskUseCase(taskRepository);
  deleteTask = new DeleteTaskUseCase(taskRepository);
});

afterAll(async () => {
  await dataSource.destroy();
});

afterEach(async () => {
  await ormRepo.clear();
});

// ─── CreateTaskUseCase ─────────────────────────────────────────────────────

describe("CreateTaskUseCase", () => {
  it("creates a task with required fields only", async () => {
    const task = await createTask.execute({ title: "Test task" });
    expect(task.id).toBeDefined();
    expect(task.title).toBe("Test task");
    expect(task.status).toBe(TaskStatus.TODO);
    expect(task.priority).toBe(TaskPriority.MEDIUM);
    expect(task.description).toBeFalsy();
    expect(task.dueDate).toBeFalsy();
  });

  it("creates a task with all fields", async () => {
    const task = await createTask.execute({
      title: "Full task",
      description: "Some details",
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      dueDate: "2025-12-31",
    });
    expect(task.title).toBe("Full task");
    expect(task.status).toBe(TaskStatus.IN_PROGRESS);
    expect(task.priority).toBe(TaskPriority.HIGH);
    expect(task.dueDate).toBe("2025-12-31");
  });

  it("persists the task in the database", async () => {
    await createTask.execute({ title: "Persisted" });
    expect(await ormRepo.count()).toBe(1);
  });
});

// ─── ListTasksUseCase ──────────────────────────────────────────────────────

describe("ListTasksUseCase", () => {
  beforeEach(async () => {
    await createTask.execute({ title: "Alpha", status: TaskStatus.TODO, priority: TaskPriority.HIGH });
    await createTask.execute({ title: "Beta", status: TaskStatus.DONE, priority: TaskPriority.LOW });
    await createTask.execute({ title: "Gamma", status: TaskStatus.IN_PROGRESS, priority: TaskPriority.MEDIUM });
  });

  it("returns all tasks with default pagination", async () => {
    const result = await listTasks.execute({});
    expect(result.total).toBe(3);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
    expect(result.tasks).toHaveLength(3);
  });

  it("filters by status", async () => {
    const result = await listTasks.execute({ status: TaskStatus.TODO });
    expect(result.total).toBe(1);
    expect(result.tasks[0].title).toBe("Alpha");
  });

  it("filters by priority", async () => {
    const result = await listTasks.execute({ priority: TaskPriority.LOW });
    expect(result.total).toBe(1);
    expect(result.tasks[0].title).toBe("Beta");
  });

  it("searches by title (case-insensitive)", async () => {
    const result = await listTasks.execute({ search: "alpha" });
    expect(result.total).toBe(1);
    expect(result.tasks[0].title).toBe("Alpha");
  });

  it("applies pagination", async () => {
    const result = await listTasks.execute({ page: 1, limit: 2 });
    expect(result.tasks).toHaveLength(2);
    expect(result.totalPages).toBe(2);
  });

  it("returns second page sorted by title ASC", async () => {
    const result = await listTasks.execute({
      page: 2,
      limit: 2,
      sort_by: SortField.TITLE,
      sort_order: SortOrder.ASC,
    });
    expect(result.tasks).toHaveLength(1);
    expect(result.tasks[0].title).toBe("Gamma");
  });
});

// ─── GetTaskByIdUseCase ────────────────────────────────────────────────────

describe("GetTaskByIdUseCase", () => {
  it("returns task when found", async () => {
    const created = await createTask.execute({ title: "Find me" });
    const found = await getTaskById.execute(created.id);
    expect(found).not.toBeNull();
    expect(found!.title).toBe("Find me");
  });

  it("returns null when not found", async () => {
    expect(await getTaskById.execute("non-existent")).toBeNull();
  });
});

// ─── UpdateTaskUseCase ─────────────────────────────────────────────────────

describe("UpdateTaskUseCase", () => {
  it("updates existing task fields", async () => {
    const created = await createTask.execute({ title: "Original" });
    const updated = await updateTask.execute(created.id, {
      title: "Updated",
      status: TaskStatus.DONE,
    });
    expect(updated!.title).toBe("Updated");
    expect(updated!.status).toBe(TaskStatus.DONE);
  });

  it("does not overwrite unchanged fields", async () => {
    const created = await createTask.execute({
      title: "Original",
      priority: TaskPriority.HIGH,
    });
    const updated = await updateTask.execute(created.id, { title: "New" });
    expect(updated!.priority).toBe(TaskPriority.HIGH);
  });

  it("returns null for non-existent task", async () => {
    expect(await updateTask.execute("bad-id", { title: "x" })).toBeNull();
  });
});

// ─── DeleteTaskUseCase ─────────────────────────────────────────────────────

describe("DeleteTaskUseCase", () => {
  it("deletes task and returns domain entity", async () => {
    const created = await createTask.execute({ title: "Delete me" });
    const removed = await deleteTask.execute(created.id);
    expect(removed).not.toBeNull();
    expect(removed!.id).toBe(created.id);
    expect(await ormRepo.count()).toBe(0);
  });

  it("returns null for non-existent task", async () => {
    expect(await deleteTask.execute("bad-id")).toBeNull();
  });
});
