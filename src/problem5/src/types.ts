export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ListTasksQuery {
  status?: TaskStatus | undefined;
  priority?: TaskPriority | undefined;
  search?: string | undefined;
  limit?: number | undefined;
  offset?: number | undefined;
}
