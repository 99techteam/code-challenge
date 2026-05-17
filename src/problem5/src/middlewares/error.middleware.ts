import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import { errorResponse } from "../helpers/response.helper";

export class AppError extends Error {
  statusCode: number;
  errors?: Record<string, string>;

  constructor(
    message: string,
    statusCode = 500,
    errors?: Record<string, string>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.name = "AppError";
    this.errors = errors;
  }
}

export const errorMiddleware = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    errorResponse(res, err.message, err.statusCode, err.errors);
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2025") {
      errorResponse(res, "Record not found", 404);
      return;
    }
    if (err.code === "P2002") {
      errorResponse(res, "Duplicate record", 409);
      return;
    }
  }

  console.error(err);
  errorResponse(res, "Internal server error", 500);
};
