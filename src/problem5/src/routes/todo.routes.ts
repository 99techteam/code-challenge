import { Router } from "express";
import { TodoController } from "../controllers/todo.controller";

/**
 * Registers all todo routes.
 * Routes are kept thin — only mapping HTTP verbs to controller methods.
 */
export function createTodoRouter(controller: TodoController): Router {
  const router = Router();

  router.post("/", controller.create);
  router.get("/", controller.list);
  router.get("/:id", controller.getById);
  router.put("/:id", controller.update);
  router.delete("/:id", controller.delete);

  return router;
}
