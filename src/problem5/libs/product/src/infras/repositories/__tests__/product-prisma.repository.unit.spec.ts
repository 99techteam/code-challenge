import { Decimal } from '@prisma/client/runtime/library'
import { DatabaseService } from '@problem5/database'

import { ProductCategory } from '../../../domain'
import { ProductPrismaRepository } from '../product-prisma.repository'

describe('ProductPrismaRepository - Unit Tests', () => {
  let repository: ProductPrismaRepository
  let mockDatabase: jest.Mocked<DatabaseService>

  beforeEach(() => {
    mockDatabase = {
      product: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
    } as any

    repository = new ProductPrismaRepository(mockDatabase)
  })

  describe('Helper Methods', () => {
    it('should map Prisma product to domain entity', () => {
      const mockPrismaProduct = {
        id: 1,
        name: 'Test Product',
        description: 'A test product',
        price: new Decimal('99.99'),
        sku: 'TEST-001',
        category: 'electronics',
        isActive: true,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
      }

      // Access private method for testing
      const toProductEntity = (repository as any).toProductEntity.bind(repository)

      const result = toProductEntity(mockPrismaProduct)

      expect(result).toEqual({
        id: 1,
        name: 'Test Product',
        description: 'A test product',
        price: 99.99, // Number format
        sku: 'TEST-001',
        category: ProductCategory.ELECTRONICS,
        isActive: true,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
      })
    })

    it('should handle null description in mapping', () => {
      const mockPrismaProduct = {
        id: 1,
        name: 'Test Product',
        description: null,
        price: new Decimal('50.00'),
        sku: 'TEST-001',
        category: 'books',
        isActive: false,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
      }

      // Access private method for testing
      const toProductEntity = (repository as any).toProductEntity.bind(repository)

      const result = toProductEntity(mockPrismaProduct)

      expect(result.description).toBeNull()
      expect(result.price).toBe(50) // Number format
      expect(result.category).toBe(ProductCategory.BOOKS)
      expect(result.isActive).toBe(false)
    })
  })

  describe('Database Method Structure', () => {
    it('should have all required repository methods', () => {
      expect(repository.create).toBeDefined()
      expect(repository.findById).toBeDefined()
      expect(repository.findBySku).toBeDefined()
      expect(repository.findAll).toBeDefined()
      expect(repository.update).toBeDefined()
      expect(repository.delete).toBeDefined()
    })

    it('should be injectable', () => {
      expect(repository).toBeInstanceOf(ProductPrismaRepository)
    })
  })
})
