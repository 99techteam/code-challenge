import { randomUUID } from "node:crypto";
import type {
  CreateTaskInput,
  TaskFilters,
  UpdateTaskInput,
} from "../domain/task";
import { AppError } from "../errors";
import { TaskRepository } from "../repositories/task.repository";

export class TaskService {
  public constructor(private readonly repository: TaskRepository) {}

  public create(
    input: CreateTaskInput,
    traceId: string = randomUUID(),
  ) {
    return this.repository.create(input, traceId);
  }

  public list(filters: TaskFilters) {
    if (
      filters.dueAfter &&
      filters.dueBefore &&
      filters.dueAfter > filters.dueBefore
    ) {
      throw new AppError(
        400,
        "VALIDATION_ERROR",
        "dueAfter must be earlier than or equal to dueBefore",
      );
    }

    return this.repository.list(filters);
  }

  public get(id: string) {
    const task = this.repository.findById(id);

    if (!task) {
      throw new AppError(
        404,
        "TASK_NOT_FOUND",
        "Task was not found",
      );
    }

    return task;
  }

  public update(
    id: string,
    input: UpdateTaskInput,
    traceId: string = randomUUID(),
  ) {
    const task = this.repository.update(
      id,
      input,
      traceId,
    );

    if (!task) {
      throw new AppError(
        404,
        "TASK_NOT_FOUND",
        "Task was not found",
      );
    }

    return task;
  }

  public delete(
    id: string,
    traceId: string = randomUUID(),
  ): void {
    if (!this.repository.delete(id, traceId)) {
      throw new AppError(
        404,
        "TASK_NOT_FOUND",
        "Task was not found",
      );
    }
  }
}
