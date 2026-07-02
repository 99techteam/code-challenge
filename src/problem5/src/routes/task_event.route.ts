import { Router } from "express";
import * as controller from "@/controllers/task_event.controller.js";

const router = Router();

// GET /events
router.get("/events", controller.listTaskEvents);

// GET /events/:id
router.get("/events/:id", controller.getTaskEventById);

// GET /tasks/:taskId/events
router.get("/tasks/:taskId", controller.getTaskEventsByTaskId);

export default router;