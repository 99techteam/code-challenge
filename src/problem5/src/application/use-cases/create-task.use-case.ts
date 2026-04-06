import { v4 as uuidv4 } from "uuid";
import { ITaskRepository } from "../../domain/repositories/task.repository.interface";
import { Task } from "../../domain/entities/task.entity";
import { TaskStatus } from "../../domain/value-objects/task-status.vo";
import { TaskPriority } from "../../domain/value-objects/task-priority.vo";
import { CreateTaskDto } from "../dtos/create-task.dto";

export class CreateTaskUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async execute(dto: CreateTaskDto): Promise<Task> {
    const now = new Date();
    const task = new Task(
      uuidv4(),
      dto.title,
      dto.description ?? null,
      dto.status ?? TaskStatus.TODO,
      dto.priority ?? TaskPriority.MEDIUM,
      dto.dueDate ?? null,
      now,
      now
    );
    return this.taskRepository.save(task);
  }
}
