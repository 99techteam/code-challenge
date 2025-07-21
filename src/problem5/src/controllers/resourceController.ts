import { Request, Response } from 'express';
import { CreateResourceDto, UpdateResourceDto, QueryResourceDto } from '../dto';
import { 
  Resource,
  ResourceListResponse,
  ResourceResponse,
  ResourceDeleteResponse 
} from '../types';
import { NotFoundError, CQRSError } from '../utils/errors';
import { mediator } from '../cqrs';
import { 
  CreateResourceCommand, 
  UpdateResourceCommand, 
  DeleteResourceCommand,
  GetAllResourcesQuery,
  GetResourceByIdQuery,
  GetCategoriesQuery,
  GetAllResourcesResult
} from '../cqrs';

export class ResourceController {

  // Create a new resource
  create = async (req: Request, res: Response): Promise<void> => {
    const data: CreateResourceDto = req.body;
    
    const command = new CreateResourceCommand(data);
    const resource = await mediator.send<Resource>(command);
    
    if (!resource) {
      throw new CQRSError('Failed to create resource', 'CreateResourceCommand');
    }
    
    const response: ResourceResponse = {
      success: true,
      data: resource,
      message: 'Resource created successfully'
    };
    
    res.status(201).json(response);
  };

  // Get all resources with optional filtering
  getAll = async (req: Request, res: Response): Promise<void> => {
    const queryDto: QueryResourceDto = req.query as any;
    
    const query = new GetAllResourcesQuery(queryDto);
    const result: GetAllResourcesResult = await mediator.query(query);
    
    const response: ResourceListResponse = {
      success: true,
      data: {
        data: result.resources,
        total: result.total,
        limit: queryDto.limit || result.total,
        offset: queryDto.offset || 0
      }
    };
    
    res.json(response);
  };

  // Get a single resource by ID
  getById = async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id); // Already validated by middleware
    
    const query = new GetResourceByIdQuery(id);
    const resource = await mediator.query<Resource | null>(query);

    if (!resource) {
      throw new NotFoundError('Resource not found', 'resource', id);
    }

    const response: ResourceResponse = {
      success: true,
      data: resource
    };

    res.json(response);
  };

  // Update a resource
  update = async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id);
    const data: UpdateResourceDto = req.body;
    
    const command = new UpdateResourceCommand(id, data);
    const resource = await mediator.send<Resource | null>(command);
    
    if (!resource) {
      throw new NotFoundError('Resource not found', 'resource', id);
    }
    
    const response: ResourceResponse = {
      success: true,
      data: resource,
      message: 'Resource updated successfully'
    };
    
    res.json(response);
  };

  // Delete a resource
  delete = async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id); // Already validated by middleware
    
    const command = new DeleteResourceCommand(id);
    const deleted = await mediator.send(command);
    
    if (!deleted) {
      throw new NotFoundError('Resource not found', 'resource', id);
    }
    
    const response: ResourceDeleteResponse = {
      success: true,
      data: { deleted: true },
      message: 'Resource deleted successfully'
    };
    
    res.json(response);
  };

  // Get all available categories
  getCategories = async (req: Request, res: Response): Promise<void> => {
    const query = new GetCategoriesQuery();
    const categories = await mediator.query(query);
    
    res.json({
      success: true,
      data: categories
    });
  };
} 