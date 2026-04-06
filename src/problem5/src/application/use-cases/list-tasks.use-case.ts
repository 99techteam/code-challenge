import { ITaskRepository, TaskPage } from "../../domain/repositories/task.repository.interface";
import { QueryTaskDto, SortField, SortOrder } from "../dtos/query-task.dto";

export class ListTasksUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async execute(dto: QueryTaskDto): Promise<TaskPage> {
    return this.taskRepository.findAll({
      search: dto.search,
      status: dto.status,
      priority: dto.priority,
      sortBy: dto.sort_by ?? SortField.CREATED_AT,
      sortOrder: dto.sort_order ?? SortOrder.DESC,
      page: dto.page ?? 1,
      limit: dto.limit ?? 10,
    });
  }
}
