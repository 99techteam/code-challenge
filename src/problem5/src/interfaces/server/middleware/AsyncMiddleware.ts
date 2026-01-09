import { Request, Response, Handler, NextFunction } from "express";

export function asyncMiddleware(fn: Handler) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
