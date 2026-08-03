import { Router, type Request, type Response } from "express";
import { AppError } from "../errors";
import { TaskService } from "../services/task.service";
import {
  parseCreateTask,
  parseTaskFilters,
  parseUpdateTask,
} from "./validation";

function idFrom(request: Request): string {
  const id = request.params.id;

  if (typeof id !== "string" || id.trim() === "") {
    throw new AppError(400, "VALIDATION_ERROR", "Task id is required");
  }

  return id;
}

export function createTaskRouter(service: TaskService): Router {
  const router = Router();

  router.post("/", (request: Request, response: Response) => {
    const task = service.create(
      parseCreateTask(request.body),
      response.locals.requestId,
    );

    response
      .status(201)
      .location(`/api/v1/tasks/${task.id}`)
      .json({ data: task });
  });

  router.get("/", (request: Request, response: Response) => {
    const result = service.list(
      parseTaskFilters(request.query as Record<string, unknown>),
    );

    response.json({
      data: result.items,
      meta: {
        total: result.total,
        limit: result.limit,
        offset: result.offset,
      },
    });
  });

  router.get("/:id", (request: Request, response: Response) => {
    response.json({ data: service.get(idFrom(request)) });
  });

  router.patch("/:id", (request: Request, response: Response) => {
    const task = service.update(
      idFrom(request),
      parseUpdateTask(request.body),
      response.locals.requestId,
    );

    response.json({ data: task });
  });

  router.delete("/:id", (request: Request, response: Response) => {
    service.delete(idFrom(request), response.locals.requestId);
    response.status(204).send();
  });

  return router;
}
