import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { BookService } from '../services/bookService';
import { CreateBookDto, UpdateBookDto, BookFilterDto, ApiResponse, PaginatedResponse } from '../types';
import { Book } from '../entity/Book';

export class BookController {
  private bookService: BookService;

  constructor() {
    this.bookService = new BookService();
  }

  /**
   * @swagger
   * /api/books:
   *   post:
   *     summary: Create a new book
   *     tags: [Books]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - title
   *               - author
   *               - publishedYear
   *             properties:
   *               title:
   *                 type: string
   *                 example: "The Great Gatsby"
   *               author:
   *                 type: string
   *                 example: "F. Scott Fitzgerald"
   *               publishedYear:
   *                 type: integer
   *                 example: 1925
   *               description:
   *                 type: string
   *                 example: "A classic American novel"
   *               genre:
   *                 type: string
   *                 example: "Fiction"
   *     responses:
   *       201:
   *         description: Book created successfully
   *       400:
   *         description: Validation error
   *       500:
   *         description: Internal server error
   */
  createBook = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const response: ApiResponse<null> = {
          success: false,
          message: 'Validation failed',
          error: errors.array().map(err => err.msg).join(', ')
        };
        res.status(400).json(response);
        return;
      }

      const bookData: CreateBookDto = req.body;
      const book = await this.bookService.createBook(bookData);

      const response: ApiResponse<Book> = {
        success: true,
        message: 'Book created successfully',
        data: book
      };

      res.status(201).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        message: 'Failed to create book',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
    }
  };

  /**
   * @swagger
   * /api/books:
   *   get:
   *     summary: Get all books with optional filters
   *     tags: [Books]
   *     parameters:
   *       - in: query
   *         name: author
   *         schema:
   *           type: string
   *         description: Filter by author name
   *       - in: query
   *         name: publishedYear
   *         schema:
   *           type: integer
   *         description: Filter by published year
   *       - in: query
   *         name: genre
   *         schema:
   *           type: string
   *         description: Filter by genre
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 10
   *         description: Number of books per page
   *       - in: query
   *         name: offset
   *         schema:
   *           type: integer
   *           default: 0
   *         description: Number of books to skip
   *     responses:
   *       200:
   *         description: Books retrieved successfully
   *       500:
   *         description: Internal server error
   */
  getAllBooks = async (req: Request, res: Response): Promise<void> => {
    try {
      const filters: BookFilterDto = {
        author: req.query.author as string,
        publishedYear: req.query.publishedYear ? parseInt(req.query.publishedYear as string) : undefined,
        genre: req.query.genre as string,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
        offset: req.query.offset ? parseInt(req.query.offset as string) : 0
      };

      const { books, total } = await this.bookService.getAllBooks(filters);

      const response: PaginatedResponse<Book> = {
        success: true,
        message: 'Books retrieved successfully',
        data: books,
        pagination: {
          total,
          limit: filters.limit || 10,
          offset: filters.offset || 0,
          hasNext: (filters.offset || 0) + (filters.limit || 10) < total,
          hasPrev: (filters.offset || 0) > 0
        }
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        message: 'Failed to retrieve books',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
    }
  };

  /**
   * @swagger
   * /api/books/{id}:
   *   get:
   *     summary: Get a book by ID
   *     tags: [Books]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: Book ID
   *     responses:
   *       200:
   *         description: Book retrieved successfully
   *       404:
   *         description: Book not found
   *       500:
   *         description: Internal server error
   */
  getBookById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const book = await this.bookService.getBookById(id);

      if (!book) {
        const response: ApiResponse<null> = {
          success: false,
          message: 'Book not found'
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<Book> = {
        success: true,
        message: 'Book retrieved successfully',
        data: book
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        message: 'Failed to retrieve book',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
    }
  };

  /**
   * @swagger
   * /api/books/{id}:
   *   put:
   *     summary: Update a book
   *     tags: [Books]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: Book ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               title:
   *                 type: string
   *               author:
   *                 type: string
   *               publishedYear:
   *                 type: integer
   *               description:
   *                 type: string
   *               genre:
   *                 type: string
   *     responses:
   *       200:
   *         description: Book updated successfully
   *       404:
   *         description: Book not found
   *       500:
   *         description: Internal server error
   */
  updateBook = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const updateData: UpdateBookDto = req.body;

      const updatedBook = await this.bookService.updateBook(id, updateData);

      if (!updatedBook) {
        const response: ApiResponse<null> = {
          success: false,
          message: 'Book not found'
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<Book> = {
        success: true,
        message: 'Book updated successfully',
        data: updatedBook
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        message: 'Failed to update book',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
    }
  };

  /**
   * @swagger
   * /api/books/{id}:
   *   delete:
   *     summary: Delete a book
   *     tags: [Books]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: Book ID
   *     responses:
   *       200:
   *         description: Book deleted successfully
   *       404:
   *         description: Book not found
   *       500:
   *         description: Internal server error
   */
  deleteBook = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await this.bookService.deleteBook(id);

      if (!deleted) {
        const response: ApiResponse<null> = {
          success: false,
          message: 'Book not found'
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<null> = {
        success: true,
        message: 'Book deleted successfully'
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        message: 'Failed to delete book',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
    }
  };

  /**
   * @swagger
   * /api/books/search:
   *   get:
   *     summary: Search books by title, author, or description
   *     tags: [Books]
   *     parameters:
   *       - in: query
   *         name: q
   *         required: true
   *         schema:
   *           type: string
   *         description: Search term
   *     responses:
   *       200:
   *         description: Search results retrieved successfully
   *       400:
   *         description: Search term is required
   *       500:
   *         description: Internal server error
   */
  searchBooks = async (req: Request, res: Response): Promise<void> => {
    try {
      const searchTerm = req.query.q as string;

      if (!searchTerm) {
        const response: ApiResponse<null> = {
          success: false,
          message: 'Search term is required'
        };
        res.status(400).json(response);
        return;
      }

      const books = await this.bookService.searchBooks(searchTerm);

      const response: ApiResponse<Book[]> = {
        success: true,
        message: 'Search completed successfully',
        data: books
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        message: 'Search failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
    }
  };
}
