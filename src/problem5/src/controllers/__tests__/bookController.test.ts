import { Request, Response } from "express";
import { BookController } from "../bookController";
import { BookRepository } from "../../repositories/BookRepository";
import { Book } from "../../entities/Book";
import { BookGenre, CreateBookRequest, UpdateBookRequest, BookFilters } from "../../types";
import {
  ERROR_CODES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  HTTP_STATUS,
} from "../../constants/errors";
import { ZodError } from "zod";

// Mock the BookRepository
jest.mock("../../repositories/BookRepository");

describe("BookController", () => {
  let bookController: BookController;
  let mockBookRepository: jest.Mocked<BookRepository>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  const mockBook: Book = {
    id: "test-id-123",
    title: "Test Book",
    author: "Test Author",
    isbn: "1234567890123",
    publishedYear: 2023,
    genre: BookGenre.FICTION,
    description: "A test book",
    price: 29.99,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create mock response methods
    mockJson = jest.fn().mockReturnThis();
    mockStatus = jest.fn().mockReturnThis();

    // Create mock response
    mockResponse = {
      status: mockStatus,
      json: mockJson,
    };

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
    (
      BookRepository as jest.MockedClass<typeof BookRepository>
    ).mockImplementation(() => mockBookRepository);

    bookController = new BookController(mockBookRepository);
  });

  describe("create", () => {
    it("should create a book successfully", async () => {
      const bookData: CreateBookRequest = {
        title: "New Book",
        author: "New Author",
        isbn: "9876543210987",
        publishedYear: 2024,
        genre: BookGenre.NON_FICTION,
        description: "A new book",
        price: 19.99,
      };

      mockRequest = {
        body: bookData,
      };

      mockBookRepository.create.mockResolvedValue(mockBook);

      await bookController.create(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockBookRepository.create).toHaveBeenCalledWith(bookData);
      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.CREATED);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockBook,
        message: SUCCESS_MESSAGES.BOOK_CREATED,
        statusCode: HTTP_STATUS.CREATED,
      });
    });

    it("should handle validation error", async () => {
      const invalidBookData = {
        title: "", // Invalid: empty title
        author: "New Author",
        isbn: "123", // Invalid: too short
        publishedYear: 2024,
        genre: BookGenre.NON_FICTION,
      };

      mockRequest = {
        body: invalidBookData,
      };
      const zodError = new ZodError([
        {
          code: "too_small",
          minimum: 1,
          inclusive: true,
          exact: false,
          message: "Title is required",
          path: ["title"],
          origin: "validation",
          input: ""
        },
      ]);

      await bookController.create(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockBookRepository.create).not.toHaveBeenCalled();
      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: ERROR_MESSAGES[ERROR_CODES.VALIDATION_ERROR],
        errorCode: ERROR_CODES.VALIDATION_ERROR,
        statusCode: HTTP_STATUS.BAD_REQUEST,
        message: expect.any(String),
      });
    });

    it("should handle repository error", async () => {
      const bookData: CreateBookRequest = {
        title: "New Book",
        author: "New Author",
        isbn: "9876543210987",
        publishedYear: 2024,
        genre: BookGenre.NON_FICTION,
      };

      mockRequest = {
        body: bookData,
      };

      const error = new Error("Database error");
      mockBookRepository.create.mockRejectedValue(error);

      await bookController.create(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockBookRepository.create).toHaveBeenCalledWith(bookData);
      expect(mockStatus).toHaveBeenCalledWith(
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: ERROR_MESSAGES[ERROR_CODES.INTERNAL_SERVER_ERROR],
        errorCode: ERROR_CODES.INTERNAL_SERVER_ERROR,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      });
    });
  });

  describe("getAll", () => {
    it("should get all books successfully", async () => {
      const filters: BookFilters = {
        title: "Test",
        limit: 10,
        offset: 0,
      };

      mockRequest = {
        query: {
          title: "Test",
          limit: "10",
          offset: "0",
        },
      };

      const mockBooks = [mockBook];
      const mockTotal = 1;

      mockBookRepository.findAll.mockResolvedValue(mockBooks);
      mockBookRepository.count.mockResolvedValue(mockTotal);

      await bookController.getAll(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockBookRepository.findAll).toHaveBeenCalledWith(filters);
      expect(mockBookRepository.count).toHaveBeenCalledWith(filters);
      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: {
          data: mockBooks,
          total: mockTotal,
          limit: 10,
          offset: 0,
          hasMore: false,
        },
        message: SUCCESS_MESSAGES.BOOKS_RETRIEVED,
        statusCode: HTTP_STATUS.OK,
      });
    });

    it("should handle validation error for query parameters", async () => {
      const invalidFilters = {
        limit: "invalid", // Invalid: should be number
        offset: "-1", // Invalid: negative offset
      };

      mockRequest = {
        query: invalidFilters,
      };

      await bookController.getAll(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockBookRepository.findAll).not.toHaveBeenCalled();
      expect(mockBookRepository.count).not.toHaveBeenCalled();
      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: ERROR_MESSAGES[ERROR_CODES.VALIDATION_ERROR],
        errorCode: ERROR_CODES.VALIDATION_ERROR,
        statusCode: HTTP_STATUS.BAD_REQUEST,
        message: expect.any(String),
      });
    });

    it("should handle repository error", async () => {
      const filters: BookFilters = {};

      mockRequest = {
        query: {},
      };

      const error = new Error("Database error");
      mockBookRepository.findAll.mockRejectedValue(error);

      await bookController.getAll(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockBookRepository.findAll).toHaveBeenCalledWith(filters);
      expect(mockStatus).toHaveBeenCalledWith(
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: ERROR_MESSAGES[ERROR_CODES.INTERNAL_SERVER_ERROR],
        errorCode: ERROR_CODES.INTERNAL_SERVER_ERROR,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      });
    });
  });

  describe("getById", () => {
    it("should get a book by id successfully", async () => {
      const bookId = "test-id-123";

      mockRequest = {
        params: { id: bookId },
      };

      mockBookRepository.findById.mockResolvedValue(mockBook);

      await bookController.getById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockBookRepository.findById).toHaveBeenCalledWith(bookId);
      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockBook,
        message: SUCCESS_MESSAGES.BOOK_RETRIEVED,
        statusCode: HTTP_STATUS.OK,
      });
    });

    it("should handle book not found", async () => {
      const bookId = "non-existent-id";

      mockRequest = {
        params: { id: bookId },
      };

      mockBookRepository.findById.mockResolvedValue(null);

      await bookController.getById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockBookRepository.findById).toHaveBeenCalledWith(bookId);
      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: ERROR_MESSAGES[ERROR_CODES.BOOK_NOT_FOUND],
        errorCode: ERROR_CODES.BOOK_NOT_FOUND,
        statusCode: HTTP_STATUS.NOT_FOUND,
      });
    });

    it("should handle repository error", async () => {
      const bookId = "test-id-123";

      mockRequest = {
        params: { id: bookId },
      };

      const error = new Error("Database error");
      mockBookRepository.findById.mockRejectedValue(error);

      await bookController.getById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockBookRepository.findById).toHaveBeenCalledWith(bookId);
      expect(mockStatus).toHaveBeenCalledWith(
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: ERROR_MESSAGES[ERROR_CODES.INTERNAL_SERVER_ERROR],
        errorCode: ERROR_CODES.INTERNAL_SERVER_ERROR,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      });
    });
  });

  describe("update", () => {
    it("should update a book successfully", async () => {
      const bookId = "test-id-123";
      const updateData: UpdateBookRequest = {
        title: "Updated Book",
        price: 39.99,
      };

      mockRequest = {
        params: { id: bookId },
        body: updateData,
      };

      const updatedBook = { ...mockBook, ...updateData };
      mockBookRepository.findById.mockResolvedValue(mockBook);
      mockBookRepository.update.mockResolvedValue(updatedBook);

      await bookController.update(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockBookRepository.findById).toHaveBeenCalledWith(bookId);
      expect(mockBookRepository.update).toHaveBeenCalledWith(
        bookId,
        updateData
      );
      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: updatedBook,
        message: SUCCESS_MESSAGES.BOOK_UPDATED,
        statusCode: HTTP_STATUS.OK,
      });
    });

    it("should handle book not found for update", async () => {
      const bookId = "non-existent-id";
      const updateData: UpdateBookRequest = {
        title: "Updated Book",
      };

      mockRequest = {
        params: { id: bookId },
        body: updateData,
      };

      mockBookRepository.findById.mockResolvedValue(null);

      await bookController.update(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockBookRepository.findById).toHaveBeenCalledWith(bookId);
      expect(mockBookRepository.update).not.toHaveBeenCalled();
      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: ERROR_MESSAGES[ERROR_CODES.BOOK_NOT_FOUND],
        errorCode: ERROR_CODES.BOOK_NOT_FOUND,
        statusCode: HTTP_STATUS.NOT_FOUND,
      });
    });

    it("should handle validation error", async () => {
      const bookId = "test-id-123";
      const invalidUpdateData = {
        title: "", // Invalid: empty title
        price: -10, // Invalid: negative price
      };

      mockRequest = {
        params: { id: bookId },
        body: invalidUpdateData,
      };

      await bookController.update(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockBookRepository.update).not.toHaveBeenCalled();
      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: ERROR_MESSAGES[ERROR_CODES.VALIDATION_ERROR],
        errorCode: ERROR_CODES.VALIDATION_ERROR,
        statusCode: HTTP_STATUS.BAD_REQUEST,
        message: expect.any(String),
      });
    });

    it("should handle repository error", async () => {
      const bookId = "test-id-123";
      const updateData: UpdateBookRequest = {
        title: "Updated Book",
      };

      mockRequest = {
        params: { id: bookId },
        body: updateData,
      };

      const error = new Error("Database error");
      mockBookRepository.findById.mockResolvedValue(mockBook);
      mockBookRepository.update.mockRejectedValue(error);

      await bookController.update(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockBookRepository.findById).toHaveBeenCalledWith(bookId);
      expect(mockBookRepository.update).toHaveBeenCalledWith(
        bookId,
        updateData
      );
      expect(mockStatus).toHaveBeenCalledWith(
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: ERROR_MESSAGES[ERROR_CODES.INTERNAL_SERVER_ERROR],
        errorCode: ERROR_CODES.INTERNAL_SERVER_ERROR,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      });
    });
  });

  describe("delete", () => {
    it("should delete a book successfully", async () => {
      const bookId = "test-id-123";

      mockRequest = {
        params: { id: bookId },
      };

      mockBookRepository.findById.mockResolvedValue(mockBook);
      mockBookRepository.delete.mockResolvedValue(true);

      await bookController.delete(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockBookRepository.findById).toHaveBeenCalledWith(bookId);
      expect(mockBookRepository.delete).toHaveBeenCalledWith(bookId);
      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: SUCCESS_MESSAGES.BOOK_DELETED,
        statusCode: HTTP_STATUS.OK,
      });
    });

    it("should handle book not found for deletion", async () => {
      const bookId = "non-existent-id";

      mockRequest = {
        params: { id: bookId },
      };

      mockBookRepository.findById.mockResolvedValue(null);

      await bookController.delete(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockBookRepository.findById).toHaveBeenCalledWith(bookId);
      expect(mockBookRepository.delete).not.toHaveBeenCalled();
      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: ERROR_MESSAGES[ERROR_CODES.BOOK_NOT_FOUND],
        errorCode: ERROR_CODES.BOOK_NOT_FOUND,
        statusCode: HTTP_STATUS.NOT_FOUND,
      });
    });

    it("should handle repository error", async () => {
      const bookId = "test-id-123";

      mockRequest = {
        params: { id: bookId },
      };

      const error = new Error("Database error");
      mockBookRepository.findById.mockResolvedValue(mockBook);
      mockBookRepository.delete.mockRejectedValue(error);

      await bookController.delete(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockBookRepository.findById).toHaveBeenCalledWith(bookId);
      expect(mockBookRepository.delete).toHaveBeenCalledWith(bookId);
      expect(mockStatus).toHaveBeenCalledWith(
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: ERROR_MESSAGES[ERROR_CODES.INTERNAL_SERVER_ERROR],
        errorCode: ERROR_CODES.INTERNAL_SERVER_ERROR,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      });
    });
  });
});
