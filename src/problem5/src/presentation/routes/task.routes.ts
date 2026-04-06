import { Router } from "express";
import { TaskController } from "../controllers/task.controller";
import { validateBody, validateQuery } from "../middlewares/validate-dto.middleware";
import { CreateTaskDto } from "../../application/dtos/create-task.dto";
import { UpdateTaskDto } from "../../application/dtos/update-task.dto";
import { QueryTaskDto } from "../../application/dtos/query-task.dto";

export function createTaskRouter(controller: TaskController): Router {
  const router = Router();

  router.get("/", validateQuery(QueryTaskDto), controller.findAll);
  router.post("/", validateBody(CreateTaskDto), controller.create);
  router.get("/:id", controller.findById);
  router.put("/:id", validateBody(UpdateTaskDto), controller.update);
  router.delete("/:id", controller.remove);

  return router;
}
