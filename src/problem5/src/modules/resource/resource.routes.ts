import { Router } from 'express';
import { ResourceController } from './resource.controller';
import { validate } from '../../common/middleware/validate.middleware';
import {
  createResourceSchema,
  updateResourceSchema,
  resourceQuerySchema,
  idParamSchema,
} from './resource.validation';

export const resourceRouter = Router();

resourceRouter.get('/', validate(resourceQuerySchema, 'query'), ResourceController.getAll);
resourceRouter.post('/', validate(createResourceSchema), ResourceController.create);
resourceRouter.get('/:id', validate(idParamSchema, 'params'), ResourceController.getById);
resourceRouter.patch(
  '/:id',
  validate(idParamSchema, 'params'),
  validate(updateResourceSchema),
  ResourceController.update
);
resourceRouter.delete('/:id', validate(idParamSchema, 'params'), ResourceController.delete);
