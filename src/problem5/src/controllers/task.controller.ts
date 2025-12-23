import { Request, Response, NextFunction } from "express";
import taskService from "../services/task.service";
import { CreateTaskDTO, UpdateTaskDTO } from "../types/task.types";

export class TaskController {
  async getAllTasks(req: Request, res: Response, next: NextFunction) {
    try {
      const includeDeleted = req.query.includeDeleted === "true";
      const status = req.query.status as string | undefined;
      const keyword = req.query.keyword as string | undefined;
      const tasks = await taskService.getAllTasks(
        includeDeleted,
        status,
        keyword
      );
      res.status(200).json({
        success: true,
        data: tasks,
        count: tasks.length,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTaskById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const task = await taskService.getTaskById(id);
      res.status(200).json({
        success: true,
        data: task,
      });
    } catch (error) {
      next(error);
    }
  }

  async createTask(req: Request, res: Response, next: NextFunction) {
    try {
      const taskData: CreateTaskDTO = req.body;
      const task = await taskService.createTask(taskData);
      res.status(201).json({
        success: true,
        data: task,
        message: "Task created successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async updateTask(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const taskData: UpdateTaskDTO = req.body;
      const task = await taskService.updateTask(id, taskData);
      res.status(200).json({
        success: true,
        data: task,
        message: "Task updated successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteTask(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const hard = req.query.hard === "true";
      await taskService.deleteTask(id, !hard);
      res.status(200).json({
        success: true,
        message: hard
          ? "Task permanently deleted"
          : "Task soft deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async restoreTask(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const task = await taskService.restoreTask(id);
      res.status(200).json({
        success: true,
        data: task,
        message: "Task restored successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new TaskController();
