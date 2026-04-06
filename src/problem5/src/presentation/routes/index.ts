import { Router } from "express";
import { healthCheck } from "../controllers/health.controller";
import { createTaskRouter } from "./task.routes";
import { TaskController } from "../controllers/task.controller";
import { ITaskRepository } from "../../domain/repositories/task.repository.interface";
import { CreateTaskUseCase } from "../../application/use-cases/create-task.use-case";
import { ListTasksUseCase } from "../../application/use-cases/list-tasks.use-case";
import { GetTaskByIdUseCase } from "../../application/use-cases/get-task-by-id.use-case";
import { UpdateTaskUseCase } from "../../application/use-cases/update-task.use-case";
import { DeleteTaskUseCase } from "../../application/use-cases/delete-task.use-case";

export function createRouter(taskRepository: ITaskRepository): Router {
  const router = Router();

  const taskController = new TaskController(
    new CreateTaskUseCase(taskRepository),
    new ListTasksUseCase(taskRepository),
    new GetTaskByIdUseCase(taskRepository),
    new UpdateTaskUseCase(taskRepository),
    new DeleteTaskUseCase(taskRepository)
  );

  router.get("/health", healthCheck);
  router.use("/tasks", createTaskRouter(taskController));

  return router;
}
