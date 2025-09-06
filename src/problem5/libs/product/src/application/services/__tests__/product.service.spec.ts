import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common'
import { createPaginationResponse, Paginated, PaginationRequest } from '@problem5/shared'

import {
  CreateProduct,
  IProductRepository,
  ListProducts,
  Product,
  ProductCategory,
  UpdateProduct,
} from '../../../domain'
import { ProductService } from '../product.service'

describe('ProductService', () => {
  let service: ProductService
  let repository: jest.Mocked<IProductRepository>

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

  const createProductData: CreateProduct = {
    name: 'New Product',
    description: 'A new product',
    price: 50.0,
    sku: 'NEW-001',
    category: ProductCategory.BOOKS,
    isActive: true,
  }

  beforeEach(() => {
    const mockRepo: jest.Mocked<IProductRepository> = {
      create: jest.fn(),
      findById: jest.fn(),
      findBySku: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    }

    repository = mockRepo
    service = new ProductService(repository)
  })

  describe('createProduct', () => {
    it('should create a product successfully', async () => {
      // First call to check for existing SKU should throw NotFoundException
      repository.findBySku.mockRejectedValueOnce(
        new NotFoundException(`Product with SKU '${createProductData.sku}' not found`)
      )
      repository.create.mockResolvedValue(undefined)
      // Second call to fetch the created product should return the product
      repository.findBySku.mockResolvedValue(mockProduct)

      const result = await service.createProduct(createProductData)

      expect(repository.findBySku).toHaveBeenCalledTimes(2)
      expect(repository.findBySku).toHaveBeenNthCalledWith(1, createProductData.sku)
      expect(repository.create).toHaveBeenCalledWith(createProductData)
      expect(repository.findBySku).toHaveBeenNthCalledWith(2, createProductData.sku)
      expect(result).toEqual(mockProduct)
    })

    it('should throw ConflictException when SKU already exists', async () => {
      repository.findBySku.mockResolvedValue(mockProduct)

      await expect(service.createProduct(createProductData)).rejects.toThrow(ConflictException)
      await expect(service.createProduct(createProductData)).rejects.toThrow(
        `Product with SKU '${createProductData.sku}' already exists`
      )

      expect(repository.findBySku).toHaveBeenCalledWith(createProductData.sku)
      expect(repository.create).not.toHaveBeenCalled()
    })

    it('should throw BadRequestException on repository error', async () => {
      repository.findBySku.mockRejectedValue(
        new NotFoundException(`Product with SKU '${createProductData.sku}' not found`)
      )
      repository.create.mockRejectedValue(new Error('Database error'))

      await expect(service.createProduct(createProductData)).rejects.toThrow(BadRequestException)
      await expect(service.createProduct(createProductData)).rejects.toThrow('Failed to create product')
    })
  })

  describe('getProduct', () => {
    it('should return a product when found', async () => {
      repository.findById.mockResolvedValue(mockProduct)

      const result = await service.getProduct(1)

      expect(repository.findById).toHaveBeenCalledWith(1)
      expect(result).toEqual(mockProduct)
    })

    it('should throw NotFoundException when product not found', async () => {
      repository.findById.mockRejectedValue(new NotFoundException("Product with ID '999' not found"))

      await expect(service.getProduct(999)).rejects.toThrow(NotFoundException)
      await expect(service.getProduct(999)).rejects.toThrow("Product with ID '999' not found")

      expect(repository.findById).toHaveBeenCalledWith(999)
    })
  })

  describe('getProducts', () => {
    it('should return paginated products', async () => {
      const listParams: ListProducts = {}

      const paginationParams: PaginationRequest = {
        page: 1,
        limit: 10,
      }

      const expectedResult: Paginated<Product> = {
        data: [mockProduct],
        paging: createPaginationResponse(1, 1, 10),
      }

      repository.findAll.mockResolvedValue(expectedResult)

      const result = await service.getProducts(listParams, paginationParams)

      expect(repository.findAll).toHaveBeenCalledWith(listParams, paginationParams)
      expect(result).toEqual(expectedResult)
    })

    it('should handle empty results', async () => {
      const listParams: ListProducts = {}

      const paginationParams: PaginationRequest = {
        page: 1,
        limit: 10,
      }

      const expectedResult: Paginated<Product> = {
        data: [],
        paging: createPaginationResponse(0, 1, 10),
      }

      repository.findAll.mockResolvedValue(expectedResult)

      const result = await service.getProducts(listParams, paginationParams)

      expect(result).toEqual(expectedResult)
    })
  })

  describe('updateProduct', () => {
    const updateData: UpdateProduct = {
      name: 'Updated Product',
      price: 60.0,
    }

    it('should update a product successfully', async () => {
      const updatedProduct = { ...mockProduct, ...updateData }
      repository.findById.mockResolvedValueOnce(mockProduct) // First call to check existence
      repository.update.mockResolvedValue(undefined)
      repository.findById.mockResolvedValue(updatedProduct) // Second call to fetch updated product

      const result = await service.updateProduct(1, updateData)

      expect(repository.findById).toHaveBeenCalledTimes(2)
      expect(repository.findById).toHaveBeenNthCalledWith(1, 1)
      expect(repository.update).toHaveBeenCalledWith(1, updateData)
      expect(repository.findById).toHaveBeenNthCalledWith(2, 1)
      expect(result).toEqual(updatedProduct)
    })

    it('should throw NotFoundException when product not found for update', async () => {
      repository.findById.mockRejectedValue(new NotFoundException("Product with ID '999' not found"))

      await expect(service.updateProduct(999, updateData)).rejects.toThrow(NotFoundException)

      expect(repository.findById).toHaveBeenCalledWith(999)
      expect(repository.update).not.toHaveBeenCalled()
    })

    it('should check SKU uniqueness when updating SKU', async () => {
      const updateWithSku: UpdateProduct = { sku: 'NEW-SKU' }
      const existingProduct = { ...mockProduct, id: 2, sku: 'NEW-SKU' }

      repository.findById.mockResolvedValue(mockProduct)
      repository.findBySku.mockResolvedValue(existingProduct)

      await expect(service.updateProduct(1, updateWithSku)).rejects.toThrow(ConflictException)
      await expect(service.updateProduct(1, updateWithSku)).rejects.toThrow("Product with SKU 'NEW-SKU' already exists")

      expect(repository.findById).toHaveBeenCalledWith(1)
      expect(repository.findBySku).toHaveBeenCalledWith('NEW-SKU')
      expect(repository.update).not.toHaveBeenCalled()
    })

    it('should allow updating to same SKU', async () => {
      const updateWithSku: UpdateProduct = { sku: mockProduct.sku }
      const updatedProduct = { ...mockProduct, name: 'Updated' }

      repository.findById.mockResolvedValueOnce(mockProduct) // First call to check existence
      repository.findBySku.mockResolvedValue(mockProduct) // Same product
      repository.update.mockResolvedValue(undefined)
      repository.findById.mockResolvedValue(updatedProduct) // Second call to fetch updated product

      const result = await service.updateProduct(1, updateWithSku)

      expect(result).toEqual(updatedProduct)
      expect(repository.update).toHaveBeenCalledWith(1, updateWithSku)
      expect(repository.findById).toHaveBeenCalledTimes(2)
    })

    it('should allow updating product when SKU is available', async () => {
      const updateWithSku: UpdateProduct = { sku: 'AVAILABLE-SKU' }
      const updatedProduct = { ...mockProduct, sku: 'AVAILABLE-SKU' }

      repository.findById.mockResolvedValueOnce(mockProduct) // First call to check existence
      repository.findBySku.mockRejectedValue(new NotFoundException("Product with SKU 'AVAILABLE-SKU' not found"))
      repository.update.mockResolvedValue(undefined)
      repository.findById.mockResolvedValue(updatedProduct) // Second call to fetch updated product

      const result = await service.updateProduct(1, updateWithSku)

      expect(result).toEqual(updatedProduct)
      expect(repository.findBySku).toHaveBeenCalledWith('AVAILABLE-SKU')
      expect(repository.update).toHaveBeenCalledWith(1, updateWithSku)
      expect(repository.findById).toHaveBeenCalledTimes(2)
    })

    it('should throw BadRequestException on repository error', async () => {
      repository.findById.mockResolvedValue(mockProduct)
      repository.update.mockRejectedValue(new Error('Database error'))

      await expect(service.updateProduct(1, updateData)).rejects.toThrow(BadRequestException)
      await expect(service.updateProduct(1, updateData)).rejects.toThrow('Failed to update product')
    })
  })

  describe('deleteProduct', () => {
    it('should delete a product successfully', async () => {
      repository.findById.mockResolvedValue(mockProduct)
      repository.delete.mockResolvedValue(undefined)

      await service.deleteProduct(1)

      expect(repository.findById).toHaveBeenCalledWith(1)
      expect(repository.delete).toHaveBeenCalledWith(1)
    })

    it('should throw NotFoundException when product not found for deletion', async () => {
      repository.findById.mockRejectedValue(new NotFoundException("Product with ID '999' not found"))

      await expect(service.deleteProduct(999)).rejects.toThrow(NotFoundException)

      expect(repository.findById).toHaveBeenCalledWith(999)
      expect(repository.delete).not.toHaveBeenCalled()
    })

    it('should throw BadRequestException on repository error', async () => {
      repository.findById.mockResolvedValue(mockProduct)
      repository.delete.mockRejectedValue(new Error('Database error'))

      await expect(service.deleteProduct(1)).rejects.toThrow(BadRequestException)
      await expect(service.deleteProduct(1)).rejects.toThrow('Failed to delete product')
    })
  })
})
