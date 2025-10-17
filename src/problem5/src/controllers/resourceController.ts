import { Request, Response, NextFunction } from 'express';
import Resource, { IResource } from '../models/Resource';
import { validationResult } from 'express-validator';
import asyncHandler from 'express-async-handler';
import { NotFoundError, ValidationError } from '../utils/errorHandler';

// Create a new resource
export const createResource = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Validation failed', errors.array());
  }

  const { name, description, value } = req.body;
  // Validate required fields manually to avoid Mongoose schema validation
  if (!name || typeof value !== 'number' || value < 0) {
    throw new ValidationError('Invalid input: name is required and value must be a non-negative number');
  }

  const resource: IResource = new Resource({ name, description, value });
  await resource.save();
  res.status(201).json(resource);
});

// List resources with basic filters
export const listResources = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { name, minValue, maxValue } = req.query;
  const query: any = {};

  if (name) query.name = { $regex: name as string, $options: 'i' };
  if (minValue) query.value = { ...query.value, $gte: parseFloat(minValue as string) };
  if (maxValue) query.value = { ...query.value, $lte: parseFloat(maxValue as string) };

  const resources = await Resource.find(query);
  console.log('Resources found:', resources);
  res.json(resources);
});

// Get details of a resource
export const getResource = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const resource = await Resource.findById(req.params.id);
  if (!resource) {
    throw new NotFoundError('Resource not found');
  }
  res.json(resource);
});

// Update resource details
export const updateResource = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Validation failed', errors.array());
  }

  const resource = await Resource.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!resource) {
    throw new NotFoundError('Resource not found');
  }
  res.json(resource);
});

// Delete a resource
export const deleteResource = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const resource = await Resource.findByIdAndDelete(req.params.id);
  if (!resource) {
    throw new NotFoundError('Resource not found');
  }
  res.json({ message: 'Resource deleted successfully' });
});