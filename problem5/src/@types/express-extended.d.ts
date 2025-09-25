import express from 'express'

declare global {
  namespace Express {
    interface Response {
      jsonSuccess(data: any, message?: string, statusCode?: number): void;
      jsonError(message: string, statusCode?: number, errors?: any): void;
    }

    interface Request {
      user?: any
    }
  }
}