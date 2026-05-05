import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const statusCode = err.status || 500;

  const errorLog = {
    method: req.method,
    url: req.originalUrl,
    status: statusCode,
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  };

  console.error(JSON.stringify(errorLog));

  res.status(statusCode).json({
    message: statusCode === 500 ? "Internal Server Error" : err.message,
  });
};
