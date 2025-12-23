import prisma from "../config/database";
import { CreateTaskDTO, UpdateTaskDTO } from "../types/task.types";
import { AppError } from "../middlewares/error.middleware";

export class TaskService {
  async getAllTasks(includeDeleted = false, status?: string, keyword?: string) {
    const where: any = includeDeleted ? {} : { deletedAt: null };
    if (status) {
      where.status = status;
    }
    if (keyword) {
      where.OR = [
        { title: { contains: keyword, mode: "insensitive" } },
        { description: { contains: keyword, mode: "insensitive" } },
      ];
    }
    return await prisma.task.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
  }

  async getTaskById(id: string) {
    const task = await prisma.task.findFirst({
      where: { id, deletedAt: null },
    });

    if (!task) {
      throw new AppError("Task not found", 404);
    }

    return task;
  }

  async createTask(data: CreateTaskDTO) {
    return await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        status: data.status || "TODO",
      },
    });
  }

  async updateTask(id: string, data: UpdateTaskDTO) {
    // Check if task exists
    await this.getTaskById(id);

    return await prisma.task.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async deleteTask(id: string, soft = true) {
    // Check if task exists
    await this.getTaskById(id);

    if (soft) {
      // Soft delete
      return await prisma.task.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    } else {
      // Hard delete
      return await prisma.task.delete({
        where: { id },
      });
    }
  }

  async restoreTask(id: string) {
    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      throw new AppError("Task not found", 404);
    }

    if (!task.deletedAt) {
      throw new AppError("Task is not deleted", 400);
    }

    return await prisma.task.update({
      where: { id },
      data: { deletedAt: null },
    });
  }
}

export default new TaskService();
