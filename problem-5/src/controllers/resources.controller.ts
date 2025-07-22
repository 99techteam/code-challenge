import { Request, Response } from "express";
import { resourceService } from "../services/resource.service";

class ResourceController {
  async create(req: Request, res: Response) {
    const resource = await resourceService.create(req.body);
    res.status(201).json(resource);
  }

  async getById(req: Request, res: Response) {
    const resource = await resourceService.getById(req.params.id);
    if (!resource)
      return res.status(404).json({ message: "Resource not found" });
    res.json(resource);
  }

  async getAll(req: Request, res: Response) {
    const filter = { name: req.query.name as string };
    const resources = await resourceService.getAll(filter.name ? filter : {});
    res.json(resources);
  }

  async updateById(req: Request, res: Response) {
    const resource = await resourceService.updateById(req.params.id, req.body);
    if (!resource)
      return res.status(404).json({ message: "Resource not found" });
    res.json(resource);
  }

  async deleteById(req: Request, res: Response) {
    const resource = await resourceService.deleteById(req.params.id);
    if (!resource)
      return res.status(404).json({ message: "Resource not found" });
    res.status(204).send();
  }
}

export const resourceController = new ResourceController();
