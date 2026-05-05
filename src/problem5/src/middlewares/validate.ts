import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

export const validate =
  (schema: ZodSchema, source: "body" | "query" = "body") =>
  (req: Request, res: Response, next: NextFunction) => {
    const data = source === "body" ? req.body : req.query;

    const result = schema.safeParse(data);

    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: result.error.issues,
      });
    }

    if (source === "body") {
      req.body = result.data;
    } else {
      Object.assign(req.query, result.data);
    }
    next();
  };
