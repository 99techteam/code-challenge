import { Request, Response } from "express";
import { z } from "zod";
import { ResourceUseCases } from "./resource.usecases";

const CreateDto = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

const UpdateDto = CreateDto.partial();

export class ResourceController {
    constructor(private useCases: ResourceUseCases) {}
  
    create = async (req: Request, res: Response) => {
      const data = CreateDto.parse(req.body);
      res.status(201).json(await this.useCases.create(data));
    };
  
    list = async (req: Request, res: Response) => {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const name = typeof req.query.name === "string" ? req.query.name : undefined;
  
      res.json(
        await this.useCases.list({
          page,
          limit,
          ...(name !== undefined && { name }),
        })
      );
    };
  
    get = async (req: Request, res: Response) => {
      const id = typeof req.params.id === "string" ? req.params.id : undefined;
      if (!id) return res.sendStatus(400);
      const resource = await this.useCases.get(id);
      if (!resource) return res.sendStatus(404);
      res.json(resource);
    };
  
    update = async (req: Request, res: Response) => {
      const id = typeof req.params.id === "string" ? req.params.id : undefined;
      if (!id) return res.sendStatus(400);
      const data = UpdateDto.parse(req.body);
      const resource = await this.useCases.update(id, data);
      if (!resource) return res.sendStatus(404);
      res.json(resource);
    };
  
    delete = async (req: Request, res: Response) => {
      const id = typeof req.params.id === "string" ? req.params.id : undefined;
      if (!id) return res.sendStatus(400);
      await this.useCases.delete(id);
      res.status(204).json({ message: "Resource deleted successfully" });
    };
  }
  
