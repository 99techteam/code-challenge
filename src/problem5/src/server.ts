import "reflect-metadata";
import dotenv from "dotenv";
dotenv.config();

import { AppDataSource } from "./infrastructure/persistence/database.config";
import { TypeOrmTaskRepository } from "./infrastructure/persistence/repositories/typeorm-task.repository";
import { TaskOrmEntity } from "./infrastructure/persistence/entities/task.orm-entity";
import { CreateTaskUseCase } from "./application/use-cases/create-task.use-case";
import { TaskStatus } from "./domain/value-objects/task-status.vo";
import { TaskPriority } from "./domain/value-objects/task-priority.vo";
import { createApp } from "./app";

const PORT = Number(process.env.PORT ?? 3000);

async function seed(
  createTaskUseCase: CreateTaskUseCase,
  ormRepo: ReturnType<typeof AppDataSource.getRepository<TaskOrmEntity>>
): Promise<void> {
  const count = await ormRepo.count();
  if (count > 0) return;

  const samples = [
    { title: "Set up CI/CD pipeline", priority: TaskPriority.HIGH, status: TaskStatus.IN_PROGRESS },
    { title: "Write unit tests", priority: TaskPriority.HIGH, status: TaskStatus.TODO },
    { title: "Refactor authentication module", priority: TaskPriority.MEDIUM, status: TaskStatus.TODO },
    { title: "Update API documentation", priority: TaskPriority.MEDIUM, status: TaskStatus.DONE },
    { title: "Fix pagination bug", priority: TaskPriority.HIGH, status: TaskStatus.DONE },
    { title: "Add rate limiting", priority: TaskPriority.MEDIUM, status: TaskStatus.TODO },
    { title: "Migrate database schema", priority: TaskPriority.HIGH, status: TaskStatus.IN_PROGRESS },
    { title: "Code review pull requests", priority: TaskPriority.LOW, status: TaskStatus.TODO },
    { title: "Optimize slow queries", priority: TaskPriority.MEDIUM, status: TaskStatus.TODO, dueDate: "2025-06-30" },
    { title: "Deploy to staging", priority: TaskPriority.LOW, status: TaskStatus.DONE },
  ];

  for (const sample of samples) {
    await createTaskUseCase.execute(sample);
  }
  console.log(`Seeded ${samples.length} tasks.`);
}

async function bootstrap(): Promise<void> {
  await AppDataSource.initialize();
  console.log("Database connected.");

  const ormRepo = AppDataSource.getRepository(TaskOrmEntity);
  const taskRepository = new TypeOrmTaskRepository(ormRepo);
  const createTaskUseCase = new CreateTaskUseCase(taskRepository);

  await seed(createTaskUseCase, ormRepo);

  const app = createApp(taskRepository);

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Swagger UI   → http://localhost:${PORT}/docs`);
    console.log(`OpenAPI JSON → http://localhost:${PORT}/docs.json`);
  });
}

bootstrap().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
