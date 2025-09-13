import { Router } from 'express';
import { ResourceController } from '../controllers/ResourceController';
import {
  validateCreateResource,
  validateUpdateResource,
  validateResourceId,
  validateQueryParams
} from '../middleware/validation';

const router = Router();

/**
 * @route   POST /api/resources
 * @desc    Create a new resource
 * @access  Public
 * @body    { name: string, description?: string, category?: string, status?: string }
 */
router.post('/', validateCreateResource, ResourceController.createResource);

/**
 * @route   GET /api/resources
 * @desc    Get all resources with filtering and pagination
 * @access  Public
 * @query   { category?, status?, search?, limit?, offset?, sortBy?, sortOrder? }
 */
router.get('/', validateQueryParams, ResourceController.getResources);

/**
 * @route   GET /api/resources/stats
 * @desc    Get resource statistics
 * @access  Public
 */
router.get('/stats', ResourceController.getResourceStats);

/**
 * @route   GET /api/resources/:id
 * @desc    Get a single resource by ID
 * @access  Public
 * @params  { id: number }
 */
router.get('/:id', validateResourceId, ResourceController.getResourceById);

/**
 * @route   PUT /api/resources/:id
 * @desc    Update a resource by ID
 * @access  Public
 * @params  { id: number }
 * @body    { name?: string, description?: string, category?: string, status?: string }
 */
router.put('/:id', validateResourceId, validateUpdateResource, ResourceController.updateResource);

/**
 * @route   DELETE /api/resources/:id
 * @desc    Delete a resource by ID
 * @access  Public
 * @params  { id: number }
 */
router.delete('/:id', validateResourceId, ResourceController.deleteResource);

export default router;