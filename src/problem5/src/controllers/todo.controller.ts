import { Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";
import * as todoService from "../services/todo.service";
import { createTodoSchema, updateTodoSchema } from "../validators/todo.schema";

export const createTodoHandler = asyncHandler(async (req: Request, res: Response) => {
  const validation = createTodoSchema.safeParse(req.body);

  if (!validation.success) {
    res.status(400).json({ message: validation.error.format() });
    return; 
  }

  const newTodo = await todoService.createTodo(validation.data);
  res.status(201).json({ message: "Success", data: newTodo });
});

export const getAllTodos = asyncHandler(async (req: Request, res: Response) => {
  const todos = await todoService.getAllTodos();
  res.status(200).json({message: "Success", data: todos});
});

export const getTodoById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const todo = await todoService.getTodoById(id);

  if (!todo) {
    res.status(404).json({ message: "Todo not found" });
    return;
  }

  res.status(200).json({message: "Success", data: todo});
});

export const updateTodoHandler = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const validation = updateTodoSchema.safeParse(req.body);

  if (!validation.success) {
    res.status(400).json({ message: validation.error.format() });
    return;
  }

  const updatedTodo = await todoService.updateTodo(id, validation.data);

  if (!updatedTodo) {
    res.status(404).json({ message: "Todo not found" });
    return;
  }

  res.json({ message: "Success", data: updatedTodo });
});

export const deleteTodo = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const deleted = await todoService.deleteTodo(id);
  if (!deleted) {
    res.status(404).json({ message: "Todo not found" });
    return;
  }

  res.status(200).json({ message: "Success" });
});
