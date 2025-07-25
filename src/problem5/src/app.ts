import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import { AuthRoutes } from "./routes/auth.routes";
import { ResourceRoutes } from "./routes/resource.routes";
import { errorHandler } from "./middlewares/error.middleware";

export class App {
  public app: Application;
  private authRoutes: AuthRoutes;
  private resourceRoutes: ResourceRoutes;

  constructor() {
    this.app = express();
    this.authRoutes = new AuthRoutes();
    this.resourceRoutes = new ResourceRoutes();

    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(express.json({ limit: "10mb" }));
    this.app.use(express.urlencoded({ extended: true }));
  }

  private initializeRoutes(): void {
    this.app.get("/health", (req, res) => {
      res.json({ status: "OK", timestamp: new Date().toISOString() });
    });

    this.app.use("/api/auth", this.authRoutes.router);
    this.app.use("/api/resources", this.resourceRoutes.router);
  }

  private initializeErrorHandling(): void {
    this.app.use(errorHandler);
  }
}
