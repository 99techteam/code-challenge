/**
 * Validation utilities
 */

import Joi from "joi";
import { CreateUserRequest, UpdateUserRequest } from "../types";

export const createUserSchema = Joi.object<CreateUserRequest>({
  name: Joi.string().min(2).max(50).required().messages({
    "string.min": "Name must be at least 2 characters long",
    "string.max": "Name must not exceed 50 characters",
    "any.required": "Name is required",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  }),
  age: Joi.number().integer().min(1).max(120).required().messages({
    "number.base": "Age must be a number",
    "number.integer": "Age must be an integer",
    "number.min": "Age must be at least 1",
    "number.max": "Age must not exceed 120",
    "any.required": "Age is required",
  }),
});

export const updateUserSchema = Joi.object<UpdateUserRequest>({
  name: Joi.string().min(2).max(50).optional().messages({
    "string.min": "Name must be at least 2 characters long",
    "string.max": "Name must not exceed 50 characters",
  }),
  email: Joi.string().email().optional().messages({
    "string.email": "Please provide a valid email address",
  }),
  age: Joi.number().integer().min(1).max(120).optional().messages({
    "number.base": "Age must be a number",
    "number.integer": "Age must be an integer",
    "number.min": "Age must be at least 1",
    "number.max": "Age must not exceed 120",
  }),
});

export const validateBody = (schema: Joi.ObjectSchema) => {
  return (req: any, res: any, next: any) => {
    const { error } = schema.validate(req.body);

    if (error) {
      const response = {
        success: false,
        message: "Validation error",
        error: error.details[0].message,
      };
      return res.status(400).json(response);
    }

    next();
  };
};
