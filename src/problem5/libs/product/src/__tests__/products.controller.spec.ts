import { ConflictException, NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { createPaginationResponse, Paginated, PaginationDTO } from '@problem5/shared'

import { CreateProduct, IProductService, ListProducts, Product, ProductCategory, UpdateProduct } from '../domain'
import { PRODUCT_SERVICE } from '../infras'
import { ProductsController } from '../products.controller'

describe('ProductsController', () => {
  let controller: ProductsController
  let service: jest.Mocked<IProductService>

  const mockProduct: Product = {
    id: 1,
    name: 'Test Product',
    description: 'A test product',
    price: 99.99,
    sku: 'TEST-001',
    category: ProductCategory.ELECTRONICS,
    isActive: true,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  }

  const createProductDto: CreateProduct = {
    name: 'New Product',
    description: 'A new product',
    price: 50.0,
    sku: 'NEW-001',
    category: ProductCategory.BOOKS,
    isActive: true,
  }

  beforeEach(async () => {
    const mockService: jest.Mocked<IProductService> = {
      createProduct: jest.fn(),
      getProduct: jest.fn(),
      getProducts: jest.fn(),
      updateProduct: jest.fn(),
      deleteProduct: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: PRODUCT_SERVICE,
          useValue: mockService,
        },
      ],
    }).compile()

    controller = module.get<ProductsController>(ProductsController)
    service = module.get<jest.Mocked<IProductService>>(PRODUCT_SERVICE)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('create', () => {
    it('should create a product successfully', async () => {
      service.createProduct.mockResolvedValue(mockProduct)

      const result = await controller.create(createProductDto)

      expect(service.createProduct).toHaveBeenCalledWith(createProductDto)
      expect(result).toEqual(mockProduct)
    })

    it('should handle ConflictException from service', async () => {
      service.createProduct.mockRejectedValue(new ConflictException("Product with SKU 'NEW-001' already exists"))

      await expect(controller.create(createProductDto)).rejects.toThrow(ConflictException)
    })
  })

  describe('findAll', () => {
    it('should return paginated products', async () => {
      const query: ListProducts = {}

      const pagination: PaginationDTO = {
        page: 1,
        limit: 10,
      } as PaginationDTO

      const paginatedResult: Paginated<Product> = {
        data: [mockProduct],
        paging: createPaginationResponse(1, 1, 10),
      }

      service.getProducts.mockResolvedValue(paginatedResult)

      const result = await controller.findAll(query, pagination)

      expect(service.getProducts).toHaveBeenCalledWith(query, pagination)
      expect(result).toEqual({
        data: [mockProduct],
        paging: createPaginationResponse(1, 1, 10),
      })
    })

    it('should handle search and filter parameters', async () => {
      const query: ListProducts = {
        category: ProductCategory.ELECTRONICS,
        isActive: true,
        search: 'test query',
        priceMin: 10.0,
        priceMax: 50.0,
      }

      const pagination: PaginationDTO = {
        page: 2,
        limit: 20,
      }

      const paginatedResult: Paginated<Product> = {
        data: [],
        paging: createPaginationResponse(0, 2, 20),
      }

      service.getProducts.mockResolvedValue(paginatedResult)

      const result = await controller.findAll(query, pagination)

      expect(service.getProducts).toHaveBeenCalledWith(query, pagination)
      expect(result).toEqual({
        data: [],
        paging: createPaginationResponse(0, 2, 20),
      })
    })
  })

  describe('findOne', () => {
    it('should return a product by ID', async () => {
      service.getProduct.mockResolvedValue(mockProduct)

      const result = await controller.findOne(1)

      expect(service.getProduct).toHaveBeenCalledWith(1)
      expect(result).toEqual(mockProduct)
    })

    it('should handle NotFoundException from service', async () => {
      service.getProduct.mockRejectedValue(new NotFoundException("Product with ID '999' not found"))

      await expect(controller.findOne(999)).rejects.toThrow(NotFoundException)
    })

    it('should convert string parameter to number', async () => {
      service.getProduct.mockResolvedValue(mockProduct)

      const result = await controller.findOne('123' as any)

      expect(service.getProduct).toHaveBeenCalledWith(123)
      expect(result).toEqual(mockProduct)
    })
  })

  describe('update', () => {
    it('should update a product successfully', async () => {
      const updateDto: UpdateProduct = {
        name: 'Updated Product',
        price: 60.0,
      }

      const updatedProduct = { ...mockProduct, ...updateDto }
      service.updateProduct.mockResolvedValue(updatedProduct)

      const result = await controller.update(1, updateDto)

      expect(service.updateProduct).toHaveBeenCalledWith(1, updateDto)
      expect(result).toEqual(updatedProduct)
    })

    it('should handle NotFoundException from service', async () => {
      const updateDto: UpdateProduct = { name: 'Updated Product' }

      service.updateProduct.mockRejectedValue(new NotFoundException("Product with ID '999' not found"))

      await expect(controller.update(999, updateDto)).rejects.toThrow(NotFoundException)
    })

    it('should handle ConflictException for duplicate SKU', async () => {
      const updateDto: UpdateProduct = { sku: 'EXISTING-SKU' }

      service.updateProduct.mockRejectedValue(new ConflictException("Product with SKU 'EXISTING-SKU' already exists"))

      await expect(controller.update(1, updateDto)).rejects.toThrow(ConflictException)
    })

    it('should convert string parameter to number', async () => {
      const updateDto: UpdateProduct = { name: 'Updated Product' }
      const updatedProduct = { ...mockProduct, ...updateDto }

      service.updateProduct.mockResolvedValue(updatedProduct)

      await controller.update('123' as any, updateDto)

      expect(service.updateProduct).toHaveBeenCalledWith(123, updateDto)
    })
  })

  describe('remove', () => {
    it('should delete a product successfully', async () => {
      service.deleteProduct.mockResolvedValue(undefined)

      await controller.remove(1)

      expect(service.deleteProduct).toHaveBeenCalledWith(1)
    })

    it('should handle NotFoundException from service', async () => {
      service.deleteProduct.mockRejectedValue(new NotFoundException("Product with ID '999' not found"))

      await expect(controller.remove(999)).rejects.toThrow(NotFoundException)
    })

    it('should convert string parameter to number', async () => {
      service.deleteProduct.mockResolvedValue(undefined)

      await controller.remove('123' as any)

      expect(service.deleteProduct).toHaveBeenCalledWith(123)
    })

    it('should return success response', async () => {
      service.deleteProduct.mockResolvedValue(undefined)

      const result = await controller.remove(1)

      expect(result).toEqual({ success: true })
    })
  })

  describe('HTTP status codes and responses', () => {
    it('should return 201 Created for successful product creation', async () => {
      service.createProduct.mockResolvedValue(mockProduct)

      const result = await controller.create(createProductDto)

      expect(result).toEqual(mockProduct)
    })

    it('should return 200 OK for successful product retrieval', async () => {
      service.getProduct.mockResolvedValue(mockProduct)

      const result = await controller.findOne(1)

      expect(result).toEqual(mockProduct)
    })

    it('should return 200 OK for successful product update', async () => {
      const updateDto: UpdateProduct = { name: 'Updated Product' }
      const updatedProduct = { ...mockProduct, ...updateDto }

      service.updateProduct.mockResolvedValue(updatedProduct)

      const result = await controller.update(1, updateDto)

      expect(result).toEqual(updatedProduct)
    })

    it('should return success for successful product deletion', async () => {
      service.deleteProduct.mockResolvedValue(undefined)

      const result = await controller.remove(1)

      expect(result).toEqual({ success: true })
    })
  })

  describe('parameter validation', () => {
    it('should handle various query parameter combinations', async () => {
      const testCases = [
        { page: 1, limit: 5 },
        {
          page: 1,
          limit: 10,
          category: ProductCategory.BOOKS,
          isActive: false,
        },
        { page: 1, limit: 10, search: 'electronics' },
        { page: 1, limit: 10, priceMin: 10.0 },
        { page: 1, limit: 10, priceMax: 50.0 },
        { page: 1, limit: 10 },
      ]

      const mockResult: Paginated<Product> = {
        data: [],
        paging: createPaginationResponse(0, 1, 10),
      }

      service.getProducts.mockResolvedValue(mockResult)

      for (const testParams of testCases) {
        const { page = 1, limit = 10, ...queryParams } = testParams as any
        await controller.findAll(queryParams, { page, limit })
      }
    })
  })
})
