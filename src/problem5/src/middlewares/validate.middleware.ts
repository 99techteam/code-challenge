import { Request, Response, NextFunction } from "express";
import {
  validationResult,
  matchedData,
  ValidationChain,
} from "express-validator";
import { errorResponse } from "../helpers/response.helper";

export const validate =
  (validations: ValidationChain[]) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const result = validationResult(req);
    if (!result.isEmpty()) {
      const errors: Record<string, string> = {};
      result.array().forEach((err) => {
        if (err.type === "field") {
          errors[err.path] = err.msg;
        }
      });
      errorResponse(res, "Validation failed", 400, errors);
      return;
    }

    req.validated = matchedData(req, {
      locations: ["body", "query", "params"],
    });

    next();
  };
