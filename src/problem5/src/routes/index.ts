import { Router } from 'express';
import { createResourceRoutes } from './resource.routes';
import { ResourceController } from '../controllers/resource.controller';
import { ResourceService } from '../services/resource.service';
import { ok } from '../utils/response';

export const createRoutes = (): Router => {
  const router = Router();

  // Health check endpoint
  router.get('/health', (_req, res) => {
    ok(res, {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env['npm_package_version'] || '1.0.0',
    });
  });

  // API info endpoint
  router.get('/', (_req, res) => {
    ok(res, {
      name: 'Problem 5 Express API',
      version: '1.0.0',
      description: 'Modern ExpressJS v5 CRUD API with PostgreSQL',
      endpoints: {
        'GET /api/health': 'Health check',
        'POST /api/resources': 'Create a new resource',
        'GET /api/resources': 'List all resources with optional filters',
        'GET /api/resources/:id': 'Get a specific resource by ID',
        'PUT /api/resources/:id': 'Update an existing resource',
        'DELETE /api/resources/:id': 'Delete a resource',
      },
    });
  });

  // Initialize services and controllers
  const resourceService = new ResourceService();
  const resourceController = new ResourceController(resourceService);

  // Mount resource routes
  router.use('/resources', createResourceRoutes(resourceController));

  return router;
};
