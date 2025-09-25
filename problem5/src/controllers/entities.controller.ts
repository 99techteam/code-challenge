import { Request, Response } from 'express';
import { EntityService } from '../services/entity.service';
import logger from '../utils/logger';
import { BadRequestException } from '../exceptions/bad-request';

export const list = async (req: Request, res: Response) => {
  try {
    const { search, sort, page, pageSize } = req.query;
    
    const result = await EntityService.list({
      search: search as string,
      sort: sort as string,
      page: page ? parseInt(page as string) : undefined,
      pageSize: pageSize ? parseInt(pageSize as string) : undefined,
    });
    
    res.jsonSuccess(result);
  } catch (error) {
    logger.error('Error listing entities:', error);
    res.jsonError('Internal server error', 500);
  }
};

export const get = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      throw new BadRequestException('Entity ID is required', 400);
    }
    
    const entity = await EntityService.get(id);
    
    if (!entity) {
      throw new BadRequestException('Entity not found', 400);
    }
    
    res.jsonSuccess(entity);
  } catch (error) {
    logger.error('Error getting entity:', error);
    res.jsonError('Internal server error', 500);
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const entityData = req.body;
    
    if (!entityData.name) {
      throw new BadRequestException('Entity name is required', 400);
    }
    
    const entity = await EntityService.createOrUpdate(entityData);
    res.jsonSuccess(entity, '', 201);
  } catch (error) {
    logger.error('Error creating entity:', error);
    res.jsonError('Internal server error', 500);
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const entityData = req.body;
    
    if (!id) {
      throw new BadRequestException('Entity ID is required', 400);
    }
    
    // Check if entity exists
    const existingEntity = await EntityService.get(id);
    if (!existingEntity) {
       throw new BadRequestException('Entity not found', 400);
    }
    
    const entity = await EntityService.createOrUpdate({ ...entityData, id });
    res.jsonSuccess(entity);
  } catch (error) {
    logger.error('Error updating entity:', error);
    res.jsonError('Internal server error', 500);
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      throw new BadRequestException('Entity ID is required', 400);
    }
    
    const deleted = await EntityService.delete(id);
    
    if (!deleted) {
      throw new BadRequestException('Entity not found', 404);
    }
    
    res.jsonSuccess({ message: 'Entity deleted successfully' });
  } catch (error) {
    logger.error('Error deleting entity:', error);
    res.jsonError('Internal server error', 500);
  }
};
