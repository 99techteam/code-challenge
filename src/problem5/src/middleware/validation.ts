import { Request, Response, NextFunction } from 'express';
import { CreateResourceRequest, UpdateResourceRequest, ResourceFilters } from '../models/Resource';
import { ValidationError } from './errorHandler';

export const validateCreateResource = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { name, description, category, status }: CreateResourceRequest = req.body;

  // Validate required fields
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    throw new ValidationError('Name is required and must be a non-empty string');
  }

  if (name.length > 255) {
    throw new ValidationError('Name must be less than 255 characters');
  }

  // Validate optional fields
  if (description !== undefined) {
    if (typeof description !== 'string') {
      throw new ValidationError('Description must be a string');
    }
    if (description.length > 1000) {
      throw new ValidationError('Description must be less than 1000 characters');
    }
  }

  if (category !== undefined) {
    if (typeof category !== 'string') {
      throw new ValidationError('Category must be a string');
    }
    if (category.length > 100) {
      throw new ValidationError('Category must be less than 100 characters');
    }
  }

  if (status !== undefined) {
    if (!['active', 'inactive', 'archived'].includes(status)) {
      throw new ValidationError('Status must be one of: active, inactive, archived');
    }
  }

  // Sanitize input
  req.body.name = name.trim();
  if (description) req.body.description = description.trim();
  if (category) req.body.category = category.trim();

  next();
};

export const validateUpdateResource = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { name, description, category, status }: UpdateResourceRequest = req.body;

  // At least one field must be provided for update
  if (!name && !description && !category && !status) {
    throw new ValidationError('At least one field must be provided for update');
  }

  // Validate fields if provided
  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length === 0) {
      throw new ValidationError('Name must be a non-empty string');
    }
    if (name.length > 255) {
      throw new ValidationError('Name must be less than 255 characters');
    }
    req.body.name = name.trim();
  }

  if (description !== undefined) {
    if (typeof description !== 'string') {
      throw new ValidationError('Description must be a string');
    }
    if (description.length > 1000) {
      throw new ValidationError('Description must be less than 1000 characters');
    }
    req.body.description = description.trim();
  }

  if (category !== undefined) {
    if (typeof category !== 'string') {
      throw new ValidationError('Category must be a string');
    }
    if (category.length > 100) {
      throw new ValidationError('Category must be less than 100 characters');
    }
    req.body.category = category.trim();
  }

  if (status !== undefined) {
    if (!['active', 'inactive', 'archived'].includes(status)) {
      throw new ValidationError('Status must be one of: active, inactive, archived');
    }
  }

  next();
};

export const validateResourceId = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { id } = req.params;
  
  if (!id || isNaN(Number(id)) || Number(id) <= 0) {
    throw new ValidationError('Invalid resource ID. Must be a positive integer.');
  }

  next();
};

export const validateQueryParams = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { category, status, search, limit, offset, sortBy, sortOrder } = req.query;

  // Validate status
  if (status && !['active', 'inactive', 'archived'].includes(status as string)) {
    throw new ValidationError('Status must be one of: active, inactive, archived');
  }

  // Validate limit
  if (limit !== undefined) {
    const limitNum = Number(limit);
    if (isNaN(limitNum) || limitNum <= 0 || limitNum > 100) {
      throw new ValidationError('Limit must be a positive integer between 1 and 100');
    }
  }

  // Validate offset
  if (offset !== undefined) {
    const offsetNum = Number(offset);
    if (isNaN(offsetNum) || offsetNum < 0) {
      throw new ValidationError('Offset must be a non-negative integer');
    }
  }

  // Validate sortBy
  if (sortBy && !['id', 'name', 'category', 'status', 'created_at', 'updated_at'].includes(sortBy as string)) {
    throw new ValidationError('SortBy must be one of: id, name, category, status, created_at, updated_at');
  }

  // Validate sortOrder
  if (sortOrder && !['ASC', 'DESC'].includes(sortOrder as string)) {
    throw new ValidationError('SortOrder must be either ASC or DESC');
  }

  next();
};