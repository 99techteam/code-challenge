import { Router } from "express";
import { ResourceController } from "../controllers/resource.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validation.middleware";
import {
  createResourceSchema,
  updateResourceSchema,
} from "../validators/resource.validator";

export class ResourceRoutes {
  public router: Router;
  private resourceController: ResourceController;

  constructor() {
    this.router = Router();
    this.resourceController = new ResourceController();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.use(authenticate);

    this.router.post(
      "/",
      validate(createResourceSchema),
      this.resourceController.create
    );
    this.router.get("/", this.resourceController.findAll);
    this.router.get("/:id", this.resourceController.findById);
    this.router.put(
      "/:id",
      validate(updateResourceSchema),
      this.resourceController.update
    );
    this.router.delete("/:id", this.resourceController.delete);
  }
}
