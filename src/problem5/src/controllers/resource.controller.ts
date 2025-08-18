import { Request, Response } from 'express';
import { ResourceService } from '../services/resource.service';
import {
  CreateResourceRequest,
  UpdateResourceRequest,
  ResourceQueryParams,
} from '../types';
import { asyncHandler } from '../middleware/error.handler';
import { created, ok, paginated, updated, deleted } from '../utils/response';

export class ResourceController {
  constructor(private resourceService: ResourceService) {}

  createResource = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const data: CreateResourceRequest = req.body;
      const resource = await this.resourceService.createResource(data);

      created(res, resource);
    }
  );

  getResources = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const params: ResourceQueryParams = req.query as ResourceQueryParams;
      const result = await this.resourceService.getResources(params);

      paginated(res, result);
    }
  );

  getResourceById = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const id = parseInt(req.params['id']!, 10);
      const resource = await this.resourceService.getResourceById(id);

      ok(res, resource);
    }
  );

  updateResource = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const id = parseInt(req.params['id']!, 10);
      const data: UpdateResourceRequest = req.body;
      const resource = await this.resourceService.updateResource(id, data);

      updated(res, resource);
    }
  );

  deleteResource = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const id = parseInt(req.params['id']!, 10);
      await this.resourceService.deleteResource(id);

      deleted(res);
    }
  );
}
