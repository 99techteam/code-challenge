import { Request, Response, NextFunction } from "express";

export const handler =
  (fn: (req: any, res: Response, next: NextFunction) => any) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);