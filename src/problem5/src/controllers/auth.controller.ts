import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  register = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { email, password } = req.body;
      const user = await this.authService.register(email, password);

      res.status(201).json({
        message: "Success",
        user,
      });
    } catch (error: any) {
      error.statusCode = 400;
      next(error);
    }
  };

  login = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { email, password } = req.body;
      const result = await this.authService.login(email, password);

      res.status(200).json({
        message: "Success",
        ...result,
      });
    } catch (error: any) {
      error.statusCode = 401;
      next(error);
    }
  };
}
