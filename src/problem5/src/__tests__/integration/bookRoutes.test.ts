import request from 'supertest';
import express from 'express';
import { BookRepository } from '../../repositories/BookRepository';
import { BookController } from '../../controllers/bookController';
import { Book } from '../../entities/Book';
import { BookGenre, CreateBookRequest, UpdateBookRequest } from '../../types';

// Mock the BookRepository
jest.mock('../../repositories/BookRepository');

describe('Book Routes Integration Tests', () => {
  let app: express.Application;
  let mockBookRepository: jest.Mocked<BookRepository>;
  let mockBookController: BookController;

  const mockBook: Book = {
    id: 'test-id-123',
    title: 'Test Book',
    author: 'Test Author',
    isbn: '1234567890123',
    publishedYear: 2023,
    genre: BookGenre.FICTION,
    description: 'A test book',
    price: 29.99,
    createdAt: new Date('2023-01-01T00:00:00.000Z'),
    updatedAt: new Date('2023-01-01T00:00:00.000Z'),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock repository
    mockBookRepository = {
      em: {} as any,
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    } as jest.Mocked<BookRepository>;

    // Mock the BookRepository constructor
    (BookRepository as jest.MockedClass<typeof BookRepository>).mockImplementation(() => mockBookRepository);

    // Create a test app with the mocked controller
    app = express();
    app.use(express.json());
    
    // Create controller with mocked repository
    mockBookController = new BookController(mockBookRepository);
    
    // Set up routes with the mocked controller
    app.post('/api/books', mockBookController.create);
    app.get('/api/books', mockBookController.getAll);
    app.get('/api/books/:id', mockBookController.getById);
    app.put('/api/books/:id', mockBookController.update);
    app.delete('/api/books/:id', mockBookController.delete);
  });

  describe('POST /api/books', () => {
    it('should create a book successfully', async () => {
      const bookData: CreateBookRequest = {
        title: 'New Book',
        author: 'New Author',
        isbn: '9876543210987',
        publishedYear: 2024,
        genre: BookGenre.NON_FICTION,
        description: 'A new book',
        price: 19.99,
      };

      mockBookRepository.create.mockResolvedValue(mockBook);

      const response = await request(app)
        .post('/api/books')
        .send(bookData)
        .expect(201);

      expect(response.body).toEqual({
        success: true,
        data: {
          ...mockBook,
          createdAt: mockBook.createdAt.toISOString(),
          updatedAt: mockBook.updatedAt.toISOString(),
        },
        message: 'Book created successfully',
        statusCode: 201,
      });

      expect(mockBookRepository.create).toHaveBeenCalledWith(bookData);
    });

    it('should return 400 for invalid book data', async () => {
      const invalidBookData = {
        title: '', // Invalid: empty title
        author: 'New Author',
        isbn: '123', // Invalid: too short
        publishedYear: 2024,
        genre: BookGenre.NON_FICTION,
      };

      const response = await request(app)
        .post('/api/books')
        .send(invalidBookData)
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        error: 'Validation error occurred',
        errorCode: 'VALIDATION_ERROR',
        statusCode: 400,
        message: expect.any(String),
      });

      expect(mockBookRepository.create).not.toHaveBeenCalled();
    });

    it('should return 500 for repository error', async () => {
      const bookData: CreateBookRequest = {
        title: 'New Book',
        author: 'New Author',
        isbn: '9876543210987',
        publishedYear: 2024,
        genre: BookGenre.NON_FICTION,
        description: 'A new book',
        price: 19.99,
      };

      mockBookRepository.create.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/api/books')
        .send(bookData)
        .expect(500);

      expect(response.body).toEqual({
        success: false,
        error: 'Internal server error occurred',
        errorCode: 'INTERNAL_SERVER_ERROR',
        statusCode: 500,
      });

      expect(mockBookRepository.create).toHaveBeenCalledWith(bookData);
    });
  });

  describe('GET /api/books', () => {
    it('should get all books successfully', async () => {
      const mockBooks = [mockBook];
      const mockTotal = 1;

      mockBookRepository.findAll.mockResolvedValue(mockBooks);
      mockBookRepository.count.mockResolvedValue(mockTotal);

      const response = await request(app)
        .get('/api/books')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          data: mockBooks.map(book => ({
            ...book,
            createdAt: book.createdAt.toISOString(),
            updatedAt: book.updatedAt.toISOString(),
          })),
          total: mockTotal,
          limit: 10,
          offset: 0,
          hasMore: false,
        },
        message: 'Books retrieved successfully',
        statusCode: 200,
      });

      expect(mockBookRepository.findAll).toHaveBeenCalledWith({});
      expect(mockBookRepository.count).toHaveBeenCalledWith({});
    });

    it('should get books with filters', async () => {
      const mockBooks = [mockBook];
      const mockTotal = 1;

      mockBookRepository.findAll.mockResolvedValue(mockBooks);
      mockBookRepository.count.mockResolvedValue(mockTotal);

      const response = await request(app)
        .get('/api/books')
        .query({
          title: 'Test',
          author: 'Author',
          genre: 'FICTION',
          limit: 10,
          offset: 0,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockBookRepository.findAll).toHaveBeenCalledWith({
        title: 'Test',
        author: 'Author',
        genre: 'FICTION',
        limit: 10,
        offset: 0,
      });
    });
  });

  describe('GET /api/books/:id', () => {
    it('should get a book by id successfully', async () => {
      const bookId = 'test-id-123';
      mockBookRepository.findById.mockResolvedValue(mockBook);

      const response = await request(app)
        .get(`/api/books/${bookId}`)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          ...mockBook,
          createdAt: mockBook.createdAt.toISOString(),
          updatedAt: mockBook.updatedAt.toISOString(),
        },
        message: 'Book retrieved successfully',
        statusCode: 200,
      });

      expect(mockBookRepository.findById).toHaveBeenCalledWith(bookId);
    });

    it('should return 404 for non-existent book', async () => {
      const bookId = 'non-existent-id';
      mockBookRepository.findById.mockResolvedValue(null);

      const response = await request(app)
        .get(`/api/books/${bookId}`)
        .expect(404);

      expect(response.body).toEqual({
        success: false,
        error: 'Book not found with the provided ID',
        errorCode: 'BOOK_NOT_FOUND',
        statusCode: 404,
      });
    });

    it('should return 500 for repository error', async () => {
      const bookId = 'test-id-123';
      mockBookRepository.findById.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get(`/api/books/${bookId}`)
        .expect(500);

      expect(response.body).toEqual({
        success: false,
        error: 'Internal server error occurred',
        errorCode: 'INTERNAL_SERVER_ERROR',
        statusCode: 500,
      });
    });
  });

  describe('PUT /api/books/:id', () => {
    it('should update a book successfully', async () => {
      const bookId = 'test-id-123';
      const updateData: UpdateBookRequest = {
        title: 'Updated Book',
        price: 39.99,
      };

      const updatedBook = { ...mockBook, ...updateData };
      mockBookRepository.findById.mockResolvedValue(mockBook);
      mockBookRepository.update.mockResolvedValue(updatedBook);

      const response = await request(app)
        .put(`/api/books/${bookId}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          ...updatedBook,
          createdAt: updatedBook.createdAt.toISOString(),
          updatedAt: updatedBook.updatedAt.toISOString(),
        },
        message: 'Book updated successfully',
        statusCode: 200,
      });

      expect(mockBookRepository.findById).toHaveBeenCalledWith(bookId);
      expect(mockBookRepository.update).toHaveBeenCalledWith(bookId, updateData);
    });

    it('should return 404 for non-existent book', async () => {
      const bookId = 'non-existent-id';
      const updateData: UpdateBookRequest = {
        title: 'Updated Book',
      };

      mockBookRepository.findById.mockResolvedValue(null);

      const response = await request(app)
        .put(`/api/books/${bookId}`)
        .send(updateData)
        .expect(404);

      expect(response.body).toEqual({
        success: false,
        error: 'Book not found with the provided ID',
        errorCode: 'BOOK_NOT_FOUND',
        statusCode: 404,
      });

      expect(mockBookRepository.findById).toHaveBeenCalledWith(bookId);
      expect(mockBookRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('DELETE /api/books/:id', () => {
    it('should delete a book successfully', async () => {
      const bookId = 'test-id-123';
      mockBookRepository.findById.mockResolvedValue(mockBook);
      mockBookRepository.delete.mockResolvedValue(true);

      const response = await request(app)
        .delete(`/api/books/${bookId}`)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Book deleted successfully',
        statusCode: 200,
      });

      expect(mockBookRepository.findById).toHaveBeenCalledWith(bookId);
      expect(mockBookRepository.delete).toHaveBeenCalledWith(bookId);
    });

    it('should return 404 for non-existent book', async () => {
      const bookId = 'non-existent-id';
      mockBookRepository.findById.mockResolvedValue(null);

      const response = await request(app)
        .delete(`/api/books/${bookId}`)
        .expect(404);

      expect(response.body).toEqual({
        success: false,
        error: 'Book not found with the provided ID',
        errorCode: 'BOOK_NOT_FOUND',
        statusCode: 404,
      });

      expect(mockBookRepository.findById).toHaveBeenCalledWith(bookId);
      expect(mockBookRepository.delete).not.toHaveBeenCalled();
    });

    it('should return 500 for repository error', async () => {
      const bookId = 'test-id-123';
      mockBookRepository.findById.mockResolvedValue(mockBook);
      mockBookRepository.delete.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .delete(`/api/books/${bookId}`)
        .expect(500);

      expect(response.body).toEqual({
        success: false,
        error: 'Internal server error occurred',
        errorCode: 'INTERNAL_SERVER_ERROR',
        statusCode: 500,
      });
    });
  });
}); 