import { Request, Response, NextFunction } from 'express';
import { inject, injectable } from 'inversify';
import { IItemService } from '../interfaces/IItemService';
import { TYPES } from '../types/types';

@injectable()
export class ItemController {
  constructor(
    @inject(TYPES.ItemService) private itemService: IItemService
  ) {}

  createItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const createItemDTO = {
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        category: req.body.category,
      };
      const newItem = await this.itemService.createItem(createItemDTO);
      res.status(201).json(newItem);
    } catch (error) {
      next(error);
    }
  };

  getItems = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 10;
      const sortBy = req.query.sortBy as 'name' | 'price' | 'category' | 'createdAt';
      const order = req.query.order as 'asc' | 'desc';
      const searchTerm = req.query.search as string;
      const category = req.query.category as string;
      const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined;
      const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined;
      
      const result = await this.itemService.getAllItems({
        page, 
        pageSize,
        sort: {
          sortBy,
          order
        },
        searchTerm,
        filter: {
          category,
          minPrice,
          maxPrice
        }
      });
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  getItemById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      const item = await this.itemService.getItemById(id);
      if (!item) {
        res.status(404).json({ message: 'Item not found' });
        return;
      }
      res.json(item);
    } catch (error) {
      next(error);
    }
  };

  updateItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      const updateItemDTO = {
        ...(req.body.name !== undefined && { name: req.body.name }),
        ...(req.body.description !== undefined && { description: req.body.description }),
        ...(req.body.price !== undefined && { price: req.body.price }),
        ...(req.body.category !== undefined && { category: req.body.category }),
      };
      const updatedItem = await this.itemService.updateItem(id, updateItemDTO);
      if (!updatedItem) {
        res.status(404).json({ message: 'Item not found' });
        return;
      }
      res.json(updatedItem);
    } catch (error) {
      next(error);
    }
  };

  deleteItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      const deletedItem = await this.itemService.deleteItem(id);
      if (!deletedItem) {
        res.status(404).json({ message: 'Item not found' });
        return;
      }
      res.json(deletedItem);
    } catch (error) {
      next(error);
    }
  };
}
