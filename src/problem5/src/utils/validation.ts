import Joi from "joi";
import { Request, Response, NextFunction } from "express";
import { TaskStatus } from "../types/task.types";

export const validStatuses = Object.values(TaskStatus);

export const validateTaskQuery = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { status } = req.query;
  if (status) {
    if (
      typeof status !== "string" ||
      !validStatuses.includes(status as TaskStatus)
    ) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }
  }
  return next();
};

export const createTaskSchema = Joi.object({
  title: Joi.string().required().min(1).max(255).messages({
    "string.empty": "Title is required",
    "string.min": "Title must be at least 1 character",
    "string.max": "Title must not exceed 255 characters",
  }),
  description: Joi.string().optional().allow(null, "").max(1000).messages({
    "string.max": "Description must not exceed 1000 characters",
  }),
  status: Joi.string()
    .valid("TODO", "IN_PROGRESS", "DONE")
    .optional()
    .messages({
      "any.only": "Status must be one of: TODO, IN_PROGRESS, DONE",
    }),
});

export const updateTaskSchema = Joi.object({
  title: Joi.string().optional().min(1).max(255).messages({
    "string.min": "Title must be at least 1 character",
    "string.max": "Title must not exceed 255 characters",
  }),
  description: Joi.string().optional().allow(null, "").max(1000).messages({
    "string.max": "Description must not exceed 1000 characters",
  }),
  status: Joi.string()
    .valid("TODO", "IN_PROGRESS", "DONE")
    .optional()
    .messages({
      "any.only": "Status must be one of: TODO, IN_PROGRESS, DONE",
    }),
}).min(1);

export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const errors: Record<string, string[]> = {};
      error.details.forEach((detail) => {
        const key = detail.path.join(".");
        if (!errors[key]) {
          errors[key] = [];
        }
        errors[key].push(detail.message);
      });

      return res.status(400).json({
        message: "Validation failed",
        errors,
      });
    }

    return next();
  };
};
