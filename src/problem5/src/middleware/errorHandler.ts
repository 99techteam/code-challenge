import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error occurred:', error);

  const response: ApiResponse<null> = {
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  };

  res.status(500).json(response);
};

export const notFoundHandler = (req: Request, res: Response): void => {
  const response: ApiResponse<null> = {
    success: false,
    message: `Route ${req.originalUrl} not found`
  };

  res.status(404).json(response);
};
