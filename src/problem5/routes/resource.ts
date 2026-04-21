import { Router } from 'express';
import * as ResourceController from '../controllers/resource.controller';
import { wrap } from '../utils/http-handler';

const router = Router();

router.post('/', wrap(ResourceController.create));
router.get('/', wrap(ResourceController.list));
router.get('/:id', wrap(ResourceController.get));
router.put('/:id', wrap(ResourceController.modify));
router.delete('/:id', wrap(ResourceController.remove));

export default router;
