import express, { type Request, type RequestHandler, type Response } from "express";
import { HttpError, errorHandler } from "./errors";
import { JsonResourceDatabase } from "./json-resource-database";
import { type ResourceRepository } from "./types";
import {
  parseCreateResourceInput,
  parseResourceFilters,
  parseUpdateResourceInput,
  readRouteId,
} from "./validation";

/**
 * @description Creates the Express application and registers all Problem 5 routes.
 * @param repository - Resource persistence implementation used by route handlers.
 * @returns Configured Express application instance.
 */
export function createApp(
  repository: ResourceRepository = new JsonResourceDatabase(),
): express.Express {
  const app = express();

  app.use(express.json());

  app.get("/", renderHomePage);
  app.get("/health", healthCheck);

  app.get(
    "/resources",
    asyncRoute(async (request, response) => {
      const resources = await repository.list(parseResourceFilters(request));

      response.json({ data: resources, count: resources.length });
    }),
  );

  app.post(
    "/resources",
    asyncRoute(async (request, response) => {
      const resource = await repository.create(parseCreateResourceInput(request.body));

      response.status(201).json({ data: resource });
    }),
  );

  app.get(
    "/resources/:id",
    asyncRoute(async (request, response) => {
      const resource = await repository.findById(readRouteId(request));

      if (!resource) {
        throw new HttpError(404, "Resource not found");
      }

      response.json({ data: resource });
    }),
  );

  app.patch(
    "/resources/:id",
    asyncRoute(async (request, response) => {
      const resource = await repository.update(
        readRouteId(request),
        parseUpdateResourceInput(request.body),
      );

      if (!resource) {
        throw new HttpError(404, "Resource not found");
      }

      response.json({ data: resource });
    }),
  );

  app.delete(
    "/resources/:id",
    asyncRoute(async (request, response) => {
      const deleted = await repository.delete(readRouteId(request));

      if (!deleted) {
        throw new HttpError(404, "Resource not found");
      }

      response.status(204).send();
    }),
  );

  app.use(errorHandler);

  return app;
}

/**
 * @description Renders a simple browser-friendly API home page.
 * @param _request - Incoming Express request.
 * @param response - Express response used to send HTML.
 */
function renderHomePage(_request: Request, response: Response): void {
  response.type("html").send(`
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Problem 5 API</title>
      </head>
      <body>
        <main style="font-family: Arial, sans-serif; line-height: 1.5; margin: 40px;">
          <h1>Problem 5 API is running</h1>
          <p>Use the resources API to create, list, view, update, and delete resources.</p>
          <ul>
            <li><a href="/health">GET /health</a></li>
            <li><a href="/resources">GET /resources</a></li>
          </ul>
        </main>
      </body>
    </html>
  `);
}

/**
 * @description Returns a health-check response for uptime checks.
 * @param _request - Incoming Express request.
 * @param response - Express response used to send JSON.
 */
function healthCheck(_request: Request, response: Response): void {
  response.json({ ok: true });
}

/**
 * @description Wraps async route handlers and forwards errors to Express.
 * @param handler - Async route handler to execute.
 * @returns Express-compatible request handler.
 */
function asyncRoute(
  handler: (request: Request, response: Response) => Promise<void>,
): RequestHandler {
  return (request, response, next) => {
    handler(request, response).catch(next);
  };
}
