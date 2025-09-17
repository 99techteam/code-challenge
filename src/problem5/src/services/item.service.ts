import { prisma } from '../prisma';
import { CreateItemInput, UpdateItemInput, GetItemsQuery, ItemResponse, ItemListResponse } from '../types/item.types';
import { AppError } from '../middleware/error.middleware';

export class ItemService {
  async createItem(data: CreateItemInput): Promise<ItemResponse> {
    try {
      const item = await prisma.item.create({
        data,
      });
      return item;
    } catch (error) {
      throw new AppError('Failed to create item', 500);
    }
  }

  async getItems(query: GetItemsQuery): Promise<ItemListResponse> {
    try {
      const { search, category, minPrice, maxPrice, page, limit, sortBy, order } = query;

      // Build where clause for filtering
      const where: any = {};

      if (search) {
        where.name = {
          contains: search,
        };
      }

      if (category) {
        where.category = category;
      }

      if (minPrice !== undefined || maxPrice !== undefined) {
        where.price = {};
        if (minPrice !== undefined) {
          where.price.gte = minPrice;
        }
        if (maxPrice !== undefined) {
          where.price.lte = maxPrice;
        }
      }

      // Calculate pagination
      const skip = (page - 1) * limit;

      // Build orderBy clause
      const orderBy: any = {};
      orderBy[sortBy] = order;

      // Execute queries
      const [items, total] = await Promise.all([
        prisma.item.findMany({
          where,
          skip,
          take: limit,
          orderBy,
        }),
        prisma.item.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        items,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      };
    } catch (error) {
      console.error('Error in getItems:', error);
      throw new AppError('Failed to retrieve items', 500);
    }
  }

  async getItemById(id: number): Promise<ItemResponse> {
    try {
      const item = await prisma.item.findUnique({
        where: { id },
      });

      if (!item) {
        throw new AppError('Item not found', 404);
      }

      return item;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to retrieve item', 500);
    }
  }

  async updateItem(id: number, data: UpdateItemInput): Promise<ItemResponse> {
    try {
      // Check if item exists
      const existingItem = await prisma.item.findUnique({
        where: { id },
      });

      if (!existingItem) {
        throw new AppError('Item not found', 404);
      }

      const updatedItem = await prisma.item.update({
        where: { id },
        data,
      });

      return updatedItem;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to update item', 500);
    }
  }

  async deleteItem(id: number): Promise<void> {
    try {
      // Check if item exists
      const existingItem = await prisma.item.findUnique({
        where: { id },
      });

      if (!existingItem) {
        throw new AppError('Item not found', 404);
      }

      await prisma.item.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to delete item', 500);
    }
  }
}