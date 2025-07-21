import { Request, Response, NextFunction } from 'express';
import { errorHandler, AppError } from '../src/middlewares/errorHandler';
import { ValidationError } from '../src/middlewares/validation';
import logger from '../src/lib/logger';

jest.mock('../src/lib/logger');

describe('Error Handler Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      method: 'GET',
      url: '/test',
      get: jest.fn().mockReturnValue('test-user-agent'),
      ip: '127.0.0.1',
      connection: { remoteAddress: '127.0.0.1' } as any,
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Validation Errors', () => {
    it('should handle validation errors correctly', () => {
      const validationError: ValidationError = {
        name: 'ValidationError',
        message: 'Validation failed',
        status: 400,
        errors: ['Name is required'],
      } as ValidationError;

      errorHandler(validationError, mockReq as Request, mockRes as Response, mockNext);

      expect(logger.warn).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Validation failed',
          status: 400,
          method: 'GET',
          url: '/test',
        }),
        'Validation Error'
      );

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Validation failed',
        errors: ['Name is required'],
      });
    });
  });

  describe('Client Errors (4xx)', () => {
    it('should handle client errors correctly', () => {
      const clientError: AppError = {
        name: 'ClientError',
        message: 'Not Found',
        status: 404,
      };

      errorHandler(clientError, mockReq as Request, mockRes as Response, mockNext);

      expect(logger.warn).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Not Found',
          status: 404,
          method: 'GET',
          url: '/test',
        }),
        'Client Error'
      );

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Not Found',
      });
    });
  });

  describe('Server Errors (5xx)', () => {
    it('should handle server errors correctly', () => {
      const serverError: AppError = {
        name: 'ServerError',
        message: 'Database connection failed',
        status: 500,
      };

      errorHandler(serverError, mockReq as Request, mockRes as Response, mockNext);

      expect(logger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Database connection failed',
          status: 500,
          method: 'GET',
          url: '/test',
        }),
        'Server Error'
      );

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Database connection failed',
      });
    });

    it('should handle errors without status as server errors', () => {
      const error = new Error('Unexpected error');

      errorHandler(error as AppError, mockReq as Request, mockRes as Response, mockNext);

      expect(logger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Unexpected error',
          status: 500,
        }),
        'Server Error'
      );

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Unexpected error',
      });
    });

    it('should handle errors without message', () => {
      const error: AppError = {
        name: 'Error',
        message: '',
      };

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Internal Server Error',
      });
    });
  });

  describe('Error Context', () => {
    it('should include request context in error logs', () => {
      const error: AppError = {
        name: 'TestError',
        message: 'Test error',
        status: 400,
        stack: 'Error stack trace',
      };

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(logger.warn).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Test error',
          stack: 'Error stack trace',
          method: 'GET',
          url: '/test',
          status: 400,
          userAgent: 'test-user-agent',
          ip: '127.0.0.1',
        }),
        'Client Error'
      );
    });

    it('should handle missing request properties', () => {
      const mockReqMinimal: Partial<Request> = {
        method: 'POST',
        url: '/api/test',
        get: jest.fn().mockReturnValue(undefined),
        connection: {} as any,
      };

      const error: AppError = {
        name: 'TestError',
        message: 'Test error',
        status: 400,
      };

      errorHandler(error, mockReqMinimal as Request, mockRes as Response, mockNext);

      expect(logger.warn).toHaveBeenCalledWith(
        expect.objectContaining({
          userAgent: undefined,
          ip: undefined,
        }),
        'Client Error'
      );
    });
  });
});