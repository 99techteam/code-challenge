import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { TaskStatus } from "../../../domain/value-objects/task-status.vo";
import { TaskPriority } from "../../../domain/value-objects/task-priority.vo";

/**
 * TypeORM-specific entity. Lives in the infrastructure layer so that
 * ORM decorators never leak into the domain.
 */
@Entity("tasks")
export class TaskOrmEntity {
  @PrimaryColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 200 })
  title!: string;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @Column({ type: "varchar", default: TaskStatus.TODO })
  status!: TaskStatus;

  @Column({ type: "varchar", default: TaskPriority.MEDIUM })
  priority!: TaskPriority;

  @Column({ type: "varchar", nullable: true })
  dueDate!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
