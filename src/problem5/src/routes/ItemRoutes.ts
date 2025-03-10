import { Router } from 'express';
import { createItem, getItems, getItemById, updateItem, deleteItem } from '../controllers/ItemController';

const router = Router();

router.post('/items', createItem);
router.get('/items', getItems);
router.get('/items/:id', getItemById);
router.put('/items/:id', updateItem);
router.delete('/items/:id', deleteItem);

export default router;
