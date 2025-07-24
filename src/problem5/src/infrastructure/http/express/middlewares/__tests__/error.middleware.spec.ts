import type { Request, Response, NextFunction } from 'express';

import { errorHandler } from '../error.middleware';

import { ValidationError } from '@/shared/errors/validation.error';
import { AuthenticationError, AuthorizationError } from '@/shared/errors/auth.error';
import { NotFoundError } from '@/shared/errors/not-found.error';
import { DatabaseError } from '@/shared/errors/database.error';

describe('errorHandler middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    req = {};
    next = jest.fn();
  });

  it('should handle ValidationError', () => {
    const error = new ValidationError('Invalid input');
    errorHandler(error, req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({
      error: 'ValidationError',
      message: 'Invalid input',
    });
  });

  it('should handle AuthenticationError', () => {
    const error = new AuthenticationError('Invalid token');
    errorHandler(error, req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: 'AuthenticationError',
      message: 'Invalid token',
    });
  });

  it('should handle AuthorizationError', () => {
    const error = new AuthorizationError('Access denied');
    errorHandler(error, req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: 'AuthorizationError',
      message: 'Access denied',
    });
  });

  it('should handle NotFoundError', () => {
    const error = new NotFoundError('Resource not found');
    errorHandler(error, req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: 'NotFoundError',
      message: 'Resource not found',
    });
  });

  it('should handle DatabaseError', () => {
    const error = new DatabaseError('Connection failed');
    errorHandler(error, req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'DatabaseError',
      message: 'Internal server error',
    });
  });

  it('should handle generic Error', () => {
    const error = new Error('Unexpected internal error');
    errorHandler(error, req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'InternalServerError',
      message: 'Unexpected internal error',
    });
  });
});
