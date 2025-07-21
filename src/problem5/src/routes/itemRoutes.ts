import { Router } from 'express';
import { TYPES } from '../types/types';
import { container } from '../config/inversify.config';
import { ItemController } from '../controllers/itemController';
import { validateCreateItem, validateUpdateItem, validateItemId, validatePagination } from '../middlewares/validation';

const router = Router();
const itemController = container.get<ItemController>(TYPES.ItemController);

router.post('/', validateCreateItem, itemController.createItem);
router.get('/', validatePagination, itemController.getItems);
router.get('/:id', validateItemId, itemController.getItemById);
router.put('/:id', validateItemId, validateUpdateItem, itemController.updateItem);
router.delete('/:id', validateItemId, itemController.deleteItem);

export default router;
