import { Task } from "../entities/task.entity";
import { TaskStatus } from "../value-objects/task-status.vo";
import { TaskPriority } from "../value-objects/task-priority.vo";

export interface TaskFilter {
  search?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
  page?: number;
  limit?: number;
}

export interface TaskPage {
  tasks: Task[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Repository interface owned by the domain layer.
 * The infrastructure layer provides the concrete implementation.
 */
export interface ITaskRepository {
  save(task: Task): Promise<Task>;
  findAll(filter: TaskFilter): Promise<TaskPage>;
  findById(id: string): Promise<Task | null>;
  delete(task: Task): Promise<void>;
}
