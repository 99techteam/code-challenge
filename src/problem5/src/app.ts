import express from "express";
import swaggerUi from "swagger-ui-express";

import { swaggerSpec } from "./config/swagger.js";
import { resourceRouter } from "./routes/resource-routes.js";

export function createApp() {
  const app = express();
  app.use(express.json());
  app.get("/", (_request, response) => {
    response.json({
      message: "Welcome to Problem 5 CRUD API",
      documentation: "/api-docs",
      openApiSpec: "/openapi.json"
    });
  });
  app.get("/openapi.json", (_request, response) => {
    response.json(swaggerSpec);
  });
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customSiteTitle: "Problem 5 API Docs",
      customCss: ".swagger-ui .topbar { display: none }"
    })
  );
  app.use(resourceRouter);

  app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
    if (error instanceof Error) {
      response.status(400).json({
        success: false,
        error: {
          code: "BAD_REQUEST",
          message: error.message
        }
      });
      return;
    }

    response.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred."
      }
    });
  });

  return app;
}
