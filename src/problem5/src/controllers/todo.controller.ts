import { Request, Response, NextFunction } from "express";
import { TodoService } from "../services/todo.service";
import { CreateTodoDTO, UpdateTodoDTO } from "../types/todo.types";

export class TodoController {
  constructor(private readonly service: TodoService) {}

  create = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const input: CreateTodoDTO = req.body;
      const todo = this.service.create(input);
      res.status(201).json(todo);
    } catch (error) {
      next(error);
    }
  };

  list = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const filters = {
        completed: req.query.completed !== undefined ? req.query.completed === "true" : undefined,
        search: req.query.search as string | undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset as string, 10) : undefined,
      };

      const result = this.service.list(filters);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  getById = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const todo = this.service.getById(req.params.id);
      res.json(todo);
    } catch (error) {
      next(error);
    }
  };

  update = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const input: UpdateTodoDTO = req.body;
      const todo = this.service.update(req.params.id, input);
      res.json(todo);
    } catch (error) {
      next(error);
    }
  };

  delete = (req: Request, res: Response, next: NextFunction): void => {
    try {
      this.service.delete(req.params.id);
      res.status(200).json({ message: "Todo deleted successfully." });
    } catch (error) {
      next(error);
    }
  };
}

