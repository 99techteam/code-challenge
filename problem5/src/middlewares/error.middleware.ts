import { Request, Response } from 'express';
import { HttpExpception } from '../exceptions/base';

export const errorMiddleware = (error: HttpExpception, _: Request, res: Response) => {
  res.status(error.statusCode ?? 400).json({
    message: error.message,
    errorCode: error.errorCode,
  });
}