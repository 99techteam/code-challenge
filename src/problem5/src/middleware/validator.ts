import { Request, Response, NextFunction } from 'express';

export const validateCreateResource = (req: Request, res: Response, next: NextFunction) => {
  const { name } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Name is required and must be a non-empty string'
    });
  }

  if (name.length > 255) {
    return res.status(400).json({
      success: false,
      error: 'Name must not exceed 255 characters'
    });
  }

  if (req.body.status && !['active', 'inactive', 'archived'].includes(req.body.status)) {
    return res.status(400).json({
      success: false,
      error: 'Status must be one of: active, inactive, archived'
    });
  }

  next();
};

export const validateUpdateResource = (req: Request, res: Response, next: NextFunction) => {
  const { name, status } = req.body;

  if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0)) {
    return res.status(400).json({
      success: false,
      error: 'Name must be a non-empty string'
    });
  }

  if (name && name.length > 255) {
    return res.status(400).json({
      success: false,
      error: 'Name must not exceed 255 characters'
    });
  }

  if (status && !['active', 'inactive', 'archived'].includes(status)) {
    return res.status(400).json({
      success: false,
      error: 'Status must be one of: active, inactive, archived'
    });
  }

  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({
      success: false,
      error: 'At least one field must be provided for update'
    });
  }

  next();
};

export const validateResourceId = (req: Request, res: Response, next: NextFunction) => {
  const id = parseInt(req.params.id);

  if (isNaN(id) || id <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Invalid resource ID'
    });
  }

  next();
};
