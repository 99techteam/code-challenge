import { Router } from "express";
import * as controller from "@/controllers/task.controller.js";

const router = Router();
// BASE URL /tasks
// create task
router.post("/tasks", controller.createTask);

// list tasks
router.get("/tasks", controller.listTasks);

// single task
router.get("/tasks/:id", controller.getTaskById);

// status change
router.patch("/tasks/:id/status", controller.updateStatus);

// update single task
router.patch("/tasks/:id", controller.updateTask);

// delete
router.delete("/tasks/:id", controller.deleteTask);

export default router;