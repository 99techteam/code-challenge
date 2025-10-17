// src/middleware/validation.ts
import { body } from 'express-validator';

export const createResourceValidator = [
  body('name').isString().notEmpty().withMessage('Name is required'),
  body('value').isNumeric().withMessage('Value must be a number'),
];

export const updateResourceValidator = [
  body('name').optional().isString().withMessage('Name must be a string'),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('value').optional().isNumeric().withMessage('Value must be a number'),
];