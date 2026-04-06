import { Task } from "../../../domain/entities/task.entity";
import { TaskOrmEntity } from "../entities/task.orm-entity";

/**
 * Converts between the domain entity and the TypeORM ORM entity.
 * Keeps infrastructure concerns completely separated from the domain.
 */
export class TaskMapper {
  static toDomain(orm: TaskOrmEntity): Task {
    return new Task(
      orm.id,
      orm.title,
      orm.description,
      orm.status,
      orm.priority,
      orm.dueDate,
      orm.createdAt,
      orm.updatedAt
    );
  }

  static toOrm(domain: Task): TaskOrmEntity {
    const orm = new TaskOrmEntity();
    orm.id = domain.id;
    orm.title = domain.title;
    orm.description = domain.description;
    orm.status = domain.status;
    orm.priority = domain.priority;
    orm.dueDate = domain.dueDate;
    orm.createdAt = domain.createdAt;
    orm.updatedAt = domain.updatedAt;
    return orm;
  }
}
