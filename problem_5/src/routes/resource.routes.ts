import { Router } from 'express';
import { ResourceController } from '../controllers/resource.controller';

export function createResourceRouter(): Router {
  const router = Router();
  const controller = new ResourceController();

  router.post('/', controller.create);
  router.get('/', controller.list);
  router.get('/:id', controller.getById);
  router.patch('/batch', controller.batchUpdate);
  router.delete('/batch', controller.batchDelete);
  router.patch('/:id', controller.updateById);
  router.delete('/:id', controller.deleteById);

  return router;
}
