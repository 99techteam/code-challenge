import { Response } from "express";

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPage: number;
}

export const successResponse = (
  res: Response,
  data: unknown,
  message: string,
  statusCode = 200,
  pagination?: PaginationMeta
): void => {
  res.status(statusCode).json({
    success: true,
    message,
    ...(pagination && { pagination }),
    data,
  });
};

export const errorResponse = (
  res: Response,
  message: string,
  statusCode = 400,
  errors?: Record<string, string>
): void => {
  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
  });
};
