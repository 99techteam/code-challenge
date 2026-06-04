import { Router } from "express";
import { JsonTodoRepository } from "../repositories/todo.repository";
import { TodoService } from "../services/todo.service";
import { TodoController } from "../controllers/todo.controller";
import { createTodoRouter } from "./todo.routes";

/**
 * Central route registration.
 * All resource routers are mounted here — makes it easy to add new resources.
 */
export function registerRoutes(): Router {
  const router = Router();

  // --- Todo resource ---
  const todoRepository = new JsonTodoRepository();
  const todoService = new TodoService(todoRepository);
  const todoController = new TodoController(todoService);
  router.use("/todos", createTodoRouter(todoController));

  return router;
}

