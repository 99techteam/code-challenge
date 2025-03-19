export enum TodoStatus {
  OPEN = "OPEN",
  IN_PROGRESS = "IN_PROGRESS",
  DONE = "DONE",
}

export interface Todo {
  id: string;
  title: string;
  status: TodoStatus;
  description: string;
}
