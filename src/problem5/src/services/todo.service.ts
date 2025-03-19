import client from "../config/db";
import { Todo } from "../models/Todo";
import { v4 as uuidv4 } from 'uuid';
import { 
  getAllTodosQuery, 
  getTodoByIdQuery, 
  createTodoQuery, 
  updateTodoQuery, 
  deleteTodoQuery 
} from "../utils/Query";

export async function getAllTodos(): Promise<Todo[]> {
  const res = await client.query(getAllTodosQuery());
  return res.rows;
}

export async function getTodoById(id: string) {
  const res = await client.query(getTodoByIdQuery(), [id]);
  return res.rows[0] || null;
}

export async function createTodo(todo: { title: string; status: string; description: string }) {
  const values = [uuidv4(), todo.title, todo.status, todo.description];

  try {
    const res = await client.query(createTodoQuery(), values);
    return res.rows[0];
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
}

export async function updateTodo(id: string, updates: Partial<Todo>) {
  const values = [updates.title, updates.status, updates.description, id];

  const res = await client.query(updateTodoQuery(), values);
  return res.rows[0] || null;
}

export async function deleteTodo(id: string) {
  const res = await client.query(deleteTodoQuery(), [id]);
  return (res.rowCount ?? 0) > 0; 
}
