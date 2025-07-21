import { injectable } from 'inversify';
import { IItemService, PaginatedResult, PaginationParams } from '../interfaces/IItemService';
import prisma from '../lib/prisma';
import { CreateItemDTO, Item, UpdateItemDTO } from '../models/item';

@injectable()
export class ItemService implements IItemService {
  async createItem(itemData: CreateItemDTO): Promise<Item> {
    return prisma.item.create({
      data: itemData
    });
  }

  async getAllItems(params?: PaginationParams): Promise<PaginatedResult<Item>> {
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;
    const skip = (page - 1) * pageSize;
    
    const sortBy = params?.sort?.sortBy || 'createdAt';
    const order = params?.sort?.order || 'desc';

    const where: any = {};

    // Add search conditions if searchTerm is provided
    if (params?.searchTerm) {
      where.OR = [
        { name: { contains: params.searchTerm } },
        { description: { contains: params.searchTerm } }
      ];
    }

    // Add category filter
    if (params?.filter?.category) {
      where.category = params.filter.category;
    }

    // Add price range filter
    if (params?.filter?.minPrice || params?.filter?.maxPrice) {
      where.price = {};
      if (params.filter.minPrice) {
        where.price.gte = params.filter.minPrice;
      }
      if (params.filter.maxPrice) {
        where.price.lte = params.filter.maxPrice;
      }
    }

    const [items, total] = await Promise.all([
      prisma.item.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: {
          [sortBy]: order
        }
      }),
      prisma.item.count({ where })
    ]);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  }

  async getItemById(id: number): Promise<Item | null> {
    return prisma.item.findUnique({
      where: { id }
    });
  }

  async updateItem(id: number, data: UpdateItemDTO): Promise<Item | null> {
    try {
      return await prisma.item.update({
        where: { id },
        data
      });
    } catch {
      return null;
    }
  }

  async deleteItem(id: number): Promise<Item | null> {
    try {
      return await prisma.item.delete({
        where: { id }
      });
    } catch {
      return null;
    }
  }
}