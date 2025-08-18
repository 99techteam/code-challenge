import { Router } from 'express';
import { ResourceController } from '../controllers/resource.controller';
import { validate, resourceSchemas } from '../middleware/validate';

export const createResourceRoutes = (
  resourceController: ResourceController
): Router => {
  const router = Router();

  // POST /api/resources - Create a new resource
  router.post(
    '/',
    validate({ body: resourceSchemas.create }),
    resourceController.createResource
  );

  // GET /api/resources - List all resources with optional query filters
  router.get(
    '/',
    validate({ query: resourceSchemas.query }),
    resourceController.getResources
  );

  // GET /api/resources/:id - Get a specific resource by ID
  router.get(
    '/:id',
    validate({ params: resourceSchemas.params }),
    resourceController.getResourceById
  );

  // PUT /api/resources/:id - Update an existing resource
  router.put(
    '/:id',
    validate({
      params: resourceSchemas.params,
      body: resourceSchemas.update,
    }),
    resourceController.updateResource
  );

  // DELETE /api/resources/:id - Delete a resource
  router.delete(
    '/:id',
    validate({ params: resourceSchemas.params }),
    resourceController.deleteResource
  );

  return router;
};
