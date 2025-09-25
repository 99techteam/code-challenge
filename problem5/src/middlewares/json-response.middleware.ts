import { Request, Response, NextFunction } from 'express';
  
export const jsonResponseMiddleware = (_: Request, res: Response, next: NextFunction) => {
  res.jsonSuccess = (data: any, message: string = 'success', statusCode: number = 200) => {
    res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  };

  res.jsonError = (message: string, statusCode: number = 400, errors?: any) => {
    res.status(statusCode).json({
      success: false,
      message,
      errors,
    });
  };

  next();
};