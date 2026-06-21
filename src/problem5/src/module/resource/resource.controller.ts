import type { NextFunction, Request, Response } from "express";
import { ResourceRepository } from "./resource.repository.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";

const repository = new ResourceRepository();

export const getResources = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const {name, description} = req.query;
    
    const filters = {
      name: typeof name === "string" ? name : undefined,
      description: typeof description === "string" ? description : undefined
    }

    const resources = await repository.findAll(filters);
    res.success(resources);
});

export const createResource = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { name, description } = req.body;
    const newResource = await repository.create({ name, description });  
    res.success(newResource);
});

export const getResourceById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const resource = await repository.findById(Number(req.params.id));
    if (!resource) return res.error("Resource not found", 404);
    res.success(resource);
});

export const updateResource = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const updated = await repository.update(Number(req.params.id), req.body);
    res.success(updated);
});

export const deleteResource = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await repository.delete(Number(req.params.id));
    res.success({ message: "Deleted successfully" });
});