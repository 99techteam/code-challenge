import { Response } from 'express';
import { ApiResponse, PaginatedResponse } from '../types';

/**
 * Simplified response utilities for consistent API responses
 */
export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  data?: T,
  message?: string
): void => {
  const response: ApiResponse<T> = {
    success: statusCode < 400,
    ...(data !== undefined && { data }),
    ...(message && { message }),
  };
  res.status(statusCode).json(response);
};

/**
 * Success responses
 */
export const ok = <T>(res: Response, data?: T, message?: string): void =>
  sendResponse(res, 200, data, message);

export const created = <T>(res: Response, data: T, message?: string): void =>
  sendResponse(res, 201, data, message || 'Resource created successfully');

export const updated = <T>(res: Response, data: T, message?: string): void =>
  sendResponse(res, 200, data, message || 'Resource updated successfully');

export const deleted = (res: Response, message?: string): void =>
  sendResponse(res, 200, undefined, message || 'Resource deleted successfully');

/**
 * Paginated response
 */
export const paginated = <T>(
  res: Response,
  paginatedData: PaginatedResponse<T>,
  message?: string
): void => sendResponse(res, 200, paginatedData, message);

/**
 * Error responses
 */
export const error = (res: Response, statusCode: number, message: string): void =>
  sendResponse(res, statusCode, undefined, message);

export const badRequest = (res: Response, message: string): void =>
  error(res, 400, message);

export const notFound = (res: Response, message: string): void =>
  error(res, 404, message);

export const conflict = (res: Response, message: string): void =>
  error(res, 409, message);

export const validationError = (res: Response, message: string): void =>
  error(res, 400, message);

export const internalError = (res: Response, message: string): void =>
  error(res, 500, message);
