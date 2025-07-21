import { ItemService } from '../src/services/itemService';
import { CreateItemDTO, UpdateItemDTO } from '../src/models/item';
import { PaginationParams } from '../src/interfaces/IItemService';

// Mock Prisma client
jest.mock('../src/lib/prisma', () => ({
  __esModule: true,
  default: {
    item: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

// Import after mock
import prisma from '../src/lib/prisma';

// Get typed mock functions
const mockPrisma = {
  item: {
    create: prisma.item.create as jest.MockedFunction<typeof prisma.item.create>,
    findMany: prisma.item.findMany as jest.MockedFunction<typeof prisma.item.findMany>,
    count: prisma.item.count as jest.MockedFunction<typeof prisma.item.count>,
    findUnique: prisma.item.findUnique as jest.MockedFunction<typeof prisma.item.findUnique>,
    update: prisma.item.update as jest.MockedFunction<typeof prisma.item.update>,
    delete: prisma.item.delete as jest.MockedFunction<typeof prisma.item.delete>,
  },
};

describe('ItemService', () => {
  let itemService: ItemService;

  beforeEach(() => {
    itemService = new ItemService();
    jest.clearAllMocks();
  });

  describe('createItem', () => {
    it('should create an item successfully', async () => {
      const createItemDTO: CreateItemDTO = {
        name: 'Test Item',
        description: 'Test Description',
        price: 10.99,
        category: 'Test Category',
      };

      const mockCreatedItem = {
        id: 1,
        ...createItemDTO,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.item.create.mockResolvedValue(mockCreatedItem);

      const result = await itemService.createItem(createItemDTO);

      expect(mockPrisma.item.create).toHaveBeenCalledWith({
        data: createItemDTO,
      });
      expect(result).toEqual(mockCreatedItem);
    });

    it('should propagate database errors', async () => {
      const createItemDTO: CreateItemDTO = {
        name: 'Test Item',
        description: 'Test Description',
        price: 10.99,
        category: 'Test Category',
      };

      const dbError = new Error('Database connection failed');
      mockPrisma.item.create.mockRejectedValue(dbError);

      await expect(itemService.createItem(createItemDTO)).rejects.toThrow('Database connection failed');
    });
  });

  describe('getAllItems', () => {
    const mockItems = [
      {
        id: 1,
        name: 'Item 1',
        description: 'Description 1',
        price: 10.99,
        category: 'Category 1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        name: 'Item 2',
        description: 'Description 2',
        price: 20.99,
        category: 'Category 2',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    it('should get items with default pagination', async () => {
      mockPrisma.item.findMany.mockResolvedValue(mockItems);
      mockPrisma.item.count.mockResolvedValue(2);

      const result = await itemService.getAllItems();

      expect(mockPrisma.item.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        orderBy: {
          createdAt: 'desc',
        },
      });

      expect(mockPrisma.item.count).toHaveBeenCalledWith({ where: {} });

      expect(result).toEqual({
        items: mockItems,
        total: 2,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      });
    });

    it('should get items with custom pagination', async () => {
      const params: PaginationParams = {
        page: 2,
        pageSize: 5,
        sort: {
          sortBy: 'name',
          order: 'asc',
        },
      };

      mockPrisma.item.findMany.mockResolvedValue(mockItems);
      mockPrisma.item.count.mockResolvedValue(15);

      const result = await itemService.getAllItems(params);

      expect(mockPrisma.item.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 5,
        take: 5,
        orderBy: {
          name: 'asc',
        },
      });

      expect(result).toEqual({
        items: mockItems,
        total: 15,
        page: 2,
        pageSize: 5,
        totalPages: 3,
      });
    });

    it('should filter items by search term', async () => {
      const params: PaginationParams = {
        searchTerm: 'test',
      };

      mockPrisma.item.findMany.mockResolvedValue(mockItems);
      mockPrisma.item.count.mockResolvedValue(2);

      await itemService.getAllItems(params);

      expect(mockPrisma.item.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: 'test' } },
            { description: { contains: 'test' } },
          ],
        },
        skip: 0,
        take: 10,
        orderBy: {
          createdAt: 'desc',
        },
      });
    });

    it('should filter items by category', async () => {
      const params: PaginationParams = {
        filter: {
          category: 'electronics',
        },
      };

      mockPrisma.item.findMany.mockResolvedValue(mockItems);
      mockPrisma.item.count.mockResolvedValue(2);

      await itemService.getAllItems(params);

      expect(mockPrisma.item.findMany).toHaveBeenCalledWith({
        where: {
          category: 'electronics',
        },
        skip: 0,
        take: 10,
        orderBy: {
          createdAt: 'desc',
        },
      });
    });

    it('should filter items by price range', async () => {
      const params: PaginationParams = {
        filter: {
          minPrice: 10,
          maxPrice: 50,
        },
      };

      mockPrisma.item.findMany.mockResolvedValue(mockItems);
      mockPrisma.item.count.mockResolvedValue(2);

      await itemService.getAllItems(params);

      expect(mockPrisma.item.findMany).toHaveBeenCalledWith({
        where: {
          price: {
            gte: 10,
            lte: 50,
          },
        },
        skip: 0,
        take: 10,
        orderBy: {
          createdAt: 'desc',
        },
      });
    });

    it('should filter items by minimum price only', async () => {
      const params: PaginationParams = {
        filter: {
          minPrice: 10,
        },
      };

      mockPrisma.item.findMany.mockResolvedValue(mockItems);
      mockPrisma.item.count.mockResolvedValue(2);

      await itemService.getAllItems(params);

      expect(mockPrisma.item.findMany).toHaveBeenCalledWith({
        where: {
          price: {
            gte: 10,
          },
        },
        skip: 0,
        take: 10,
        orderBy: {
          createdAt: 'desc',
        },
      });
    });

    it('should combine multiple filters', async () => {
      const params: PaginationParams = {
        searchTerm: 'laptop',
        filter: {
          category: 'electronics',
          minPrice: 100,
          maxPrice: 1000,
        },
      };

      mockPrisma.item.findMany.mockResolvedValue(mockItems);
      mockPrisma.item.count.mockResolvedValue(2);

      await itemService.getAllItems(params);

      expect(mockPrisma.item.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: 'laptop' } },
            { description: { contains: 'laptop' } },
          ],
          category: 'electronics',
          price: {
            gte: 100,
            lte: 1000,
          },
        },
        skip: 0,
        take: 10,
        orderBy: {
          createdAt: 'desc',
        },
      });
    });
  });

  describe('getItemById', () => {
    it('should get item by id successfully', async () => {
      const mockItem = {
        id: 1,
        name: 'Test Item',
        description: 'Test Description',
        price: 10.99,
        category: 'Test Category',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.item.findUnique.mockResolvedValue(mockItem);

      const result = await itemService.getItemById(1);

      expect(mockPrisma.item.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockItem);
    });

    it('should return null when item not found', async () => {
      mockPrisma.item.findUnique.mockResolvedValue(null);

      const result = await itemService.getItemById(999);

      expect(result).toBeNull();
    });
  });

  describe('updateItem', () => {
    it('should update item successfully', async () => {
      const updateItemDTO: UpdateItemDTO = {
        name: 'Updated Item',
        price: 15.99,
      };

      const mockUpdatedItem = {
        id: 1,
        name: 'Updated Item',
        description: 'Original Description',
        price: 15.99,
        category: 'Original Category',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.item.update.mockResolvedValue(mockUpdatedItem);

      const result = await itemService.updateItem(1, updateItemDTO);

      expect(mockPrisma.item.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateItemDTO,
      });
      expect(result).toEqual(mockUpdatedItem);
    });

    it('should return null when update fails', async () => {
      const updateItemDTO: UpdateItemDTO = {
        name: 'Updated Item',
      };

      mockPrisma.item.update.mockRejectedValue(new Error('Item not found'));

      const result = await itemService.updateItem(999, updateItemDTO);

      expect(result).toBeNull();
    });
  });

  describe('deleteItem', () => {
    it('should delete item successfully', async () => {
      const mockDeletedItem = {
        id: 1,
        name: 'Deleted Item',
        description: 'Test Description',
        price: 10.99,
        category: 'Test Category',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.item.delete.mockResolvedValue(mockDeletedItem);

      const result = await itemService.deleteItem(1);

      expect(mockPrisma.item.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockDeletedItem);
    });

    it('should return null when delete fails', async () => {
      mockPrisma.item.delete.mockRejectedValue(new Error('Item not found'));

      const result = await itemService.deleteItem(999);

      expect(result).toBeNull();
    });
  });
});