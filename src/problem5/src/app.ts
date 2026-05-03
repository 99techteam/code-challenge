import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import helmet from "helmet";
import morgan from "morgan";
import { ZodError } from "zod";
import {
  createBook,
  deleteBook,
  getBookById,
  listBooks,
  updateBook,
} from "./bookRepository";
import { createBookSchema, listBookQuerySchema, updateBookSchema } from "./validation";

export const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.post("/books", async (req, res, next) => {
  try {
    const input = createBookSchema.parse(req.body);
    const book = await createBook(input);

    res.status(201).json({ data: book });
  } catch (error) {
    next(error);
  }
});

app.get("/books", async (req, res, next) => {
  try {
    const filters = listBookQuerySchema.parse(req.query);
    const books = await listBooks(filters);

    res.json({ data: books, count: books.length });
  } catch (error) {
    next(error);
  }
});

app.get("/books/:id", async (req, res, next) => {
  try {
    const book = await getBookById(req.params.id);

    if (!book) {
      res.status(404).json({ error: "Book not found" });
      return;
    }

    res.json({ data: book });
  } catch (error) {
    next(error);
  }
});

app.patch("/books/:id", async (req, res, next) => {
  try {
    const input = updateBookSchema.parse(req.body);
    const book = await updateBook(req.params.id, input);

    if (!book) {
      res.status(404).json({ error: "Book not found" });
      return;
    }

    res.json({ data: book });
  } catch (error) {
    next(error);
  }
});

app.delete("/books/:id", async (req, res, next) => {
  try {
    const deleted = await deleteBook(req.params.id);

    if (!deleted) {
      res.status(404).json({ error: "Book not found" });
      return;
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof ZodError) {
    res.status(400).json({
      error: "Validation failed",
      details: error.flatten(),
    });
    return;
  }

  console.error(error);
  res.status(500).json({ error: "Internal server error" });
});

