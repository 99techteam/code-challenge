import { TaskService } from "../../src/services/task.service";
import prisma from "../../src/config/database";
import { AppError } from "../../src/middlewares/error.middleware";
import { CreateTaskDTO, UpdateTaskDTO } from "../../src/types/task.types";

// Mock Prisma Client
jest.mock("../../src/config/database", () => ({
  __esModule: true,
  default: {
    task: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe("TaskService", () => {
  let taskService: TaskService;

  beforeEach(() => {
    taskService = new TaskService();
    jest.clearAllMocks();
  });

  describe("getAllTasks", () => {
    it("should return all non-deleted tasks by default", async () => {
      // Arrange
      const mockTasks = [
        {
          id: "1",
          title: "Test Task",
          description: "Test Description",
          status: "TODO",
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
      ];

      (prisma.task.findMany as jest.Mock).mockResolvedValue(mockTasks);

      // Act
      const result = await taskService.getAllTasks();

      // Assert
      expect(result).toEqual(mockTasks);
      expect(prisma.task.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
      });
    });

    it("should return all tasks including deleted when specified", async () => {
      // Arrange
      const mockTasks = [
        {
          id: "1",
          title: "Test Task",
          description: "Test Description",
          status: "TODO",
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
        {
          id: "2",
          title: "Deleted Task",
          description: "Deleted Description",
          status: "DONE",
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: new Date(),
        },
      ];

      (prisma.task.findMany as jest.Mock).mockResolvedValue(mockTasks);

      // Act
      const result = await taskService.getAllTasks(true);

      // Assert
      expect(result).toEqual(mockTasks);
      expect(prisma.task.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { createdAt: "desc" },
      });
    });

    it("should filter tasks by status", async () => {
      // Arrange
      const mockTasks = [
        {
          id: "1",
          title: "A",
          description: "desc",
          status: "TODO",
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
      ];
      (prisma.task.findMany as jest.Mock).mockResolvedValue(mockTasks);

      // Act
      const result = await taskService.getAllTasks(false, "TODO");

      // Assert
      expect(result).toEqual(mockTasks);
      expect(prisma.task.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null, status: "TODO" },
        orderBy: { createdAt: "desc" },
      });
    });

    it("should filter tasks by keyword", async () => {
      // Arrange
      const mockTasks = [
        {
          id: "2",
          title: "KeywordTitle",
          description: "desc",
          status: "TODO",
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
      ];
      (prisma.task.findMany as jest.Mock).mockResolvedValue(mockTasks);

      // Act
      const result = await taskService.getAllTasks(
        false,
        undefined,
        "KeywordTitle"
      );

      // Assert
      expect(result).toEqual(mockTasks);
      expect(prisma.task.findMany).toHaveBeenCalledWith({
        where: {
          deletedAt: null,
          OR: [
            { title: { contains: "KeywordTitle", mode: "insensitive" } },
            { description: { contains: "KeywordTitle", mode: "insensitive" } },
          ],
        },
        orderBy: { createdAt: "desc" },
      });
    });
  });

  describe("getTaskById", () => {
    it("should return a task when found", async () => {
      // Arrange
      const mockTask = {
        id: "1",
        title: "Test Task",
        description: "Test Description",
        status: "TODO",
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      (prisma.task.findFirst as jest.Mock).mockResolvedValue(mockTask);

      // Act
      const result = await taskService.getTaskById("1");

      // Assert
      expect(result).toEqual(mockTask);
      expect(prisma.task.findFirst).toHaveBeenCalledWith({
        where: { id: "1", deletedAt: null },
      });
    });

    it("should throw AppError when task not found", async () => {
      // Arrange
      (prisma.task.findFirst as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(taskService.getTaskById("nonexistent")).rejects.toThrow(
        AppError
      );
      await expect(taskService.getTaskById("nonexistent")).rejects.toThrow(
        "Task not found"
      );
    });
  });

  describe("createTask", () => {
    it("should create a new task", async () => {
      // Arrange
      const taskData = {
        title: "New Task",
        description: "New Description",
        status: "TODO",
      } as CreateTaskDTO;

      const mockCreatedTask = {
        id: "1",
        ...taskData,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      (prisma.task.create as jest.Mock).mockResolvedValue(mockCreatedTask);

      // Act
      const result = await taskService.createTask(taskData);

      // Assert
      expect(result).toEqual(mockCreatedTask);
      expect(prisma.task.create).toHaveBeenCalledWith({
        data: taskData,
      });
    });

    it("should create a task with default status when not provided", async () => {
      // Arrange
      const taskData = {
        title: "New Task",
      };

      const mockCreatedTask = {
        id: "1",
        title: taskData.title,
        description: null,
        status: "TODO",
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      (prisma.task.create as jest.Mock).mockResolvedValue(mockCreatedTask);

      // Act
      await taskService.createTask(taskData);

      // Assert
      expect(prisma.task.create).toHaveBeenCalledWith({
        data: {
          title: taskData.title,
          description: undefined,
          status: "TODO",
        },
      });
    });
  });

  describe("updateTask", () => {
    it("should update an existing task", async () => {
      // Arrange
      const mockTask = {
        id: "1",
        title: "Old Title",
        description: "Old Description",
        status: "TODO",
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      const updateData = {
        title: "Updated Title",
        status: "IN_PROGRESS" as const,
      } as UpdateTaskDTO;

      const mockUpdatedTask = {
        ...mockTask,
        ...updateData,
        updatedAt: new Date(),
      };

      (prisma.task.findFirst as jest.Mock).mockResolvedValue(mockTask);
      (prisma.task.update as jest.Mock).mockResolvedValue(mockUpdatedTask);

      // Act
      const result = await taskService.updateTask("1", updateData);

      // Assert
      expect(result).toEqual(mockUpdatedTask);
      expect(prisma.task.update).toHaveBeenCalled();
    });

    it("should throw AppError when updating non-existent task", async () => {
      // Arrange
      (prisma.task.findFirst as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(
        taskService.updateTask("nonexistent", { title: "Updated" })
      ).rejects.toThrow(AppError);
    });
  });

  describe("deleteTask", () => {
    const mockTask = {
      id: "1",
      title: "Test Task",
      description: "Test Description",
      status: "TODO",
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    it("should soft delete a task by default", async () => {
      // Arrange
      (prisma.task.findFirst as jest.Mock).mockResolvedValue(mockTask);
      (prisma.task.update as jest.Mock).mockResolvedValue({
        ...mockTask,
        deletedAt: new Date(),
      });

      // Act
      await taskService.deleteTask("1");

      // Assert
      expect(prisma.task.update).toHaveBeenCalledWith({
        where: { id: "1" },
        data: { deletedAt: expect.any(Date) },
      });
    });

    it("should hard delete a task when specified", async () => {
      // Arrange
      (prisma.task.findFirst as jest.Mock).mockResolvedValue(mockTask);
      (prisma.task.delete as jest.Mock).mockResolvedValue(mockTask);

      // Act
      await taskService.deleteTask("1", false);

      // Assert
      expect(prisma.task.delete).toHaveBeenCalledWith({
        where: { id: "1" },
      });
    });

    it("should throw AppError when deleting non-existent task", async () => {
      // Arrange
      (prisma.task.findFirst as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(taskService.deleteTask("nonexistent")).rejects.toThrow(
        AppError
      );
    });
  });

  describe("restoreTask", () => {
    it("should restore a deleted task", async () => {
      // Arrange
      const deletedTask = {
        id: "1",
        title: "Deleted Task",
        description: "Deleted Description",
        status: "TODO",
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: new Date(),
      };

      const restoredTask = {
        ...deletedTask,
        deletedAt: null,
      };

      (prisma.task.findUnique as jest.Mock).mockResolvedValue(deletedTask);
      (prisma.task.update as jest.Mock).mockResolvedValue(restoredTask);

      // Act
      const result = await taskService.restoreTask("1");

      // Assert
      expect(result).toEqual(restoredTask);
      expect(prisma.task.update).toHaveBeenCalledWith({
        where: { id: "1" },
        data: { deletedAt: null },
      });
    });

    it("should throw AppError when task not found", async () => {
      // Arrange
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(taskService.restoreTask("nonexistent")).rejects.toThrow(
        AppError
      );
      await expect(taskService.restoreTask("nonexistent")).rejects.toThrow(
        "Task not found"
      );
    });

    it("should throw AppError when task is not deleted", async () => {
      // Arrange
      const activeTask = {
        id: "1",
        title: "Active Task",
        description: "Active Description",
        status: "TODO",
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      (prisma.task.findUnique as jest.Mock).mockResolvedValue(activeTask);

      // Act & Assert
      await expect(taskService.restoreTask("1")).rejects.toThrow(AppError);
      await expect(taskService.restoreTask("1")).rejects.toThrow(
        "Task is not deleted"
      );
    });
  });
});
