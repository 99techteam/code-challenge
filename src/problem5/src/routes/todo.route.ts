import { Router } from "express";
import * as todoController from "../controllers/todo.controller";

const router = Router();

router.post("/", todoController.createTodoHandler);
router.get("/", todoController.getAllTodos);
router.get("/:id", todoController.getTodoById);
router.put("/:id", todoController.updateTodoHandler);
router.delete("/:id", todoController.deleteTodo);

export default router;