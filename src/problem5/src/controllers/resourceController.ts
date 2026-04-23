import type { Request, Response, NextFunction } from "express";
import { HttpError } from "../errors/httpError.js";
import {
  createResource as createResourceRecord,
  deleteResource as deleteResourceRecord,
  getResourceById,
  listResources,
  updateResource as updateResourceRecord
} from "../repositories/resourceRepository.js";
import {
  validateCreateResource,
  validateListResourcesQuery,
  validateUpdateResource
} from "../validators/resourceSchemas.js";

function parseId(rawId: string): number {
  const resourceId = Number(rawId);

  if (!Number.isInteger(resourceId) || resourceId <= 0) {
    throw new HttpError(400, "Resource id must be a positive integer");
  }

  return resourceId;
}

function getRouteParam(rawValue: string | string[] | undefined): string {
  if (typeof rawValue === "string") {
    return rawValue;
  }

  throw new HttpError(400, "Resource id must be provided");
}

export async function createResource(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = validateCreateResource(req.body);
    const resource = await createResourceRecord(input);
    res.status(201).json({ data: resource });
  } catch (error) {
    next(error);
  }
}

export async function listAllResources(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = validateListResourcesQuery(req.query);
    const resources = await listResources(query);
    res.json({ data: resources });
  } catch (error) {
    next(error);
  }
}

export async function getResource(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const resourceId = parseId(getRouteParam(req.params.id));
    const resource = await getResourceById(resourceId);

    if (!resource) {
      throw new HttpError(404, "Resource not found");
    }

    res.json({ data: resource });
  } catch (error) {
    next(error);
  }
}

export async function updateResource(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const resourceId = parseId(getRouteParam(req.params.id));
    const input = validateUpdateResource(req.body);
    const resource = await updateResourceRecord(resourceId, input);

    if (!resource) {
      throw new HttpError(404, "Resource not found");
    }

    res.json({ data: resource });
  } catch (error) {
    next(error);
  }
}

export async function deleteResource(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const resourceId = parseId(getRouteParam(req.params.id));
    const deleted = await deleteResourceRecord(resourceId);

    if (!deleted) {
      throw new HttpError(404, "Resource not found");
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
