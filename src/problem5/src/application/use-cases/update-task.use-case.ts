import { ITaskRepository } from "../../domain/repositories/task.repository.interface";
import { Task } from "../../domain/entities/task.entity";
import { UpdateTaskDto } from "../dtos/update-task.dto";

export class UpdateTaskUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async execute(id: string, dto: UpdateTaskDto): Promise<Task | null> {
    const task = await this.taskRepository.findById(id);
    if (!task) return null;

    task.update({
      title: dto.title,
      description: dto.description,
      status: dto.status,
      priority: dto.priority,
      dueDate: dto.dueDate,
    });

    return this.taskRepository.save(task);
  }
}
