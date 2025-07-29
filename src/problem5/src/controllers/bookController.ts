import { Request, Response } from 'express';
import { BookRepository } from '../repositories/BookRepository';
import { CreateBookSchema, UpdateBookSchema, BookFiltersSchema } from '../types';
import { logger } from '../utils/logger';
import { ERROR_CODES, ERROR_MESSAGES, SUCCESS_MESSAGES, HTTP_STATUS } from '../constants/errors';

export class BookController {
  private bookRepository: BookRepository;

  constructor(bookRepository?: BookRepository) {
    this.bookRepository = bookRepository || new BookRepository();
  }

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const validatedData = CreateBookSchema.parse(req.body);
      const book = await this.bookRepository.create(validatedData);
      
      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        data: book,
        message: SUCCESS_MESSAGES.BOOK_CREATED,
        statusCode: HTTP_STATUS.CREATED
      });
    } catch (error) {
      logger.error('Error in create book controller:', error);
      
      if (error instanceof Error && error.name === 'ZodError') {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: ERROR_MESSAGES[ERROR_CODES.VALIDATION_ERROR],
          errorCode: ERROR_CODES.VALIDATION_ERROR,
          statusCode: HTTP_STATUS.BAD_REQUEST,
          message: error.message
        });
      } else {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
          success: false,
          error: ERROR_MESSAGES[ERROR_CODES.INTERNAL_SERVER_ERROR],
          errorCode: ERROR_CODES.INTERNAL_SERVER_ERROR,
          statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
        });
      }
    }
  };

  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const validatedFilters = BookFiltersSchema.parse(req.query);
      const books = await this.bookRepository.findAll(validatedFilters);
      const total = await this.bookRepository.count(validatedFilters);
      
      const limit = validatedFilters.limit || 10;
      const offset = validatedFilters.offset || 0;
      
      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: {
          data: books,
          total,
          limit,
          offset,
          hasMore: offset + books.length < total
        },
        message: SUCCESS_MESSAGES.BOOKS_RETRIEVED,
        statusCode: HTTP_STATUS.OK
      });
    } catch (error) {
      logger.error('Error in get all books controller:', error);
      
      if (error instanceof Error && error.name === 'ZodError') {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: ERROR_MESSAGES[ERROR_CODES.VALIDATION_ERROR],
          errorCode: ERROR_CODES.VALIDATION_ERROR,
          statusCode: HTTP_STATUS.BAD_REQUEST,
          message: error.message
        });
      } else {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
          success: false,
          error: ERROR_MESSAGES[ERROR_CODES.INTERNAL_SERVER_ERROR],
          errorCode: ERROR_CODES.INTERNAL_SERVER_ERROR,
          statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
        });
      }
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const book = await this.bookRepository.findById(id);
      
      if (!book) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: ERROR_MESSAGES[ERROR_CODES.BOOK_NOT_FOUND],
          errorCode: ERROR_CODES.BOOK_NOT_FOUND,
          statusCode: HTTP_STATUS.NOT_FOUND
        });
        return;
      }
      
      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: book,
        message: SUCCESS_MESSAGES.BOOK_RETRIEVED,
        statusCode: HTTP_STATUS.OK
      });
    } catch (error) {
      logger.error('Error in get book by ID controller:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: ERROR_MESSAGES[ERROR_CODES.INTERNAL_SERVER_ERROR],
        errorCode: ERROR_CODES.INTERNAL_SERVER_ERROR,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
      });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const validatedData = UpdateBookSchema.parse(req.body);
      
      const existingBook = await this.bookRepository.findById(id);
      if (!existingBook) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: ERROR_MESSAGES[ERROR_CODES.BOOK_NOT_FOUND],
          errorCode: ERROR_CODES.BOOK_NOT_FOUND,
          statusCode: HTTP_STATUS.NOT_FOUND
        });
        return;
      }
      
      const updatedBook = await this.bookRepository.update(id, validatedData);
      
      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: updatedBook,
        message: SUCCESS_MESSAGES.BOOK_UPDATED,
        statusCode: HTTP_STATUS.OK
      });
    } catch (error) {
      logger.error('Error in update book controller:', error);
      
      if (error instanceof Error && error.name === 'ZodError') {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: ERROR_MESSAGES[ERROR_CODES.VALIDATION_ERROR],
          errorCode: ERROR_CODES.VALIDATION_ERROR,
          statusCode: HTTP_STATUS.BAD_REQUEST,
          message: error.message
        });
      } else {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
          success: false,
          error: ERROR_MESSAGES[ERROR_CODES.INTERNAL_SERVER_ERROR],
          errorCode: ERROR_CODES.INTERNAL_SERVER_ERROR,
          statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
        });
      }
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      const existingBook = await this.bookRepository.findById(id);
      if (!existingBook) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: ERROR_MESSAGES[ERROR_CODES.BOOK_NOT_FOUND],
          errorCode: ERROR_CODES.BOOK_NOT_FOUND,
          statusCode: HTTP_STATUS.NOT_FOUND
        });
        return;
      }
      
      await this.bookRepository.delete(id);
      
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.BOOK_DELETED,
        statusCode: HTTP_STATUS.OK
      });
    } catch (error) {
      logger.error('Error in delete book controller:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: ERROR_MESSAGES[ERROR_CODES.INTERNAL_SERVER_ERROR],
        errorCode: ERROR_CODES.INTERNAL_SERVER_ERROR,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
      });
    }
  };
} 