import { TaskStatus } from "../value-objects/task-status.vo";
import { TaskPriority } from "../value-objects/task-priority.vo";

/**
 * Pure domain entity — no framework dependencies.
 * Encapsulates task business rules.
 */
export class Task {
  constructor(
    public readonly id: string,
    public title: string,
    public description: string | null,
    public status: TaskStatus,
    public priority: TaskPriority,
    public dueDate: string | null,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}

  markDone(): void {
    this.status = TaskStatus.DONE;
    this.updatedAt = new Date();
  }

  update(fields: {
    title?: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    dueDate?: string;
  }): void {
    if (fields.title !== undefined) this.title = fields.title;
    if (fields.description !== undefined) this.description = fields.description;
    if (fields.status !== undefined) this.status = fields.status;
    if (fields.priority !== undefined) this.priority = fields.priority;
    if (fields.dueDate !== undefined) this.dueDate = fields.dueDate;
    this.updatedAt = new Date();
  }
}
