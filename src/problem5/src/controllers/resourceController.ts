import { Request, Response, NextFunction } from 'express';
import { ResourceModel } from '../models/resourceModel';
import { ResourceFilters } from '../types/resource';
import logger from '../config/logger';

export class ResourceController {
  // Create a new resource
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      logger.info('Creating new resource', { body: req.body });
      const resource = await ResourceModel.create(req.body);
      logger.info(`Resource created successfully with ID: ${resource.id}`);

      res.status(201).json({
        success: true,
        data: resource
      });
    } catch (error) {
      logger.error(`Error creating resource: ${error}`);
      next(error);
    }
  }

  // List all resources with filters
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      // req.query is already validated and transformed by Zod middleware
      const filters = req.query as ResourceFilters;
      logger.debug('Listing resources with filters', { filters });

      const [resources, total] = await Promise.all([
        ResourceModel.findAll(filters),
        ResourceModel.count(filters)
      ]);

      logger.info(`Retrieved ${resources.length} resources (total: ${total})`);

      res.status(200).json({
        success: true,
        data: resources,
        pagination: {
          total,
          limit: filters.limit || total,
          offset: filters.offset || 0
        }
      });
    } catch (error) {
      logger.error(`Error listing resources: ${error}`);
      next(error);
    }
  }

  // Get a single resource by ID
  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      // req.params.id is already validated and converted to number by Zod middleware
      const id = req.params.id as unknown as number;
      logger.debug(`Fetching resource with ID: ${id}`);

      const resource = await ResourceModel.findById(id);
      logger.info(`Resource found with ID: ${id}`);

      res.status(200).json({
        success: true,
        data: resource
      });
    } catch (error) {
      logger.error(`Error fetching resource: ${error}`);
      next(error);
    }
  }

  // Update a resource
  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      // req.params.id is already validated and converted to number by Zod middleware
      const id = req.params.id as unknown as number;
      logger.info(`Updating resource with ID: ${id}`, { updates: req.body });

      const resource = await ResourceModel.update(id, req.body);
      logger.info(`Resource updated successfully with ID: ${id}`);

      res.status(200).json({
        success: true,
        data: resource
      });
    } catch (error) {
      logger.error(`Error updating resource: ${error}`);
      next(error);
    }
  }

  // Delete a resource
  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      // req.params.id is already validated and converted to number by Zod middleware
      const id = req.params.id as unknown as number;
      logger.info(`Deleting resource with ID: ${id}`);

      await ResourceModel.delete(id);
      logger.info(`Resource deleted successfully with ID: ${id}`);

      res.status(200).json({
        success: true,
        message: 'Resource deleted successfully'
      });
    } catch (error) {
      logger.error(`Error deleting resource: ${error}`);
      next(error);
    }
  }
}
