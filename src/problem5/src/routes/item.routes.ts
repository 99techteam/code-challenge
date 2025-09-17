import { Router } from 'express';
import { ItemController } from '../controllers/item.controller';
import { validate } from '../middleware/error.middleware';
import {
  createItemSchema,
  updateItemSchema,
  getItemsQuerySchema,
  itemParamsSchema,
} from '../types/item.types';

const router = Router();
const itemController = new ItemController();

// POST /api/items - Create a new item
router.post(
  '/',
  validate(createItemSchema, 'body'),
  itemController.createItem
);

// GET /api/items - Get all items with filtering, pagination, and sorting
router.get(
  '/',
  validate(getItemsQuerySchema, 'query'),
  itemController.getItems
);

// GET /api/items/:id - Get a specific item by ID
router.get(
  '/:id',
  validate(itemParamsSchema, 'params'),
  itemController.getItemById
);

// PUT /api/items/:id - Update a specific item
router.put(
  '/:id',
  validate(itemParamsSchema, 'params'),
  validate(updateItemSchema, 'body'),
  itemController.updateItem
);

// DELETE /api/items/:id - Delete a specific item
router.delete(
  '/:id',
  validate(itemParamsSchema, 'params'),
  itemController.deleteItem
);

export default router;