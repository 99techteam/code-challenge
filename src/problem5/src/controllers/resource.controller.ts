import { Response, NextFunction } from "express";
import { ResourceService } from "../services/resource.service";
import { AuthRequest } from "../types";

export class ResourceController {
  private resourceService: ResourceService;

  constructor() {
    this.resourceService = new ResourceService();
  }

  create = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { name } = req.body;
      const resource = await this.resourceService.create(name);

      res.status(201).json({
        message: "Success",
        resource,
      });
    } catch (error) {
      next(error);
    }
  };

  findAll = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { name, limit = "10", offset = "0" } = req.query;

      const filters = {
        name: name as string,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      };

      const result = await this.resourceService.findAll(filters);

      res.status(200).json({
        message: "Success",
        ...result,
        pagination: {
          limit: filters.limit,
          offset: filters.offset,
          total: result.total,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  findById = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const resource = await this.resourceService.findById(id);

      if (!resource) {
        res.status(404).json({ error: "Resource not found" });
        return;
      }

      res.status(200).json({
        message: "Success",
        resource,
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { name } = req.body;

      const resource = await this.resourceService.update(id, name);

      if (!resource) {
        res.status(404).json({ error: "Resource not found" });
        return;
      }

      res.status(200).json({
        message: "Success",
        resource,
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const deleted = await this.resourceService.delete(id);

      if (!deleted) {
        res.status(404).json({ error: "Resource not found" });
        return;
      }

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
