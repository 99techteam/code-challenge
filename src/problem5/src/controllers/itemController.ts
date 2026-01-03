import { Request, Response } from 'express';
import { ItemModel } from '../models/itemModel';
import { CreateItemDto, UpdateItemDto, ItemFilters, Item } from '../types/item';

export class ItemController {
  static create(req: Request, res: Response): void {
    try {
      const data: CreateItemDto = req.body;

      if (!data.name || data.name.trim() === '') {
        res.status(400).json({ error: 'Name is required' });
        return;
      }

      const item = ItemModel.create(data);
      res.status(201).json(item);
    } catch (error) {
      console.error('Error creating item:', error);
      res.status(500).json({ error: 'Failed to create item' });
    }
  }

  static list(req: Request, res: Response): void {
    try {
      const filters: ItemFilters = {
        status: req.query.status as string,
        search: req.query.search as string,
        limit: req.query.limit
          ? parseInt(req.query.limit as string)
          : undefined,
        offset: req.query.offset
          ? parseInt(req.query.offset as string)
          : undefined,
      };

      const items = ItemModel.findAll(filters);
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch items' });
    }
  }

  static getById(req: Request, res: Response): void {
    try {
      const id = req.params.id;

      if (!id || !ItemController.isValidUUID(id)) {
        res.status(400).json({ error: 'Invalid ID format' });
        return;
      }

      const item = ItemModel.findById(id);

      if (!item) {
        res.status(404).json({ error: 'Item not found' });
        return;
      }

      res.json(item);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch item' });
    }
  }

  static update(req: Request, res: Response): void {
    try {
      const id = req.params.id;
      console.log('Updating item with ID:', id);

      if (!id || !ItemController.isValidUUID(id)) {
        res.status(400).json({ error: 'Invalid ID format' });
        return;
      }

      const data: UpdateItemDto = req.body;
      const item = ItemModel.update(id, data);

      if (!item) {
        res.status(404).json({ error: 'Item not found' });
        return;
      }

      res.json(item);
    } catch (error) {
      console.error('Error updating item:', error);
      res.status(500).json({ error: 'Failed to update item' });
    }
  }

  static delete(req: Request, res: Response): void {
    try {
      const id = req.params.id;

      if (!id || !ItemController.isValidUUID(id)) {
        res.status(400).json({ error: 'Invalid ID format' });
        return;
      }

      const deleted = ItemModel.delete(id);

      if (!deleted) {
        res.status(404).json({ error: 'Item not found' });
        return;
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete item' });
    }
  }

  private static isValidUUID(uuid: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }
}
