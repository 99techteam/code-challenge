import type { Request, Response } from 'express';

import { ProductController } from '../product.controller';

import type { ProductUseCases } from '@/application/product/use-cases/product.usecase';
import { Product } from '@/domain/product/entities/product.entity';

describe('ProductController', () => {
  let controller: ProductController;
  let mockUseCase: jest.Mocked<ProductUseCases>;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;
  let mockSend: jest.Mock;

  beforeEach(() => {
    mockUseCase = {
      getAll: jest.fn(),
      get: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<ProductUseCases>;

    controller = new ProductController(mockUseCase);
    req = {};
    mockSend = jest.fn();
    mockJson = jest.fn();
    mockStatus = jest.fn(() => ({ json: mockJson, send: mockSend })) as any;

    res = {
      status: mockStatus,
      json: mockJson,
      send: mockSend,
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return all products with total count', async () => {
    const mockProduct = new Product({
      id: '1',
      name: 'Product A',
      description: 'Test description',
      price: 100,
      stock: 10,
      category: 'Test Category',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const mockProducts = [mockProduct].map((mp) => mp.toPublicObject());
    mockUseCase.getAll.mockResolvedValue({
      data: mockProducts,
      page: 1,
      total: 1,
      totalPages: 1,
    });

    req.query = { limit: '10', page: '1' };
    await controller.getAll(req as Request, res as Response);

    expect(mockUseCase.getAll).toHaveBeenCalledWith({ limit: 10, page: 1 });
    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(mockJson).toHaveBeenCalledWith({
      data: mockProducts,
      pagination: {
        page: 1,
        total: 1,
        totalPages: 1,
      },
    });
  });

  it('should return a product by ID', async () => {
    const mockProduct = new Product({
      id: '1',
      name: 'Product A',
      description: 'Test description',
      price: 100,
      stock: 10,
      category: 'Test Category',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    mockUseCase.get.mockResolvedValue(mockProduct.toPublicObject());

    req.params = { id: '1' };
    await controller.getById(req as Request, res as Response);

    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(mockJson).toHaveBeenCalledWith(mockProduct.toPublicObject());
  });

  it('should return 404 if product not found', async () => {
    mockUseCase.get.mockResolvedValue(null);

    req.params = { id: '1' };
    await controller.getById(req as Request, res as Response);

    expect(mockStatus).toHaveBeenCalledWith(404);
    expect(mockJson).toHaveBeenCalledWith({ message: 'Product not found' });
  });

  it('should create a product', async () => {
    const dto = { name: 'New Product', price: 100 };
    const createdProduct = new Product({
      id: '1',
      name: 'New Product',
      description: 'A new product',
      price: 100,
      stock: 10,
      category: 'General',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    mockUseCase.create.mockResolvedValue(createdProduct.toPublicObject());

    req.body = dto;
    await controller.create(req as Request, res as Response);

    expect(mockStatus).toHaveBeenCalledWith(201);
    expect(mockJson).toHaveBeenCalledWith(createdProduct.toPublicObject());
  });

  it('should update a product', async () => {
    const dto = { name: 'Updated Product' };
    const updatedProduct = new Product({
      id: '1',
      name: 'Updated Product',
      description: 'Updated description',
      price: 200,
      stock: 20,
      category: 'Updated Category',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    mockUseCase.update.mockResolvedValue(updatedProduct.toPublicObject());

    req.params = { id: '1' };
    req.body = dto;
    await controller.update(req as Request, res as Response);

    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(mockJson).toHaveBeenCalledWith(updatedProduct.toPublicObject());
  });

  it('should delete a product', async () => {
    mockUseCase.delete.mockResolvedValue(undefined);

    req.params = { id: '1' };
    await controller.remove(req as Request, res as Response);

    expect(mockStatus).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });
});
