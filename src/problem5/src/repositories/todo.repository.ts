import fs from "fs";
import path from "path";
import config from "../config";
import { Todo, TodoFilters } from "../types/todo.types";

/**
 * Repository interface — defines the contract for data access.
 * To swap databases, implement this interface with a different backend.
 */
export interface ITodoRepository {
  findAll(filters: TodoFilters): { data: Todo[]; total: number };
  findById(id: string): Todo | undefined;
  create(todo: Todo): Todo;
  update(id: string, updates: Partial<Omit<Todo, "id" | "created_at">>): Todo | undefined;
  delete(id: string): boolean;
}

/**
 * JSON file-based implementation of ITodoRepository.
 * Can be replaced with PostgreSQL, MongoDB, etc. by implementing ITodoRepository.
 */
export class JsonTodoRepository implements ITodoRepository {
  private filePath: string;

  constructor() {
    // Ensure data directory exists
    if (!fs.existsSync(config.dataDir)) {
      fs.mkdirSync(config.dataDir, { recursive: true });
    }

    this.filePath = path.join(config.dataDir, "todos.json");

    // Initialize DB file if it doesn't exist
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([], null, 2), "utf-8");
    }
  }

  private readAll(): Todo[] {
    const data = fs.readFileSync(this.filePath, "utf-8");
    return JSON.parse(data) as Todo[];
  }

  private writeAll(todos: Todo[]): void {
    fs.writeFileSync(this.filePath, JSON.stringify(todos, null, 2), "utf-8");
  }

  findAll(filters: TodoFilters): { data: Todo[]; total: number } {
    let todos = this.readAll();

    if (filters.completed !== undefined) {
      todos = todos.filter((t) => t.completed === filters.completed);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      todos = todos.filter(
        (t) =>
          t.title.toLowerCase().includes(searchLower) ||
          (t.description && t.description.toLowerCase().includes(searchLower))
      );
    }

    // Sort by newest first
    todos.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const total = todos.length;
    const paginated = todos.slice(filters.offset, filters.offset + filters.limit);

    return { data: paginated, total };
  }

  findById(id: string): Todo | undefined {
    return this.readAll().find((t) => t.id === id);
  }

  create(todo: Todo): Todo {
    const todos = this.readAll();
    todos.push(todo);
    this.writeAll(todos);
    return todo;
  }

  update(id: string, updates: Partial<Omit<Todo, "id" | "created_at">>): Todo | undefined {
    const todos = this.readAll();
    const index = todos.findIndex((t) => t.id === id);
    if (index === -1) return undefined;

    todos[index] = { ...todos[index], ...updates };
    this.writeAll(todos);
    return todos[index];
  }

  delete(id: string): boolean {
    const todos = this.readAll();
    const index = todos.findIndex((t) => t.id === id);
    if (index === -1) return false;

    todos.splice(index, 1);
    this.writeAll(todos);
    return true;
  }
}

