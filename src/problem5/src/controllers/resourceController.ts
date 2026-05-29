import { Request, Response } from 'express';
import * as resourceRepository from '../repositories/resourceRepository';
import { Resource, CreateResourceRequest, UpdateResourceRequest, ResourceFilter, ApiResponse } from '../types';

// Create
export async function createResource(req: Request, res: Response): Promise<void> {
  try {
    const { name, description, category, status = 'active' } = req.body as CreateResourceRequest;

    if (!name || !name.trim()) {
      res.status(400).json({
        success: false,
        error: 'Name is required and cannot be empty',
      } as ApiResponse<null>);
      return;
    }
    const result = await resourceRepository.createResource(name.trim(), description || '', category || '', status);
   
    const resource = await resourceRepository.getResourceById(result.id);

    res.status(201).json({
      success: true,
      data: { data: resource },
      message: 'Resource created successfully',
    } as ApiResponse<Resource>);
  } catch (error) {
    console.error('Error creating resource:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    } as ApiResponse<null>);
  }
}

// List
export async function listResources(req: Request, res: Response): Promise<void> {
  try {
    const { query, params, limit, offset } = prepareQueryParam(req);
    const { data: resources, total } = await resourceRepository.listResources(query, params, limit, offset);

    res.json({
      success: true,
      data: {
        total,
        data: resources,
      },
      message: `Retrieved ${resources.length} resources`,
    } as ApiResponse<Resource[]>);
  } catch (error) {
    console.error('Error listing resources:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    } as ApiResponse<null>);
  }
}

// Get by ID
export async function getResource(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const numId = parseInt(id, 10);
    if (isNaN(numId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid resource ID',
      } as ApiResponse<null>);
      return;
    }

    const resource = await resourceRepository.getResourceById(numId);
    if (!resource) {
      res.status(404).json({
        success: false,
        error: 'Resource not found',
      } as ApiResponse<null>);
      return;
    }

    res.json({
      success: true,
      data: { data: resource },
      message: 'Resource retrieved successfully',
    } as ApiResponse<Resource>);
  } catch (error) {
    console.error('Error getting resource:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    } as ApiResponse<null>);
  }
}

// Update
export async function updateResource(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const updates = req.body as UpdateResourceRequest;
    const { numId, success, error, errorCode } = await validateResource(id);

    if (!success) {
      res.status(errorCode || 500).json({
        success: false,
        error: error || 'Internal server error',
      } as ApiResponse<null>);
      return;
    }

    // Dynamic update query
    const fields: string[] = [];
    const params: any[] = [];

    if (updates.name !== undefined) {
      if (!updates.name.trim()) {
        res.status(400).json({
          success: false,
          error: 'Name cannot be empty',
        } as ApiResponse<null>);
        return;
      }
      fields.push('name = ?');
      params.push(updates.name.trim());
    }

    if (updates.description !== undefined) {
      fields.push('description = ?');
      params.push(updates.description);
    }

    if (updates.category !== undefined) {
      fields.push('category = ?');
      params.push(updates.category);
    }

    if (updates.status !== undefined) {
      fields.push('status = ?');
      params.push(updates.status);
    }

    if (fields.length === 0) {
      res.status(400).json({
        success: false,
        error: 'No fields to update',
      } as ApiResponse<null>);
      return;
    }

    fields.push('updatedAt = CURRENT_TIMESTAMP');

    await resourceRepository.updateResource(numId, { fields, params });

    const updated_resource = await resourceRepository.getResourceById(numId);

    res.json({
      success: true,
      data: { data: updated_resource },
      message: 'Resource updated successfully',
    } as ApiResponse<Resource>);
  } catch (error) {
    console.error('Error updating resource:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    } as ApiResponse<null>);
  }
}

// Delete
export async function deleteResource(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { numId, success, error, errorCode } = await validateResource(id);
    if (!success) {
      res.status(errorCode || 500).json({
        success: false,
        error: error || 'Internal server error',
      } as ApiResponse<null>);
      return;
    }

    await resourceRepository.deleteResource(numId);

    res.json({
      success: true,
      message: 'Resource deleted successfully',
    } as ApiResponse<null>);
  } catch (error) {
    console.error('Error deleting resource:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    } as ApiResponse<null>);
  }
}

// Prepare query parameters
function prepareQueryParam(req: Request) {
  const { category, status, search, limit = 10, offset = 0 } = req.query as ResourceFilter;

  let query = 'SELECT * FROM resources WHERE 1=1';
  const params: any[] = [];

  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }

  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }

  if (search) {
    query += ' AND (name LIKE ? OR description LIKE ?)';
    const search_term = `%${search}%`;
    params.push(search_term, search_term);
  }

  return { query, params, limit, offset };
}

// Validate resource existence
async function validateResource(id: string): Promise<{ numId: number; success: boolean; error?: string, errorCode?: number }> {
  const numId = parseInt(id, 10);
    if (isNaN(numId)) {
      return { numId: NaN, success: false, error: 'Invalid resource ID', errorCode: 400 };
    }

    const existing = await resourceRepository.getResourceById(numId);
    if (!existing) {
      return { numId, success: false, error: 'Resource not found', errorCode: 404 };
    }

    return { numId, success: true };
}