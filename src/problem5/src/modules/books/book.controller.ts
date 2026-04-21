import { Request, Response } from "express";

import * as bookService from "./book.service";
import { bookIdValidator, createBookValidator } from "./book.validator";

export const createBook = async (req: Request, res: Response) => {
  const validatedData = createBookValidator(req.body);
  if (!validatedData.valid) {
    return res.status(400).json({ errors: validatedData.errors });
  }

  const book = await bookService.createBook(req.body);

  return res
    .status(201)
    .json({ message: "Book created successfully!", data: book });
};

export const listBooks = async (req: Request, res: Response) => {
  const result = await bookService.listBooks(req.query);
  return res.status(200).json({
    message: "List books successfully!",
    data: result,
  });
};

export const getBookById = async (req: Request, res: Response) => {
  const bookIdValidation = bookIdValidator(req.params.id);
  if (!bookIdValidation.valid) {
    return res
      .status(400)
      .json({ message: "Bad Request", errors: bookIdValidation.errors });
  }

  const book = await bookService.getBookById(bookIdValidation.id);
  return res.status(200).json({
    message: "Book found successfully!",
    data: book,
  });
};

export const updateBook = async (req: Request, res: Response) => {
  const bookIdValidation = bookIdValidator(req.params.id);
  if (!bookIdValidation.valid) {
    return res
      .status(400)
      .json({ message: "Bad Request", errors: bookIdValidation.errors });
  }

  const updatedBook = await bookService.updateBook(bookIdValidation.id, req.body);
  return res.status(200).json({
    message: "Book updated successfully!",
    data: updatedBook,
  });
};

export const deleteBook = async (req: Request, res: Response) => {
  const bookIdValidation = bookIdValidator(req.params.id);
  if (!bookIdValidation.valid) {
    return res
      .status(400)
      .json({ message: "Bad Request", errors: bookIdValidation.errors });
  }

  await bookService.deleteBook(bookIdValidation.id);
  return res.status(200).json({
    message: "Book deleted successfully!",
  });
};
