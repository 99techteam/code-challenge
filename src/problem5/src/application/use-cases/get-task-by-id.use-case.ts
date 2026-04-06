import { ITaskRepository } from "../../domain/repositories/task.repository.interface";
import { Task } from "../../domain/entities/task.entity";

export class GetTaskByIdUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async execute(id: string): Promise<Task | null> {
    return this.taskRepository.findById(id);
  }
}
