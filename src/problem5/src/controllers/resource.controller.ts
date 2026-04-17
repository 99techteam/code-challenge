import { Request, Response } from "express";
import { ResourceService } from "../services/resource.service";
import { HttpError } from "../utils/http-error";
import {
  validateCreateResourceInput,
  validateIncrementResourceInput,
  validateResourceId,
  validateUpdateResourceInput
} from "../validators/resource.validator";

export class ResourceController {
  public constructor(private readonly resourceService: ResourceService) {}

  public createResource = async (req: Request, res: Response): Promise<void> => {
    const input = validateCreateResourceInput(req.body);
    const resource = await this.resourceService.createResource(input);
    res.status(201).json(resource);
  };

  public listResources = async (req: Request, res: Response): Promise<void> => {
    const minQuantityRaw = req.query.minQuantity;
    let minQuantity: number | undefined;

    if (typeof minQuantityRaw === "string" && minQuantityRaw.length > 0) {
      minQuantity = Number(minQuantityRaw);
      if (!Number.isInteger(minQuantity)) {
        throw new HttpError(400, "Query parameter 'minQuantity' must be an integer");
      }
    }

    const resources = await this.resourceService.listResources({
      name: typeof req.query.name === "string" ? req.query.name : undefined,
      minQuantity
    });

    res.status(200).json(resources);
  };

  public getResource = async (req: Request, res: Response): Promise<void> => {
    const resourceId = validateResourceId(req.params.id);
    const resource = await this.resourceService.getResourceById(resourceId);
    res.status(200).json(resource);
  };

  public updateResource = async (req: Request, res: Response): Promise<void> => {
    const resourceId = validateResourceId(req.params.id);
    const input = validateUpdateResourceInput(req.body);
    const resource = await this.resourceService.updateResource(resourceId, input);
    res.status(200).json(resource);
  };

  public incrementResourceQuantity = async (req: Request, res: Response): Promise<void> => {
    const resourceId = validateResourceId(req.params.id);
    const input = validateIncrementResourceInput(req.body);
    const resource = await this.resourceService.incrementQuantityWithLock(resourceId, input);
    res.status(200).json(resource);
  };

  public deleteResource = async (req: Request, res: Response): Promise<void> => {
    const resourceId = validateResourceId(req.params.id);
    await this.resourceService.deleteResource(resourceId);
    res.status(200).json({ message: "Resource deleted successfully" });
  };
}
