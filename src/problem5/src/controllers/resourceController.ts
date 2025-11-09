import { Request, Response } from 'express';
import { ResourceService } from '../services/resourceService';
import { ApiResponse, Resource, ResourceFilters } from '../types';

const resourceService = new ResourceService();

/**
 * Create a new resource
 * POST /api/resources
 */
export const createResource = (req: Request, res: Response) => {
  try {
    const { name, description, category, status } = req.body;

    // Validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Name is required and must be a non-empty string'
      } as ApiResponse<null>);
    }

    const resource: Resource = {
      name: name.trim(),
      description: description?.trim(),
      category: category?.trim(),
      status: status || 'active'
    };

    const created = resourceService.create(resource);

    res.status(201).json({
      success: true,
      data: created,
      message: 'Resource created successfully'
    } as ApiResponse<Resource>);
  } catch (error) {
    console.error('Error creating resource:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse<null>);
  }
};

/**
 * List resources with filters
 * GET /api/resources
 */
export const listResources = (req: Request, res: Response) => {
  try {
    const filters: ResourceFilters = {
      category: req.query.category as string,
      status: req.query.status as string,
      search: req.query.search as string,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset as string) : undefined
    };

    const resources = resourceService.list(filters);
    const total = resourceService.count(filters);

    res.json({
      success: true,
      data: {
        resources,
        total,
        limit: filters.limit,
        offset: filters.offset || 0
      }
    });
  } catch (error) {
    console.error('Error listing resources:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse<null>);
  }
};

/**
 * Get a single resource by ID
 * GET /api/resources/:id
 */
export const getResource = (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid resource ID'
      } as ApiResponse<null>);
    }

    const resource = resourceService.getById(id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        error: 'Resource not found'
      } as ApiResponse<null>);
    }

    res.json({
      success: true,
      data: resource
    } as ApiResponse<Resource>);
  } catch (error) {
    console.error('Error getting resource:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse<null>);
  }
};

/**
 * Update a resource
 * PUT /api/resources/:id
 */
export const updateResource = (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid resource ID'
      } as ApiResponse<null>);
    }

    const { name, description, category, status } = req.body;

    // Validate at least one field is provided
    if (!name && !description && !category && !status) {
      return res.status(400).json({
        success: false,
        error: 'At least one field must be provided for update'
      } as ApiResponse<null>);
    }

    const updates: Partial<Resource> = {};
    if (name !== undefined) updates.name = name.trim();
    if (description !== undefined) updates.description = description.trim();
    if (category !== undefined) updates.category = category.trim();
    if (status !== undefined) updates.status = status;

    const updated = resourceService.update(id, updates);

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'Resource not found'
      } as ApiResponse<null>);
    }

    res.json({
      success: true,
      data: updated,
      message: 'Resource updated successfully'
    } as ApiResponse<Resource>);
  } catch (error) {
    console.error('Error updating resource:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse<null>);
  }
};

/**
 * Delete a resource
 * DELETE /api/resources/:id
 */
export const deleteResource = (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid resource ID'
      } as ApiResponse<null>);
    }

    const deleted = resourceService.delete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Resource not found'
      } as ApiResponse<null>);
    }

    res.json({
      success: true,
      message: 'Resource deleted successfully'
    } as ApiResponse<null>);
  } catch (error) {
    console.error('Error deleting resource:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse<null>);
  }
};

