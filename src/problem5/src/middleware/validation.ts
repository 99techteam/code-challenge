import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { ResponseUtils } from '../utils/responseUtils';

export const createResourceSchema = Joi.object({
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
});

export const updateResourceSchema = Joi.object({
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
  });

export const queryParamsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().allow(''),
  category: Joi.string().allow(''),
  status: Joi.string().valid('active', 'inactive').allow(''),
  sort_by: Joi.string()
    .valid('name', 'created_at', 'updated_at')
    .default('created_at'),
  sort_order: Joi.string().valid('asc', 'desc').default('desc'),
});

export const idParamSchema = Joi.object({
  id: Joi.number().integer().min(1).required().messages({
    'number.base': 'ID must be a valid number',
    'number.integer': 'ID must be an integer',
    'number.min': 'ID must be greater than 0',
  }),
});

export const validateBody = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body);

    if (error) {
      const errorMessages = error.details.map(detail => detail.message);
      ResponseUtils.validationError(
        res,
        errorMessages.join(', '),
        errorMessages
      );
      return;
    }

    req.body = value;
    next();
  };
};

export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.query);

    if (error) {
      const errorMessages = error.details.map(detail => detail.message);
      ResponseUtils.badRequest(
        res,
        'Invalid query parameters',
        errorMessages.join(', ')
      );
      return;
    }

    // Assign validated values to req.query
    Object.assign(req.query, value);
    next();
  };
};

export const validateParams = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.params, { abortEarly: false });

    if (error) {
      const errorMessages = error.details.map(detail => detail.message);
      ResponseUtils.badRequest(
        res,
        'Invalid parameters',
        errorMessages.join(', ')
      );
      return;
    }

    // Assign validated values to req.params
    Object.assign(req.params, value);
    next();
  };
};
