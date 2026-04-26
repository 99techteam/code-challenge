import { z, ZodError } from "zod";
import { Request, Response, NextFunction } from "express";

type Schema = Partial<{
  body: z.ZodTypeAny;
  query: z.ZodTypeAny;
  params: z.ZodTypeAny;
}>;

export const validate =
  (schema: Schema) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      (req as any).validated = {};

      if (schema.body) {
        (req as any).validated.body = schema.body.parse(req.body);
      }

      if (schema.query) {
        (req as any).validated.query = schema.query.parse(req.query);
      }

      if (schema.params) {
        (req as any).validated.params = schema.params.parse(req.params);
      }

      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({
          message: "Validation error",
          errors: err.flatten(),
        });
      }

      next(err);
    }
  };