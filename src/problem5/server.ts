import express, { NextFunction, Request, Response } from "express";
import {
  createBook,
  deleteBook,
  getBookById,
  listBooks,
  parseBookFilters,
  parseCreateBookInput,
  parseUpdateBookInput,
  updateBook,
} from "./bookService";

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json());

function getRouteId(request: Request): string {
  const id = request.params.id;
  return Array.isArray(id) ? id[0] : id;
}

app.get("/health", (_request: Request, response: Response) => {
  response.json({ status: "ok" });
});

app.post("/books", async (request: Request, response: Response, next: NextFunction) => {
  try {
    const input = parseCreateBookInput(request.body);
    const book = await createBook(input);

    response.status(201).json(book);
  } catch (error) {
    next(error);
  }
});

app.get("/books", async (request: Request, response: Response, next: NextFunction) => {
  try {
    const filters = parseBookFilters(request.query);
    const result = await listBooks(filters);

    response.json({
      ...result,
      limit: filters.limit,
      offset: filters.offset,
    });
  } catch (error) {
    next(error);
  }
});

app.get("/books/:id", async (request: Request, response: Response, next: NextFunction) => {
  try {
    const book = await getBookById(getRouteId(request));

    if (book === undefined) {
      response.status(404).json({ message: "Book not found." });
      return;
    }

    response.json(book);
  } catch (error) {
    next(error);
  }
});

app.patch("/books/:id", async (request: Request, response: Response, next: NextFunction) => {
  try {
    const input = parseUpdateBookInput(request.body);
    const book = await updateBook(getRouteId(request), input);

    if (book === undefined) {
      response.status(404).json({ message: "Book not found." });
      return;
    }

    response.json(book);
  } catch (error) {
    next(error);
  }
});

app.delete("/books/:id", async (request: Request, response: Response, next: NextFunction) => {
  try {
    const deleted = await deleteBook(getRouteId(request));

    if (!deleted) {
      response.status(404).json({ message: "Book not found." });
      return;
    }

    response.status(204).send();
  } catch (error) {
    next(error);
  }
});

app.use((error: Error, _request: Request, response: Response, _next: NextFunction) => {
  response.status(400).json({ message: error.message });
});

app.listen(port, () => {
  console.log(`Problem 5 server is running on http://localhost:${port}`);
});
