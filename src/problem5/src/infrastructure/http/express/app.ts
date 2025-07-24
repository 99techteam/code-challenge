import express from 'express';
import morgan from 'morgan';

import { errorHandler } from './middlewares/error.middleware';

import { productRouter } from '@/interfaces/http/routes/product.routes';
import { applySecurityMiddleware } from '@/infrastructure/http/express/middlewares/security.middleware';
import { SwaggerConfig } from '@/config/swagger.config';
import { redisCache } from '@/infrastructure/cache';

export async function createApp(): Promise<express.Application> {
  await redisCache.connectWithRetry();

  const app = express();

  SwaggerConfig.registerSchemas();
  SwaggerConfig.setup(app);

  applySecurityMiddleware(app);

  // JSON parsing
  app.use(express.json());

  // Logging
  app.use(morgan('dev'));

  // Public GET route for all roles with product:read scope
  // Note: Auth middlewares (authenticateJWT, authorizeRole, authorizeScope) are commented out for now to simplify development.
  // They will be re-enabled once authentication/authorization is implemented.
  app.get(
    '/api/v1/products',
    // authenticateJWT,
    // authorizeRole(["admin", "editor", "customer"]),
    // authorizeScope(["product:read"]),
    productRouter,
  );

  // Protected routes for admin/editor with read/write access
  // Note: Auth middlewares (authenticateJWT, authorizeRole, authorizeScope) are commented out for now to simplify development.
  // They will be re-enabled once authentication/authorization is implemented.
  app.use(
    '/api/v1/products',
    // authenticateJWT,
    // authorizeRole(["admin", "editor"]),
    // authorizeScope(["product:read", "product:write"]),
    productRouter,
  );

  // Global error handler
  app.use(errorHandler);

  return app;
}
