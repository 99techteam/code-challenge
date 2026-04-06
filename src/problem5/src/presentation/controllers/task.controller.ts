import { Request, Response, NextFunction } from "express";
import { CreateTaskUseCase } from "../../application/use-cases/create-task.use-case";
import { ListTasksUseCase } from "../../application/use-cases/list-tasks.use-case";
import { GetTaskByIdUseCase } from "../../application/use-cases/get-task-by-id.use-case";
import { UpdateTaskUseCase } from "../../application/use-cases/update-task.use-case";
import { DeleteTaskUseCase } from "../../application/use-cases/delete-task.use-case";
import { CreateTaskDto } from "../../application/dtos/create-task.dto";
import { UpdateTaskDto } from "../../application/dtos/update-task.dto";
import { QueryTaskDto } from "../../application/dtos/query-task.dto";

export class TaskController {
  constructor(
    private readonly createTask: CreateTaskUseCase,
    private readonly listTasks: ListTasksUseCase,
    private readonly getTaskById: GetTaskByIdUseCase,
    private readonly updateTask: UpdateTaskUseCase,
    private readonly deleteTask: DeleteTaskUseCase
  ) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto: CreateTaskDto = req.body;
      const task = await this.createTask.execute(dto);
      res.status(201).json(task);
    } catch (err) {
      next(err);
    }
  };

  findAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = (req as Request & { validatedQuery: QueryTaskDto })
        .validatedQuery;
      const result = await this.listTasks.execute(query);
      res.json({
        data: result.tasks,
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      });
    } catch (err) {
      next(err);
    }
  };

  findById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const task = await this.getTaskById.execute(req.params.id);
      if (!task) {
        res.status(404).json({ status: "error", message: "Task not found" });
        return;
      }
      res.json(task);
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto: UpdateTaskDto = req.body;
      const task = await this.updateTask.execute(req.params.id, dto);
      if (!task) {
        res.status(404).json({ status: "error", message: "Task not found" });
        return;
      }
      res.json(task);
    } catch (err) {
      next(err);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const task = await this.deleteTask.execute(req.params.id);
      if (!task) {
        res.status(404).json({ status: "error", message: "Task not found" });
        return;
      }
      res.json({ message: "Task deleted successfully", task });
    } catch (err) {
      next(err);
    }
  };
}
