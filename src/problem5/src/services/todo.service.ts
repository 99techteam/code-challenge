import { v4 as uuidv4 } from "uuid";
import { ITodoRepository } from "../repositories/todo.repository";
import {
  Todo,
  CreateTodoDTO,
  UpdateTodoDTO,
  TodoFilters,
  PaginatedResult,
} from "../types/todo.types";
import { NotFoundError, ValidationError } from "../errors";
import config from "../config";

export class TodoService {
  constructor(private readonly repository: ITodoRepository) {}

  create(input: CreateTodoDTO): Todo {
    if (!input.title || input.title.trim().length === 0) {
      throw new ValidationError("Title is required and must be a non-empty string.");
    }

    const now = new Date().toISOString();
    return this.repository.create({
      id: uuidv4(),
      title: input.title.trim(),
      description: input.description?.trim() || null,
      completed: false,
      created_at: now,
      updated_at: now,
    });
  }

  list(filters: Partial<TodoFilters>): PaginatedResult<Todo> {
    const resolvedFilters: TodoFilters = {
      completed: filters.completed,
      search: filters.search,
      limit: Math.min(filters.limit ?? config.pagination.defaultLimit, config.pagination.maxLimit),
      offset: filters.offset ?? 0,
    };

    const { data, total } = this.repository.findAll(resolvedFilters);

    return {
      data,
      pagination: {
        total,
        limit: resolvedFilters.limit,
        offset: resolvedFilters.offset,
      },
    };
  }

  getById(id: string): Todo {
    const todo = this.repository.findById(id);
    if (!todo) {
      throw new NotFoundError("Todo");
    }
    return todo;
  }

  update(id: string, input: UpdateTodoDTO): Todo {
    if (input.title !== undefined && (typeof input.title !== "string" || input.title.trim().length === 0)) {
      throw new ValidationError("Title must be a non-empty string.");
    }

    const hasUpdates = Object.keys(input).some(
      (key) => ["title", "description", "completed"].includes(key)
    );
    if (!hasUpdates) {
      throw new ValidationError("No valid fields to update.");
    }

    const fieldsToUpdate: Partial<Omit<Todo, "id" | "created_at">> = {};

    if (input.title !== undefined) fieldsToUpdate.title = input.title.trim();
    if (input.description !== undefined)
      fieldsToUpdate.description = input.description?.trim() || null;
    if (input.completed !== undefined) fieldsToUpdate.completed = input.completed;
    fieldsToUpdate.updated_at = new Date().toISOString();

    const updated = this.repository.update(id, fieldsToUpdate);
    if (!updated) {
      throw new NotFoundError("Todo");
    }
    return updated;
  }

  delete(id: string): void {
    const deleted = this.repository.delete(id);
    if (!deleted) {
      throw new NotFoundError("Todo");
    }
  }
}
