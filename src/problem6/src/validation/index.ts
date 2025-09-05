/**
 * Validation middleware for Scoreboard System
 */

import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { ApiResponse } from "../types";

/**
 * Generic validation middleware
 */
export const validate = (
  schema: Joi.ObjectSchema,
  property: "body" | "query" | "params" = "body"
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(", ");

      const response: ApiResponse = {
        success: false,
        message: "Validation error",
        error: errorMessage,
      };

      res.status(400).json(response);
      return;
    }

    // Replace the original data with validated and sanitized data
    req[property] = value;
    next();
  };
};

/**
 * Validate request body
 */
export const validateBody = (schema: Joi.ObjectSchema) =>
  validate(schema, "body");

/**
 * Validate query parameters
 */
export const validateQuery = (schema: Joi.ObjectSchema) =>
  validate(schema, "query");

/**
 * Validate route parameters
 */
export const validateParams = (schema: Joi.ObjectSchema) =>
  validate(schema, "params");
