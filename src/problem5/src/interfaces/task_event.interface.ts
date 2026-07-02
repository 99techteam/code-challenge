export interface TaskEvent {
  id: number;
  task_id: number;
  event: string;
  payload: string | null;
  created_at: string;
};

export interface ListTaskEventsFilter {
  taskId?: number;
  event?: string;
};
