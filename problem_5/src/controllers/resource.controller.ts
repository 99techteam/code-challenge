import { NextFunction, Request, Response } from 'express';
import {
  BatchDeleteResourceDto,
  BatchUpdateResourceDto,
  CreateResourceDto,
  ListResourcesQueryDto,
  UpdateResourceDto,
  toResourceResponseDto
} from '../dto/resource.dto';
import { HttpException, InternalServerException } from '../exceptions/http.exception';
import { ResourceService } from '../services/resource.service';

export class ResourceController {
  constructor(private readonly service: ResourceService = new ResourceService()) {}

  create = async (req: Request<{}, {}, CreateResourceDto>, res: Response, next: NextFunction) => {
    try {
      const created = await this.service.create(req.body);
      return res.status(201).json(toResourceResponseDto(created));
    } catch (error) {
      return next(this.normalizeError(error, 'failed to create resource'));
    }
  };

  list = async (req: Request<{}, {}, {}, ListResourcesQueryDto>, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.list(req.query);
      return res.json({ data: result.data.map(toResourceResponseDto), count: result.count });
    } catch (error) {
      return next(this.normalizeError(error, 'failed to list resources'));
    }
  };

  getById = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const item = await this.service.getById(req.params.id);
      return res.json(toResourceResponseDto(item));
    } catch (error) {
      return next(this.normalizeError(error, 'failed to fetch resource'));
    }
  };

  updateById = async (req: Request<{ id: string }, {}, UpdateResourceDto>, res: Response, next: NextFunction) => {
    try {
      const updated = await this.service.updateById(req.params.id, req.body);
      return res.json(toResourceResponseDto(updated));
    } catch (error) {
      return next(this.normalizeError(error, 'failed to update resource'));
    }
  };

  deleteById = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const hard = req.query.hard === 'true';
      if (hard) {
        await this.service.hardDeleteById?.(req.params.id);
      } else {
        await this.service.deleteById(req.params.id);
      }
      return res.status(204).send();
    } catch (error) {
      return next(this.normalizeError(error, 'failed to delete resource'));
    }
  };

  batchUpdate = async (req: Request<{}, {}, BatchUpdateResourceDto>, res: Response, next: NextFunction) => {
    try {
      const updated = await this.service.batchUpdate(req.body);
      return res.json({ updated: updated.length, data: updated.map(toResourceResponseDto) });
    } catch (error) {
      return next(this.normalizeError(error, 'failed to batch update resources'));
    }
  };

  batchDelete = async (req: Request<{}, {}, BatchDeleteResourceDto>, res: Response, next: NextFunction) => {
    try {
      const hard = (req.body as any).hard === true;
      const deletedIds = hard ? await this.service.hardBatchDelete(req.body.ids) : await this.service.batchDelete(req.body.ids);
      return res.json({ deleted: deletedIds.length, ids: deletedIds });
    } catch (error) {
      return next(this.normalizeError(error, 'failed to batch delete resources'));
    }
  };

  private normalizeError(error: unknown, fallbackMessage: string): HttpException {
    if (error instanceof HttpException) {
      return error;
    }
    return new InternalServerException(fallbackMessage, String(error));
  }
}
