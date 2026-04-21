import { Request, Response, NextFunction } from "express";

export const notFoundHandler = (_req: Request, res: Response) => {
  return res.status(404).json({ error: "Not Found" });
};

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const errorMessage = err.message || "Internal Server Error";
  const statusCode = (err as any).statusCode || 500;

  res.status(statusCode).json({ error: errorMessage });
};
