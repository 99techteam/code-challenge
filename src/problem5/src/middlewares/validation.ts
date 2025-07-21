import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';

export interface ValidationError extends Error {
  status: number;
  errors: string[];
}

const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed') as ValidationError;
    error.status = 400;
    error.errors = [errors.array()[0].msg];
    return next(error);
  }
  next();
};

// Create Item Validation (based on Prisma schema)
export const validateCreateItem = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isString()
    .withMessage('Name must be a string')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Name cannot be empty'),
  
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isString()
    .withMessage('Description must be a string'),
  
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isString()
    .withMessage('Category must be a string'),
  
  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0 })
    .withMessage('Price must be a non-negative number'),
  
  handleValidationErrors
];

// Update Item Validation (based on Prisma schema)
export const validateUpdateItem = [
  body('name')
    .optional()
    .notEmpty()
    .withMessage('Name cannot be empty')
    .isString()
    .withMessage('Name must be a string')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Name cannot be empty'),
  
  body('description')
    .optional({ nullable: true })
    .isString()
    .withMessage('Description must be a string'),
  
  body('category')
    .optional({ nullable: true })
    .isString()
    .withMessage('Category must be a string'),
  
  body('price')
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage('Price must be a non-negative number'),
  
  handleValidationErrors
];

// Item ID Validation
export const validateItemId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID must be a positive integer'),
  
  handleValidationErrors
];

// Pagination and Query Validation
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('pageSize')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('PageSize must be a positive integer between 1 and 100'),
  
  query('sortBy')
    .optional()
    .isIn(['name', 'price', 'category', 'createdAt'])
    .withMessage('SortBy must be one of: name, price, category, createdAt'),
  
  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Order must be either asc or desc'),
  
  query('search')
    .optional()
    .isString()
    .withMessage('Search must be a string'),
  
  query('category')
    .optional()
    .isString()
    .withMessage('Category filter must be a string'),
  
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('MinPrice must be a non-negative number'),
  
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('MaxPrice must be a non-negative number'),
  
  // Custom validation to ensure minPrice <= maxPrice
  query('minPrice').custom((value, { req }) => {
    if (value && req.query?.maxPrice && parseFloat(value) > parseFloat(req.query.maxPrice as string)) {
      throw new Error('MinPrice cannot be greater than MaxPrice');
    }
    return true;
  }),
  
  handleValidationErrors
];