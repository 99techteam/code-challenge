import { z } from "zod";
import { TodoStatus } from "../models/Todo";

export const TodoStatusValidation = z.enum([TodoStatus.DONE, TodoStatus.IN_PROGRESS, TodoStatus.OPEN]);``

export const createTodoSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long"),
  status: TodoStatusValidation,
  description: z.string().min(10, "Description must be at least 10 characters long"),
});

export const updateTodoSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long").optional(),
  status: TodoStatusValidation.optional(),
  description: z.string().min(10, "Description must be at least 10 characters long").optional(),
});
