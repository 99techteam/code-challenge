import express from "express";
import BookController from "../controllers/BookController";
const router = express.Router();

// router.get("/book", BookController.getAllBooks);
router.get("/book", (req, res) => {
  BookController.getAllBooks(req, res);
});
router.get("/book/:id", (req, res) => {
  BookController.getBook(req, res);
});
router.post("/book", (req, res) => {
  BookController.createBook(req, res);
});
router.put("/book/:id", (req, res) => {
  BookController.updateBook(req, res);
});
router.delete("/book/:id", (req, res) => {
  BookController.deleteBook(req, res);
});

export default router;
