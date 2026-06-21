import {  type Request, type Response, type NextFunction } from 'express';

export const errorHandler = (
  err: any, 
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  console.error('Global Error Boundary:', err);

  const status = err.status || 500;

  const message = status === 500 ? 'An unexpected error occurred' : err.message;

  // Use our standardized response helper
  res.error(message, status);
};