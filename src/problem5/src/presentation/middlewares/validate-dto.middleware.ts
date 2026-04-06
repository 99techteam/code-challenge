import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { Request, Response, NextFunction } from "express";

type ClassConstructor<T> = new (...args: unknown[]) => T;

export function validateBody<T extends object>(
  DtoClass: ClassConstructor<T>
): (req: Request, res: Response, next: NextFunction) => Promise<void> {
  return async (req, res, next) => {
    const instance = plainToInstance(DtoClass, req.body);
    const errors = await validate(instance as object, {
      whitelist: true,
      forbidNonWhitelisted: false,
    });

    if (errors.length > 0) {
      const messages = errors.flatMap((e) =>
        Object.values(e.constraints ?? {})
      );
      res.status(400).json({
        status: "error",
        message: "Validation failed",
        errors: messages,
      });
      return;
    }

    req.body = instance;
    next();
  };
}

export function validateQuery<T extends object>(
  DtoClass: ClassConstructor<T>
): (req: Request, res: Response, next: NextFunction) => Promise<void> {
  return async (req, res, next) => {
    const instance = plainToInstance(DtoClass, req.query);
    const errors = await validate(instance as object, {
      whitelist: true,
      forbidNonWhitelisted: false,
    });

    if (errors.length > 0) {
      const messages = errors.flatMap((e) =>
        Object.values(e.constraints ?? {})
      );
      res.status(400).json({
        status: "error",
        message: "Validation failed",
        errors: messages,
      });
      return;
    }

    (req as Request & { validatedQuery: T }).validatedQuery = instance;
    next();
  };
}
