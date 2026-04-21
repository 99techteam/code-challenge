import { Router } from "express";

import {
  createBook,
  listBooks,
  getBookById,
  updateBook,
  deleteBook,
} from "../modules/books";
import { requiredAuth } from "../middlewares/auth.middleware";

export const bookRouter = Router();

bookRouter.post("/", requiredAuth, createBook);
bookRouter.get("/", listBooks);
bookRouter.get("/:id", getBookById);
bookRouter.patch("/:id", requiredAuth, updateBook);
bookRouter.delete("/:id", requiredAuth, deleteBook);
