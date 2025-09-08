import { Router } from 'express';
import { BookController } from '../controllers/bookController';
import { createBookValidation, updateBookValidation, bookIdValidation } from '../middleware/validation';

const router = Router();
const bookController = new BookController();

/**
 * @swagger
 * components:
 *   schemas:
 *     Book:
 *       type: object
 *       required:
 *         - id
 *         - title
 *         - author
 *         - publishedYear
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the book
 *         title:
 *           type: string
 *           description: The title of the book
 *         author:
 *           type: string
 *           description: The author of the book
 *         publishedYear:
 *           type: integer
 *           description: The year the book was published
 *         description:
 *           type: string
 *           description: A description of the book
 *         genre:
 *           type: string
 *           description: The genre of the book
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the book was added
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date the book was last updated
 *       example:
 *         id: 1
 *         title: "The Great Gatsby"
 *         author: "F. Scott Fitzgerald"
 *         publishedYear: 1925
 *         description: "A classic American novel"
 *         genre: "Fiction"
 *         createdAt: "2023-01-01T00:00:00.000Z"
 *         updatedAt: "2023-01-01T00:00:00.000Z"
 */

/**
 * @swagger
 * tags:
 *   name: Books
 *   description: The books managing API
 */

// Create a new book
router.post('/', createBookValidation, bookController.createBook);

// Get all books with optional filters
router.get('/', bookController.getAllBooks);

// Search books
router.get('/search', bookController.searchBooks);

// Get a book by ID
router.get('/:id', bookIdValidation, bookController.getBookById);

// Update a book
router.put('/:id', [...bookIdValidation, ...updateBookValidation], bookController.updateBook);

// Delete a book
router.delete('/:id', bookIdValidation, bookController.deleteBook);

export default router;
