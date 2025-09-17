import { Request, Response, NextFunction } from 'express';
import { ItemService } from '../services/item.service';
import { CreateItemInput, UpdateItemInput, GetItemsQuery, ItemParams, ApiResponse } from '../types/item.types';

export class ItemController {
  private itemService: ItemService;

  constructor() {
    this.itemService = new ItemService();
  }

  createItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = await this.itemService.createItem(req.body);
      
      const response: ApiResponse = {
        success: true,
        data: item,
        message: 'Item created successfully',
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  getItems = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.itemService.getItems(req.query as unknown as GetItemsQuery);
      
      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'Items retrieved successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  getItemById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const item = await this.itemService.getItemById(Number(id));
      
      const response: ApiResponse = {
        success: true,
        data: item,
        message: 'Item retrieved successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  updateItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const item = await this.itemService.updateItem(Number(id), req.body);
      
      const response: ApiResponse = {
        success: true,
        data: item,
        message: 'Item updated successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  deleteItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await this.itemService.deleteItem(Number(id));
      
      const response: ApiResponse = {
        success: true,
        message: 'Item deleted successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}