import { ITaskRepository } from "../../domain/repositories/task.repository.interface";
import { Task } from "../../domain/entities/task.entity";

export class DeleteTaskUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async execute(id: string): Promise<Task | null> {
    const task = await this.taskRepository.findById(id);
    if (!task) return null;

    await this.taskRepository.delete(task);
    return task;
  }
}
