import express from "express";
import { BookModel } from "../db/Book";
class BookController {
  getAllBooks = async (req: express.Request, res: express.Response) => {
    try {
      const books = await BookModel.find();
      return res.status(200).json({ data: books });
    } catch (error) {
      console.error("Error getting all books:", error);
      return res.status(500);
    }
  };
  getBook = async (req: express.Request, res: express.Response) => {
    try {
      const { id } = req.params;
      const book = await BookModel.findById(id);
      return res.status(200).json({ data: book });
    } catch (error) {
      return res.status(500);
    }
  };
  createBook = async (req: express.Request, res: express.Response) => {
    try {
      const { title, author, price } = req.body;
      const book = new BookModel({
        title,
        author,
        price,
      });
      await book.save();
      return res.status(201).json({ message: "Data created" });
    } catch (error) {
      return res.status(500);
    }
  };
  updateBook = async (req: express.Request, res: express.Response) => {
    try {
      const { id } = req.params;
      const { title, author, price } = req.body;
      const book = await BookModel.findById(id);
      if (book) {
        book.title = title;
        book.author = author;
        book.price = price;
        await book.save();
        return res.status(200).json({ message: "Data updated" });
      }
      return res.status(500);
    } catch (error) {
      return res.status(500);
    }
  };
  deleteBook = async (req: express.Request, res: express.Response) => {
    try {
      const { id } = req.params;
      await BookModel.findByIdAndDelete({ _id: id });
      return res.status(200).json({ message: "Data deleted" });
    } catch (error) {
      return res.status(500);
    }
  };
}

export default new BookController();
