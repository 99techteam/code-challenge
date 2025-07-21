import { Request, Response, NextFunction } from 'express';
import { ItemController } from '../src/controllers/itemController';
import { IItemService } from '../src/interfaces/IItemService';
import { CreateItemDTO, UpdateItemDTO } from '../src/models/item';

describe('ItemController', () => {
  let itemController: ItemController;
  let mockItemService: jest.Mocked<IItemService>;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockItemService = {
      createItem: jest.fn(),
      getAllItems: jest.fn(),
      getItemById: jest.fn(),
      updateItem: jest.fn(),
      deleteItem: jest.fn(),
    };

    itemController = new ItemController(mockItemService);

    mockReq = {
      body: {},
      params: {},
      query: {},
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createItem', () => {
    it('should create item successfully', async () => {
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
        updatedAt: null,
      };

      mockReq.body = createItemDTO;
      mockItemService.createItem.mockResolvedValue(mockCreatedItem);

      await itemController.createItem(mockReq as Request, mockRes as Response, mockNext);

      expect(mockItemService.createItem).toHaveBeenCalledWith(createItemDTO);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(mockCreatedItem);
    });

    it('should handle create item error', async () => {
      const error = new Error('Database error');
      mockReq.body = {
        name: 'Test Item',
        description: 'Test Description',
        price: 10.99,
        category: 'Test Category',
      };

      mockItemService.createItem.mockRejectedValue(error);

      await itemController.createItem(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getItems', () => {
    it('should get items with default pagination', async () => {
      const mockResult = {
        items: [],
        total: 0,
        page: 1,
        pageSize: 10,
        totalPages: 0,
      };

      mockItemService.getAllItems.mockResolvedValue(mockResult);

      await itemController.getItems(mockReq as Request, mockRes as Response, mockNext);

      expect(mockItemService.getAllItems).toHaveBeenCalledWith({
        page: 1,
        pageSize: 10,
        sort: {
          sortBy: undefined,
          order: undefined,
        },
        searchTerm: undefined,
        filter: {
          category: undefined,
          minPrice: undefined,
          maxPrice: undefined,
        },
      });
      expect(mockRes.json).toHaveBeenCalledWith(mockResult);
    });

    it('should get items with custom pagination and filters', async () => {
      mockReq.query = {
        page: '2',
        pageSize: '5',
        sortBy: 'name',
        order: 'desc',
        search: 'test',
        category: 'electronics',
        minPrice: '10',
        maxPrice: '100',
      };

      const mockResult = {
        items: [],
        total: 0,
        page: 2,
        pageSize: 5,
        totalPages: 0,
      };

      mockItemService.getAllItems.mockResolvedValue(mockResult);

      await itemController.getItems(mockReq as Request, mockRes as Response, mockNext);

      expect(mockItemService.getAllItems).toHaveBeenCalledWith({
        page: 2,
        pageSize: 5,
        sort: {
          sortBy: 'name',
          order: 'desc',
        },
        searchTerm: 'test',
        filter: {
          category: 'electronics',
          minPrice: 10,
          maxPrice: 100,
        },
      });
    });

    it('should handle get items error', async () => {
      const error = new Error('Database error');
      mockItemService.getAllItems.mockRejectedValue(error);

      await itemController.getItems(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
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
        updatedAt: null,
      };

      mockReq.params = { id: '1' };
      mockItemService.getItemById.mockResolvedValue(mockItem);

      await itemController.getItemById(mockReq as Request, mockRes as Response, mockNext);

      expect(mockItemService.getItemById).toHaveBeenCalledWith(1);
      expect(mockRes.json).toHaveBeenCalledWith(mockItem);
    });

    it('should return 404 when item not found', async () => {
      mockReq.params = { id: '999' };
      mockItemService.getItemById.mockResolvedValue(null);

      await itemController.getItemById(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Item not found' });
    });

    it('should handle get item by id error', async () => {
      const error = new Error('Database error');
      mockReq.params = { id: '1' };
      mockItemService.getItemById.mockRejectedValue(error);

      await itemController.getItemById(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
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
        description: 'Test Description',
        price: 15.99,
        category: 'Test Category',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockReq.params = { id: '1' };
      mockReq.body = updateItemDTO;
      mockItemService.updateItem.mockResolvedValue(mockUpdatedItem);

      await itemController.updateItem(mockReq as Request, mockRes as Response, mockNext);

      expect(mockItemService.updateItem).toHaveBeenCalledWith(1, updateItemDTO);
      expect(mockRes.json).toHaveBeenCalledWith(mockUpdatedItem);
    });

    it('should return 404 when updating non-existent item', async () => {
      mockReq.params = { id: '999' };
      mockReq.body = { name: 'Updated Item' };
      mockItemService.updateItem.mockResolvedValue(null);

      await itemController.updateItem(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Item not found' });
    });

    it('should handle partial updates correctly', async () => {
      mockReq.params = { id: '1' };
      mockReq.body = {
        name: 'Updated Name',
        description: undefined,
        price: 25.99,
        category: undefined,
      };

      const expectedDTO = {
        name: 'Updated Name',
        price: 25.99,
      };

      const mockUpdatedItem = {
        id: 1,
        name: 'Updated Name',
        description: 'Old Description',
        price: 25.99,
        category: 'Old Category',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockItemService.updateItem.mockResolvedValue(mockUpdatedItem);

      await itemController.updateItem(mockReq as Request, mockRes as Response, mockNext);

      expect(mockItemService.updateItem).toHaveBeenCalledWith(1, expectedDTO);
    });

    it('should handle update item error', async () => {
      const error = new Error('Database error');
      mockReq.params = { id: '1' };
      mockReq.body = { name: 'Updated Item' };
      mockItemService.updateItem.mockRejectedValue(error);

      await itemController.updateItem(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
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
        updatedAt: null,
      };

      mockReq.params = { id: '1' };
      mockItemService.deleteItem.mockResolvedValue(mockDeletedItem);

      await itemController.deleteItem(mockReq as Request, mockRes as Response, mockNext);

      expect(mockItemService.deleteItem).toHaveBeenCalledWith(1);
      expect(mockRes.json).toHaveBeenCalledWith(mockDeletedItem);
    });

    it('should return 404 when deleting non-existent item', async () => {
      mockReq.params = { id: '999' };
      mockItemService.deleteItem.mockResolvedValue(null);

      await itemController.deleteItem(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Item not found' });
    });

    it('should handle delete item error', async () => {
      const error = new Error('Database error');
      mockReq.params = { id: '1' };
      mockItemService.deleteItem.mockRejectedValue(error);

      await itemController.deleteItem(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});