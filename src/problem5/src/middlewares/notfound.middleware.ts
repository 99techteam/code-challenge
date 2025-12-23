import { Request, Response, NextFunction } from "express";

export const notFoundHandler = (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  res.status(404).json({
    message: `Route ${req.method} ${req.path} not found`,
    statusCode: 404,
  });
};
