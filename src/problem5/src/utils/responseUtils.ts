import { Response } from 'express';
import { ApiResponse, PaginatedResponse } from '../types';

/**
 * Utility functions for consistent API responses
 */
export class ResponseUtils {
  /**
   * Send a successful response
   */
  static success<T>(
    res: Response,
    data?: T,
    message?: string,
    statusCode: number = 200
  ): void {
    const response: ApiResponse<T> = {
      success: true,
      ...(data !== undefined && { data }),
      ...(message && { message }),
    };
    
    res.status(statusCode).json(response);
  }

  /**
   * Send a successful response with data
   */
  static successWithData<T>(
    res: Response,
    data: T,
    message?: string,
    statusCode: number = 200
  ): void {
    ResponseUtils.success(res, data, message, statusCode);
  }

  /**
   * Send a successful response for resource creation
   */
  static created<T>(
    res: Response,
    data: T,
    message: string = 'Resource created successfully'
  ): void {
    ResponseUtils.success(res, data, message, 201);
  }

  /**
   * Send a successful response for resource update
   */
  static updated<T>(
    res: Response,
    data: T,
    message: string = 'Resource updated successfully'
  ): void {
    ResponseUtils.success(res, data, message, 200);
  }

  /**
   * Send a successful response for resource deletion
   */
  static deleted(
    res: Response,
    message: string = 'Resource deleted successfully'
  ): void {
    ResponseUtils.success(res, undefined, message, 200);
  }

  /**
   * Send a paginated response
   */
  static paginated<T>(
    res: Response,
    paginatedData: PaginatedResponse<T>,
    message?: string
  ): void {
    ResponseUtils.success(res, paginatedData, message, 200);
  }

  /**
   * Send an error response
   */
  static error(
    res: Response,
    error: string,
    message?: string,
    statusCode: number = 500,
    additionalData?: Record<string, unknown>
  ): void {
    const response: ApiResponse = {
      success: false,
      error,
      ...(message && { message }),
      ...additionalData,
    };
    
    res.status(statusCode).json(response);
  }

  /**
   * Send a bad request error response
   */
  static badRequest(
    res: Response,
    error: string = 'Bad request',
    message?: string
  ): void {
    ResponseUtils.error(res, error, message, 400);
  }

  /**
   * Send an unauthorized error response
   */
  static unauthorized(
    res: Response,
    error: string = 'Unauthorized',
    message?: string
  ): void {
    ResponseUtils.error(res, error, message, 401);
  }

  /**
   * Send a forbidden error response
   */
  static forbidden(
    res: Response,
    error: string = 'Forbidden',
    message?: string
  ): void {
    ResponseUtils.error(res, error, message, 403);
  }

  /**
   * Send a not found error response
   */
  static notFound(
    res: Response,
    error: string = 'Resource not found',
    message?: string
  ): void {
    ResponseUtils.error(res, error, message, 404);
  }

  /**
   * Send a conflict error response
   */
  static conflict(
    res: Response,
    error: string = 'Resource conflict',
    message?: string
  ): void {
    ResponseUtils.error(res, error, message, 409);
  }

  /**
   * Send a validation error response
   */
  static validationError(
    res: Response,
    message: string,
    errors?: string[]
  ): void {
    const response: ApiResponse = {
      success: false,
      error: 'Validation failed',
      message,
      ...(errors && { errors }),
    };
    
    res.status(400).json(response);
  }

  /**
   * Send an internal server error response
   */
  static internalError(
    res: Response,
    error: string = 'Internal server error',
    message?: string
  ): void {
    ResponseUtils.error(res, error, message, 500);
  }
}

/**
 * Convenience functions for common response patterns
 */
export const sendSuccess = ResponseUtils.success;
export const sendError = ResponseUtils.error;
export const sendCreated = ResponseUtils.created;
export const sendUpdated = ResponseUtils.updated;
export const sendDeleted = ResponseUtils.deleted;
export const sendPaginated = ResponseUtils.paginated;
export const sendNotFound = ResponseUtils.notFound;
export const sendBadRequest = ResponseUtils.badRequest;
export const sendValidationError = ResponseUtils.validationError;
