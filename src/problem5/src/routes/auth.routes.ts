import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { validate } from "../middlewares/validation.middleware";
import { registerSchema, loginSchema } from "../validators/auth.validator";

export class AuthRoutes {
  public router: Router;
  private authController: AuthController;

  constructor() {
    this.router = Router();
    this.authController = new AuthController();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post(
      "/register",
      validate(registerSchema),
      this.authController.register
    );
    this.router.post(
      "/login",
      validate(loginSchema),
      this.authController.login
    );
  }
}
