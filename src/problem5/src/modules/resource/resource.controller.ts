import { Request, Response, NextFunction } from 'express';
import { ResourceService } from './resource.service';
import { HttpStatus } from '../../common/constants/httpStatus';
import { CreateResourceDto, UpdateResourceDto, ResourceFilters } from './resource.dto';

export const ResourceController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ResourceService.getAll(req.query as unknown as ResourceFilters);
      res.status(HttpStatus.OK).json(result);
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const resource = await ResourceService.getById(Number(req.params.id));
      res.status(HttpStatus.OK).json(resource);
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const resource = await ResourceService.create(req.body as CreateResourceDto);
      res.status(HttpStatus.CREATED).json(resource);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const resource = await ResourceService.update(
        Number(req.params.id),
        req.body as UpdateResourceDto
      );
      res.status(HttpStatus.OK).json(resource);
    } catch (err) {
      next(err);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await ResourceService.delete(Number(req.params.id));
      res.status(HttpStatus.NO_CONTENT).send();
    } catch (err) {
      next(err);
    }
  },
};
