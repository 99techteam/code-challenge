import { Request, Response, NextFunction } from 'express';
import { getDatabase } from '../config/database';
import {
  Resource,
  CreateResourceRequest,
  UpdateResourceRequest,
  ResourceFilters,
  PaginatedResources
} from '../models/Resource';
import { NotFoundError, DatabaseError } from '../middleware/errorHandler';

export class ResourceController {
  
  /**
   * Create a new resource
   */
  public static async createResource(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { name, description, category, status = 'active' }: CreateResourceRequest = req.body;
      const db = getDatabase();

      const sql = `
        INSERT INTO resources (name, description, category, status)
        VALUES (?, ?, ?, ?)
      `;

      const result = await db.run(sql, [name, description || null, category || null, status]);

      if (!result.lastID) {
        throw new DatabaseError('Failed to create resource');
      }

      // Fetch the created resource
      const createdResource = await db.get('SELECT * FROM resources WHERE id = ?', [result.lastID]);

      res.status(201).json({
        success: true,
        message: 'Resource created successfully',
        data: createdResource
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all resources with optional filtering and pagination
   */
  public static async getResources(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const {
        category,
        status,
        search,
        limit = 10,
        offset = 0,
        sortBy = 'id',
        sortOrder = 'ASC'
      } = req.query as any;

      const db = getDatabase();

      // Build WHERE clause
      const whereConditions: string[] = [];
      const params: any[] = [];

      if (category) {
        whereConditions.push('category = ?');
        params.push(category);
      }

      if (status) {
        whereConditions.push('status = ?');
        params.push(status);
      }

      if (search) {
        whereConditions.push('(name LIKE ? OR description LIKE ?)');
        params.push(`%${search}%`, `%${search}%`);
      }

      const whereClause = whereConditions.length > 0 
        ? `WHERE ${whereConditions.join(' AND ')}` 
        : '';

      // Get total count
      const countSql = `SELECT COUNT(*) as total FROM resources ${whereClause}`;
      const countResult = await db.get(countSql, params);
      const total = countResult.total;

      // Get paginated results
      const sql = `
        SELECT * FROM resources 
        ${whereClause}
        ORDER BY ${sortBy} ${sortOrder}
        LIMIT ? OFFSET ?
      `;

      const resources = await db.all(sql, [...params, Number(limit), Number(offset)]);

      const response: PaginatedResources = {
        data: resources,
        total,
        limit: Number(limit),
        offset: Number(offset),
        hasNext: Number(offset) + Number(limit) < total,
        hasPrev: Number(offset) > 0
      };

      res.json({
        success: true,
        message: 'Resources retrieved successfully',
        ...response
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a single resource by ID
   */
  public static async getResourceById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const db = getDatabase();

      const resource = await db.get('SELECT * FROM resources WHERE id = ?', [id]);

      if (!resource) {
        throw new NotFoundError(`Resource with ID ${id} not found`);
      }

      res.json({
        success: true,
        message: 'Resource retrieved successfully',
        data: resource
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update a resource by ID
   */
  public static async updateResource(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const updates: UpdateResourceRequest = req.body;
      const db = getDatabase();

      // Check if resource exists
      const existingResource = await db.get('SELECT * FROM resources WHERE id = ?', [id]);
      if (!existingResource) {
        throw new NotFoundError(`Resource with ID ${id} not found`);
      }

      // Build UPDATE query dynamically
      const updateFields: string[] = [];
      const params: any[] = [];

      Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined) {
          updateFields.push(`${key} = ?`);
          params.push(value);
        }
      });

      if (updateFields.length === 0) {
        res.json({
          success: true,
          message: 'No changes to update',
          data: existingResource
        });
        return;
      }

      params.push(id); // for WHERE clause

      const sql = `
        UPDATE resources 
        SET ${updateFields.join(', ')} 
        WHERE id = ?
      `;

      await db.run(sql, params);

      // Fetch updated resource
      const updatedResource = await db.get('SELECT * FROM resources WHERE id = ?', [id]);

      res.json({
        success: true,
        message: 'Resource updated successfully',
        data: updatedResource
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a resource by ID
   */
  public static async deleteResource(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const db = getDatabase();

      // Check if resource exists
      const existingResource = await db.get('SELECT * FROM resources WHERE id = ?', [id]);
      if (!existingResource) {
        throw new NotFoundError(`Resource with ID ${id} not found`);
      }

      // Delete the resource
      const result = await db.run('DELETE FROM resources WHERE id = ?', [id]);

      if (result.changes === 0) {
        throw new DatabaseError('Failed to delete resource');
      }

      res.json({
        success: true,
        message: 'Resource deleted successfully',
        data: existingResource
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get resource statistics
   */
  public static async getResourceStats(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const db = getDatabase();

      const totalQuery = 'SELECT COUNT(*) as total FROM resources';
      const activeQuery = 'SELECT COUNT(*) as active FROM resources WHERE status = ?';
      const inactiveQuery = 'SELECT COUNT(*) as inactive FROM resources WHERE status = ?';
      const archivedQuery = 'SELECT COUNT(*) as archived FROM resources WHERE status = ?';
      const categoriesQuery = 'SELECT category, COUNT(*) as count FROM resources WHERE category IS NOT NULL GROUP BY category';

      const [total, active, inactive, archived, categories] = await Promise.all([
        db.get(totalQuery),
        db.get(activeQuery, ['active']),
        db.get(inactiveQuery, ['inactive']),
        db.get(archivedQuery, ['archived']),
        db.all(categoriesQuery)
      ]);

      // Convert categories array to object
      const categoriesObj: { [key: string]: number } = {};
      categories.forEach((cat: any) => {
        if (cat.category) {
          categoriesObj[cat.category] = cat.count;
        }
      });

      res.json({
        success: true,
        message: 'Resource statistics retrieved successfully',
        data: {
          total: total.total,
          byStatus: {
            active: active.active,
            inactive: inactive.inactive,
            archived: archived.archived
          },
          byCategory: categoriesObj
        }
      });
    } catch (error) {
      next(error);
    }
  }
}