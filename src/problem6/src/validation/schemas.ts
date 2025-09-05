/**
 * Validation schemas using Joi for Scoreboard System
 */

import Joi from "joi";
import { CreateUserRequest, LoginRequest, UpdateScoreRequest } from "../types";

export const createUserSchema = Joi.object<CreateUserRequest>({
  username: Joi.string()
    .min(3)
    .max(30)
    .alphanum()
    .required()
    .messages({
      "string.min": "Username must be at least 3 characters long",
      "string.max": "Username must not exceed 30 characters",
      "string.alphanum": "Username must contain only alphanumeric characters",
      "any.required": "Username is required",
    }),
  email: Joi.string()
    .email()
    .required()
    .messages({
      "string.email": "Please provide a valid email address",
      "any.required": "Email is required",
    }),
  password: Joi.string()
    .min(6)
    .max(100)
    .required()
    .messages({
      "string.min": "Password must be at least 6 characters long",
      "string.max": "Password must not exceed 100 characters",
      "any.required": "Password is required",
    }),
});

export const loginSchema = Joi.object<LoginRequest>({
  email: Joi.string()
    .email()
    .required()
    .messages({
      "string.email": "Please provide a valid email address",
      "any.required": "Email is required",
    }),
  password: Joi.string()
    .required()
    .messages({
      "any.required": "Password is required",
    }),
});

export const updateScoreSchema = Joi.object<UpdateScoreRequest>({
  action: Joi.string()
    .min(1)
    .max(100)
    .required()
    .messages({
      "string.min": "Action must be at least 1 character long",
      "string.max": "Action must not exceed 100 characters",
      "any.required": "Action is required",
    }),
  scoreIncrement: Joi.number()
    .integer()
    .min(1)
    .max(1000)
    .required()
    .messages({
      "number.base": "Score increment must be a number",
      "number.integer": "Score increment must be an integer",
      "number.min": "Score increment must be at least 1",
      "number.max": "Score increment must not exceed 1000",
      "any.required": "Score increment is required",
    }),
  timestamp: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      "number.base": "Timestamp must be a number",
      "number.integer": "Timestamp must be an integer",
      "number.positive": "Timestamp must be positive",
      "any.required": "Timestamp is required",
    }),
  signature: Joi.string()
    .optional()
    .messages({
      "string.base": "Signature must be a string",
    }),
});