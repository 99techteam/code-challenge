import { body, param } from 'express-validator';

export const createBookValidation = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 1, max: 255 })
    .withMessage('Title must be between 1 and 255 characters'),
  
  body('author')
    .notEmpty()
    .withMessage('Author is required')
    .isLength({ min: 1, max: 255 })
    .withMessage('Author must be between 1 and 255 characters'),
  
  body('publishedYear')
    .isInt({ min: 1000, max: new Date().getFullYear() })
    .withMessage(`Published year must be between 1000 and ${new Date().getFullYear()}`),
  
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  
  body('genre')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Genre must be less than 50 characters')
];

export const updateBookValidation = [
  body('title')
    .optional()
    .isLength({ min: 1, max: 255 })
    .withMessage('Title must be between 1 and 255 characters'),
  
  body('author')
    .optional()
    .isLength({ min: 1, max: 255 })
    .withMessage('Author must be between 1 and 255 characters'),
  
  body('publishedYear')
    .optional()
    .isInt({ min: 1000, max: new Date().getFullYear() })
    .withMessage(`Published year must be between 1000 and ${new Date().getFullYear()}`),
  
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  
  body('genre')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Genre must be less than 50 characters')
];

export const bookIdValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Book ID must be a positive integer')
];
