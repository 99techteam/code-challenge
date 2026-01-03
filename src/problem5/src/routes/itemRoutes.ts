import { Router } from 'express';
import { ItemController } from '../controllers/itemController';

const router = Router();

router.post('/', ItemController.create);
router.get('/', ItemController.list);
router.get('/:id', ItemController.getById);
router.put('/:id', ItemController.update);
router.delete('/:id', ItemController.delete);

export default router;

