export type TaskStatus = "pending" | "in_progress" | "done";

export interface Task {
  id: number;
  title: string;
  description?: string;
  priority: number;
  status: TaskStatus;
  due_at?: string;
  created_at: string;
  updated_at: string;
}

export type SqlValue = string | number | null;

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: number;
  due_at?: string;
};

export interface ListTasksFilter {
  status?: TaskStatus;
  priority?: number;
  tags?: string[];
};

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  priority?: number;
  due_at?: string | null;
};