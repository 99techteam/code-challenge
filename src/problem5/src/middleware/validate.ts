import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { badRequest } from '../utils/response';

/**
 * Simplified validation middleware that can validate body, query, and params in one function
 */
export const validate = (schema: {
  body?: Joi.ObjectSchema;
  query?: Joi.ObjectSchema;
  params?: Joi.ObjectSchema;
}) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: string[] = [];

    // Validate request body
    if (schema.body) {
      const { error: bodyError, value } = schema.body.validate(req.body);
      if (bodyError) {
        errors.push(...bodyError.details.map(d => d.message));
      } else {
        req.body = value;
      }
    }

    // Validate query parameters
    if (schema.query) {
      const { error: queryError, value } = schema.query.validate(req.query);
      if (queryError) {
        errors.push(...queryError.details.map(d => d.message));
      } else {
        Object.assign(req.query, value);
      }
    }

    // Validate route parameters
    if (schema.params) {
      const { error: paramsError, value } = schema.params.validate(req.params);
      if (paramsError) {
        errors.push(...paramsError.details.map(d => d.message));
      } else {
        Object.assign(req.params, value);
      }
    }

    // Return validation errors if any
    if (errors.length > 0) {
      return badRequest(res, errors.join(', '));
    }

    next();
  };
};

/**
 * Validation schemas for resources
 */
export const resourceSchemas = {
  create: Joi.object({
    name: Joi.string().min(1).max(255).required().messages({
      'string.empty': 'Name is required',
      'string.max': 'Name must be less than 255 characters',
    }),
    description: Joi.string().min(1).required().messages({
      'string.empty': 'Description is required',
    }),
    category: Joi.string().min(1).max(100).required().messages({
      'string.empty': 'Category is required',
      'string.max': 'Category must be less than 100 characters',
    }),
    status: Joi.string().valid('active', 'inactive').default('active'),
    metadata: Joi.object().default({}),
  }),

  update: Joi.object({
    name: Joi.string().min(1).max(255).messages({
      'string.empty': 'Name cannot be empty',
      'string.max': 'Name must be less than 255 characters',
    }),
    description: Joi.string().min(1).messages({
      'string.empty': 'Description cannot be empty',
    }),
    category: Joi.string().min(1).max(100).messages({
      'string.empty': 'Category cannot be empty',
      'string.max': 'Category must be less than 100 characters',
    }),
    status: Joi.string().valid('active', 'inactive'),
    metadata: Joi.object(),
  })
    .min(1)
    .messages({
      'object.min': 'At least one field must be provided for update',
    }),

  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    search: Joi.string().allow(''),
    category: Joi.string().allow(''),
    status: Joi.string().valid('active', 'inactive').allow(''),
    sort_by: Joi.string()
      .valid('name', 'created_at', 'updated_at')
      .default('created_at'),
    sort_order: Joi.string().valid('asc', 'desc').default('desc'),
  }),

  params: Joi.object({
    id: Joi.number().integer().min(1).required().messages({
      'number.base': 'ID must be a valid number',
      'number.integer': 'ID must be an integer',
      'number.min': 'ID must be greater than 0',
    }),
  }),
};
