import { Router } from 'express';
import { ResourceController } from '../controllers/resourceController';
import { validateBody, validateParams, validateQuery } from '../middleware/zodValidator';
import { authenticateApiKey } from '../middleware/auth';
import {
  CreateResourceSchema,
  UpdateResourceSchema,
  ResourceIdSchema,
  ResourceFiltersSchema,
} from '../types/resource';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateApiKey);

// Create a new resource
router.post(
  '/',
  validateBody(CreateResourceSchema),
  ResourceController.create
);

// List all resources with optional filters
router.get(
  '/',
  validateQuery(ResourceFiltersSchema),
  ResourceController.list
);

// Get a single resource by ID
router.get(
  '/:id',
  validateParams(ResourceIdSchema),
  ResourceController.getById
);

// Update a resource
router.put(
  '/:id',
  validateParams(ResourceIdSchema),
  validateBody(UpdateResourceSchema),
  ResourceController.update
);

// Delete a resource
router.delete(
  '/:id',
  validateParams(ResourceIdSchema),
  ResourceController.delete
);

export default router;
