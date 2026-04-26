import express from "express";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import "dotenv/config";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
// middleware
import { errorHandler } from "@/middleware";
// routes
import {gameRoutes} from "@/routes";

const app = express();

app.use(helmet());

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
);

app.use(express.json());

const swaggerDocument = YAML.load(
  path.join(__dirname, "./docs/openapi.yaml")
);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/games", gameRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

app.use(errorHandler);

export default app;