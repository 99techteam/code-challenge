import { Router } from "express";
import * as controller from "@/controllers/task_tag.controller.js";

const router = Router();

// add tag to task
router.post("/tasks/:taskId/tags", controller.addTag);

// remove tag from task
router.delete("/tasks/:taskId/tags/:tagId", controller.removeTag);

// get tags for task
router.get("/tasks/:taskId/tags", controller.getTaskTags);

export default router;