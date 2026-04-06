import { Repository } from "typeorm";
import {
  ITaskRepository,
  TaskFilter,
  TaskPage,
} from "../../../domain/repositories/task.repository.interface";
import { Task } from "../../../domain/entities/task.entity";
import { TaskOrmEntity } from "../entities/task.orm-entity";
import { TaskMapper } from "../mappers/task.mapper";

export class TypeOrmTaskRepository implements ITaskRepository {
  constructor(private readonly repo: Repository<TaskOrmEntity>) {}

  async save(task: Task): Promise<Task> {
    const orm = TaskMapper.toOrm(task);
    const saved = await this.repo.save(orm);
    return TaskMapper.toDomain(saved);
  }

  async findAll(filter: TaskFilter): Promise<TaskPage> {
    const {
      search,
      status,
      priority,
      sortBy = "createdAt",
      sortOrder = "DESC",
      page = 1,
      limit = 10,
    } = filter;

    const qb = this.repo.createQueryBuilder("task");

    if (search) {
      qb.andWhere("(task.title LIKE :s OR task.description LIKE :s)", {
        s: `%${search}%`,
      });
    }
    if (status) qb.andWhere("task.status = :status", { status });
    if (priority) qb.andWhere("task.priority = :priority", { priority });

    qb.orderBy(`task.${sortBy}`, sortOrder as "ASC" | "DESC");
    qb.skip((page - 1) * limit).take(limit);

    const [ormEntities, total] = await qb.getManyAndCount();

    return {
      tasks: ormEntities.map(TaskMapper.toDomain),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string): Promise<Task | null> {
    const orm = await this.repo.findOneBy({ id });
    return orm ? TaskMapper.toDomain(orm) : null;
  }

  async delete(task: Task): Promise<void> {
    await this.repo.delete(task.id);
  }
}
