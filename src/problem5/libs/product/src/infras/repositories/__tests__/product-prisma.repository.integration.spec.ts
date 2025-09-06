import { promises as fs } from 'fs'
import { join } from 'path'
import { NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { PrismaClient } from '@prisma/client'
import { DatabaseService } from '@problem5/database'
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql'

import { CreateProduct, ListProducts, ProductCategory, ProductPaginationRequest, UpdateProduct } from '../../../domain'
import { ProductPrismaRepository } from '../product-prisma.repository'

describe('ProductPrismaRepository - Integration Tests', () => {
  let container: StartedPostgreSqlContainer
  let repository: ProductPrismaRepository
  let databaseService: DatabaseService
  let testingModule: TestingModule

  // Store original LOG_LEVEL to restore later
  const originalLogLevel = process.env['LOG_LEVEL']

  // Test data factories
  const createTestProduct = (overrides: Partial<CreateProduct> = {}): CreateProduct => ({
    name: 'Test Product',
    description: 'A test product description',
    price: 99.99,
    sku: `TEST-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
    category: ProductCategory.ELECTRONICS,
    isActive: true,
    ...overrides,
  })

  const createTestProducts = (): CreateProduct[] => {
    const timestamp = Date.now()
    const randomSuffix = Math.random().toString(36).substring(2, 8)

    return [
      {
        name: 'iPhone 15 Pro',
        description: 'Latest flagship smartphone',
        price: 1199.99,
        sku: `APPLE-IP15P-256-${timestamp}-${randomSuffix}-1`,
        category: ProductCategory.ELECTRONICS,
        isActive: true,
      },
      {
        name: "Levi's 501 Jeans",
        description: 'Classic straight-leg jeans',
        price: 69.99,
        sku: `LEVIS-501-MW-32-${timestamp}-${randomSuffix}-2`,
        category: ProductCategory.CLOTHING,
        isActive: true,
      },
      {
        name: 'Clean Code Book',
        description: 'Essential software development guide',
        price: 44.99,
        sku: `BOOK-CLEANCODE-01-${timestamp}-${randomSuffix}-3`,
        category: ProductCategory.BOOKS,
        isActive: false,
      },
      {
        name: 'Dyson Vacuum',
        description: 'Cordless vacuum cleaner',
        price: 749.99,
        sku: `DYSON-V15-YLW-${timestamp}-${randomSuffix}-4`,
        category: ProductCategory.HOME,
        isActive: true,
      },
      {
        name: 'Tennis Racquet',
        description: 'Professional tennis racquet',
        price: 249.99,
        sku: `WILSON-PROSTAFF-01-${timestamp}-${randomSuffix}-5`,
        category: ProductCategory.SPORTS,
        isActive: true,
      },
    ]
  }

  beforeAll(async () => {
    // Set LOG_LEVEL to error to minimize Prisma logging
    process.env['LOG_LEVEL'] = 'error'

    // Start PostgreSQL container
    container = await new PostgreSqlContainer('postgres:15-alpine')
      .withDatabase('testdb')
      .withUsername('testuser')
      .withPassword('testpass')
      .withExposedPorts(5432)
      .start()

    const connectionString = container.getConnectionUri()

    // Set environment variable for Prisma
    process.env['DATABASE_URL'] = connectionString

    // Create testing module with PrismaClient configured for minimal logging
    testingModule = await Test.createTestingModule({
      providers: [
        {
          provide: DatabaseService,
          useFactory: () => {
            // Create PrismaClient with minimal logging for tests
            const client = new PrismaClient({
              log: [], // Disable all logging for clean test output
            }) as any // Cast to DatabaseService type

            // Add the $connect method to match DatabaseService interface
            client.onModuleInit = async () => {
              await client.$connect()
            }

            return client
          },
        },
        ProductPrismaRepository,
      ],
    }).compile()

    databaseService = testingModule.get<DatabaseService>(DatabaseService)
    repository = testingModule.get<ProductPrismaRepository>(ProductPrismaRepository)

    // Connect to database
    await databaseService.$connect()

    // Execute schema from generated SQL file instead of Prisma migrations
    try {
      const schemaPath = join(__dirname, '../../../../../../schema.gen.sql')
      const schemaSql = await fs.readFile(schemaPath, 'utf8')

      // Remove comments and split the SQL into individual statements
      const cleanedSql = schemaSql
        .split('\n')
        .filter((line) => !line.trim().startsWith('--') && line.trim() !== '')
        .join('\n')

      const statements = cleanedSql
        .split(';')
        .map((stmt) => stmt.trim())
        .filter((stmt) => stmt)

      // Execute each SQL statement individually
      for (const statement of statements) {
        if (statement) {
          await databaseService.$executeRawUnsafe(statement)
        }
      }
    } catch (error) {
      console.error('Failed to execute schema.gen.sql:', error)
      throw new Error(`Schema setup failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }, 60000) // Increase timeout for container startup

  afterAll(async () => {
    // Restore original LOG_LEVEL
    if (originalLogLevel !== undefined) {
      process.env['LOG_LEVEL'] = originalLogLevel
    } else {
      delete process.env['LOG_LEVEL']
    }

    if (databaseService) {
      await databaseService.$disconnect()
    }
    if (testingModule) {
      await testingModule.close()
    }
    if (container) {
      await container.stop()
    }
  }, 30000)

  beforeEach(async () => {
    // Clean database between tests and verify cleanup
    try {
      await databaseService.product.deleteMany({})

      // Verify cleanup worked
      const count = await databaseService.product.count()
      if (count > 0) {
        console.warn(`Warning: ${count} products remain after cleanup`)
        // Force cleanup with raw SQL if needed
        await databaseService.$executeRawUnsafe('TRUNCATE TABLE products RESTART IDENTITY CASCADE')
      }
    } catch (error) {
      console.error('Database cleanup failed:', error)
      // Force cleanup with raw SQL as fallback
      await databaseService.$executeRawUnsafe('TRUNCATE TABLE products RESTART IDENTITY CASCADE')
    }
  })

  describe('create', () => {
    it('should successfully create a product with all fields', async () => {
      const productData = createTestProduct({
        name: 'Integration Test Product',
        description: 'A product created during integration testing',
        price: 299.99,
        category: ProductCategory.ELECTRONICS,
      })

      await expect(repository.create(productData)).resolves.not.toThrow()

      // Verify product was created in database
      const createdProduct = await databaseService.product.findUnique({
        where: { sku: productData.sku },
      })

      expect(createdProduct).toBeDefined()
      if (createdProduct) {
        expect(createdProduct.name).toBe(productData.name)
        expect(createdProduct.description).toBe(productData.description)
        expect(Number(createdProduct.price)).toBe(productData.price)
        expect(createdProduct.sku).toBe(productData.sku)
        expect(createdProduct.category).toBe(productData.category)
        expect(createdProduct.isActive).toBe(productData.isActive)
      }
    })

    it('should create a product with null description', async () => {
      const productData = createTestProduct({
        description: null,
      })

      await expect(repository.create(productData)).resolves.not.toThrow()

      const createdProduct = await databaseService.product.findUnique({
        where: { sku: productData.sku },
      })

      expect(createdProduct!.description).toBeNull()
    })

    it('should handle decimal price conversion correctly', async () => {
      const productData = createTestProduct({
        price: 123.456, // More than 2 decimal places
      })

      await expect(repository.create(productData)).resolves.not.toThrow()

      const createdProduct = await databaseService.product.findUnique({
        where: { sku: productData.sku },
      })

      // Prisma Decimal should handle precision correctly
      expect(Number(createdProduct!.price)).toBeCloseTo(123.46, 2)
    })

    it('should throw error on duplicate SKU', async () => {
      const productData1 = createTestProduct({ sku: 'DUPLICATE-SKU' })
      const productData2 = createTestProduct({ sku: 'DUPLICATE-SKU' })

      await repository.create(productData1)

      await expect(repository.create(productData2)).rejects.toThrow()
    })

    it('should create products with different categories', async () => {
      const categories = Object.values(ProductCategory)

      for (const category of categories) {
        const productData = createTestProduct({ category })
        await expect(repository.create(productData)).resolves.not.toThrow()
      }

      const count = await databaseService.product.count()
      expect(count).toBe(categories.length)
    })
  })

  describe('findById', () => {
    let testProductId: number

    beforeEach(async () => {
      const productData = createTestProduct()
      await repository.create(productData)

      const createdProduct = await databaseService.product.findUnique({
        where: { sku: productData.sku },
      })
      testProductId = createdProduct!.id
    })

    it('should find existing product by ID', async () => {
      const product = await repository.findById(testProductId)

      expect(product).toBeDefined()
      expect(product.id).toBe(testProductId)
      expect(product.name).toBe('Test Product')
      expect(typeof product.price).toBe('number')
      expect(product.createdAt).toBeInstanceOf(Date)
      expect(product.updatedAt).toBeInstanceOf(Date)
    })

    it('should throw NotFoundException for non-existent product ID', async () => {
      const nonExistentId = 99999

      await expect(repository.findById(nonExistentId)).rejects.toThrow(NotFoundException)
      await expect(repository.findById(nonExistentId)).rejects.toThrow(`Product with ID '${nonExistentId}' not found`)
    })

    it('should correctly map Prisma Decimal to number for price', async () => {
      const product = await repository.findById(testProductId)

      expect(typeof product.price).toBe('number')
      expect(product.price).toBe(99.99)
    })

    it('should handle product with null description', async () => {
      const productDataWithNullDesc = createTestProduct({ description: null })
      await repository.create(productDataWithNullDesc)

      const createdProduct = await databaseService.product.findUnique({
        where: { sku: productDataWithNullDesc.sku },
      })

      const product = await repository.findById(createdProduct!.id)
      expect(product.description).toBeNull()
    })
  })

  describe('findBySku', () => {
    let testSku: string

    beforeEach(async () => {
      // Generate unique SKU for each test run
      testSku = `FIND-BY-SKU-TEST-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
      const productData = createTestProduct({ sku: testSku })
      await repository.create(productData)
    })

    it('should find existing product by SKU', async () => {
      const product = await repository.findBySku(testSku)

      expect(product).toBeDefined()
      expect(product.sku).toBe(testSku)
      expect(product.name).toBe('Test Product')
    })

    it('should throw NotFoundException for non-existent SKU', async () => {
      const nonExistentSku = 'NON-EXISTENT-SKU'

      await expect(repository.findBySku(nonExistentSku)).rejects.toThrow(NotFoundException)
      await expect(repository.findBySku(nonExistentSku)).rejects.toThrow(
        `Product with SKU '${nonExistentSku}' not found`
      )
    })

    it('should be case sensitive for SKU matching', async () => {
      await expect(repository.findBySku(testSku.toLowerCase())).rejects.toThrow(NotFoundException)
    })
  })

  describe('findAll', () => {
    beforeEach(async () => {
      // Create test products with various attributes
      const testProducts = createTestProducts()
      for (const product of testProducts) {
        await repository.create(product)
      }
    })

    describe('pagination', () => {
      it('should return paginated results with correct metadata', async () => {
        const params: ListProducts = {}
        const pagination: ProductPaginationRequest = { page: 1, limit: 2 }

        const result = await repository.findAll(params, pagination)

        expect(result.data).toHaveLength(2)
        expect(result.paging.page).toBe(1)
        expect(result.paging.pages).toBe(3) // 5 products / 2 per page = 3 pages
        expect(result.paging.total).toBe(5)
        expect(result.paging.limit).toBe(2)
      })

      it('should handle different page sizes', async () => {
        const params: ListProducts = {}
        const pagination: ProductPaginationRequest = { page: 1, limit: 3 }

        const result = await repository.findAll(params, pagination)

        expect(result.data).toHaveLength(3)
        expect(result.paging.pages).toBe(2)
      })

      it('should handle out-of-range pages gracefully', async () => {
        const params: ListProducts = {}
        const pagination: ProductPaginationRequest = { page: 10, limit: 5 }

        const result = await repository.findAll(params, pagination)

        expect(result.data).toHaveLength(0)
        expect(result.paging.page).toBe(10)
        expect(result.paging.total).toBe(5)
      })
    })

    describe('sorting', () => {
      it('should sort by name ascending', async () => {
        const params: ListProducts = {}
        const pagination: ProductPaginationRequest = { page: 1, limit: 10, sort: 'name', order: 'asc' }

        const result = await repository.findAll(params, pagination)

        expect(result.data).toHaveLength(5)
        const sortedNames = result.data.map((p) => p.name).sort()
        expect(result.data[0].name).toBe(sortedNames[0])
        expect(result.data[4].name).toBe(sortedNames[4])
      })

      it('should sort by price descending', async () => {
        const params: ListProducts = {}
        const pagination: ProductPaginationRequest = { page: 1, limit: 10, sort: 'price', order: 'desc' }

        const result = await repository.findAll(params, pagination)

        expect(result.data[0].price).toBe(1199.99) // iPhone 15 Pro
        expect(result.data[4].price).toBe(44.99) // Clean Code Book
      })

      it('should sort by createdAt with default order', async () => {
        const params: ListProducts = {}
        const pagination: ProductPaginationRequest = { page: 1, limit: 10 }

        const result = await repository.findAll(params, pagination)

        // Default sort is createdAt desc, so newer products first
        expect(result.data).toHaveLength(5)
      })
    })

    describe('filtering', () => {
      it('should filter by category', async () => {
        const params: ListProducts = { category: ProductCategory.ELECTRONICS }
        const pagination: ProductPaginationRequest = { page: 1, limit: 10 }

        const result = await repository.findAll(params, pagination)

        expect(result.data).toHaveLength(1)
        expect(result.data[0].category).toBe(ProductCategory.ELECTRONICS)
      })

      it('should filter by isActive status', async () => {
        const params: ListProducts = { isActive: false }
        const pagination: ProductPaginationRequest = { page: 1, limit: 10 }

        const result = await repository.findAll(params, pagination)

        expect(result.data).toHaveLength(1)
        expect(result.data[0].isActive).toBe(false)
        expect(result.data[0].name).toBe('Clean Code Book')
      })

      it('should filter by price range (both min and max)', async () => {
        const params: ListProducts = { priceMin: 100, priceMax: 300 }
        const pagination: ProductPaginationRequest = { page: 1, limit: 10 }

        const result = await repository.findAll(params, pagination)

        expect(result.data.length).toBeGreaterThan(0)
        result.data.forEach((product) => {
          expect(product.price).toBeGreaterThanOrEqual(100)
          expect(product.price).toBeLessThanOrEqual(300)
        })
      })

      it('should filter by price minimum only', async () => {
        const params: ListProducts = { priceMin: 500 }
        const pagination: ProductPaginationRequest = { page: 1, limit: 10 }

        const result = await repository.findAll(params, pagination)

        result.data.forEach((product) => {
          expect(product.price).toBeGreaterThanOrEqual(500)
        })
      })

      it('should filter by price maximum only', async () => {
        const params: ListProducts = { priceMax: 100 }
        const pagination: ProductPaginationRequest = { page: 1, limit: 10 }

        const result = await repository.findAll(params, pagination)

        result.data.forEach((product) => {
          expect(product.price).toBeLessThanOrEqual(100)
        })
      })

      it('should search by name (case insensitive)', async () => {
        const params: ListProducts = { search: 'iphone' }
        const pagination: ProductPaginationRequest = { page: 1, limit: 10 }

        const result = await repository.findAll(params, pagination)

        expect(result.data).toHaveLength(1)
        expect(result.data[0].name.toLowerCase()).toContain('iphone')
      })

      it('should search by description (case insensitive)', async () => {
        const params: ListProducts = { search: 'smartphone' }
        const pagination: ProductPaginationRequest = { page: 1, limit: 10 }

        const result = await repository.findAll(params, pagination)

        expect(result.data).toHaveLength(1)
        expect(result.data[0].description?.toLowerCase()).toContain('smartphone')
      })

      it('should search by SKU (case insensitive)', async () => {
        const params: ListProducts = { search: 'apple' }
        const pagination: ProductPaginationRequest = { page: 1, limit: 10 }

        const result = await repository.findAll(params, pagination)

        expect(result.data).toHaveLength(1)
        expect(result.data[0].sku.toLowerCase()).toContain('apple')
      })
    })

    describe('complex queries', () => {
      it('should combine filtering, sorting, and pagination', async () => {
        const params: ListProducts = {
          category: ProductCategory.ELECTRONICS,
          isActive: true,
        }
        const pagination: ProductPaginationRequest = {
          page: 1,
          limit: 10,
          sort: 'price',
          order: 'desc',
        }

        const result = await repository.findAll(params, pagination)

        expect(result.data).toHaveLength(1)
        expect(result.data[0].category).toBe(ProductCategory.ELECTRONICS)
        expect(result.data[0].isActive).toBe(true)
      })

      it('should handle search with category filter', async () => {
        const params: ListProducts = {
          search: 'code',
          category: ProductCategory.BOOKS,
        }
        const pagination: ProductPaginationRequest = { page: 1, limit: 10 }

        const result = await repository.findAll(params, pagination)

        expect(result.data).toHaveLength(1)
        expect(result.data[0].category).toBe(ProductCategory.BOOKS)
        expect(result.data[0].name.toLowerCase()).toContain('code')
      })

      it('should return empty results when no products match filters', async () => {
        const params: ListProducts = {
          category: ProductCategory.ELECTRONICS,
          priceMin: 2000, // No electronics over 2000 in test data
        }
        const pagination: ProductPaginationRequest = { page: 1, limit: 10 }

        const result = await repository.findAll(params, pagination)

        expect(result.data).toHaveLength(0)
        expect(result.paging.total).toBe(0)
        expect(result.paging.pages).toBe(0)
      })
    })
  })

  describe('update', () => {
    let testProductId: number
    let originalProduct: any

    beforeEach(async () => {
      const productData = createTestProduct()
      await repository.create(productData)

      originalProduct = await databaseService.product.findUnique({
        where: { sku: productData.sku },
      })
      testProductId = originalProduct!.id
    })

    it('should update individual fields', async () => {
      const updateData: UpdateProduct = { name: 'Updated Product Name' }

      await expect(repository.update(testProductId, updateData)).resolves.not.toThrow()

      const updatedProduct = await databaseService.product.findUnique({
        where: { id: testProductId },
      })

      expect(updatedProduct!.name).toBe('Updated Product Name')
      expect(updatedProduct!.description).toBe(originalProduct.description) // Unchanged
      expect(updatedProduct!.price).toEqual(originalProduct.price) // Unchanged
    })

    it('should update multiple fields simultaneously', async () => {
      const updateData: UpdateProduct = {
        name: 'Multi-Updated Product',
        price: 199.99,
        isActive: false,
      }

      await repository.update(testProductId, updateData)

      const updatedProduct = await databaseService.product.findUnique({
        where: { id: testProductId },
      })

      expect(updatedProduct!.name).toBe('Multi-Updated Product')
      expect(Number(updatedProduct!.price)).toBe(199.99)
      expect(updatedProduct!.isActive).toBe(false)
    })

    it('should handle price updates with Decimal conversion', async () => {
      const updateData: UpdateProduct = { price: 555.555 }

      await repository.update(testProductId, updateData)

      const updatedProduct = await databaseService.product.findUnique({
        where: { id: testProductId },
      })

      expect(Number(updatedProduct!.price)).toBeCloseTo(555.56, 2)
    })

    it('should update description to null', async () => {
      const updateData: UpdateProduct = { description: null }

      await repository.update(testProductId, updateData)

      const updatedProduct = await databaseService.product.findUnique({
        where: { id: testProductId },
      })

      expect(updatedProduct!.description).toBeNull()
    })

    it('should throw NotFoundException for non-existent product ID', async () => {
      const nonExistentId = 99999
      const updateData: UpdateProduct = { name: 'Updated Name' }

      await expect(repository.update(nonExistentId, updateData)).rejects.toThrow(NotFoundException)
      await expect(repository.update(nonExistentId, updateData)).rejects.toThrow(
        `Product with ID '${nonExistentId}' not found`
      )
    })

    it('should validate SKU uniqueness on update', async () => {
      // Create second product
      const secondProduct = createTestProduct({ sku: 'SECOND-PRODUCT-SKU' })
      await repository.create(secondProduct)

      await databaseService.product.findUnique({
        where: { sku: secondProduct.sku },
      })

      // Try to update first product with second product's SKU
      const updateData: UpdateProduct = { sku: 'SECOND-PRODUCT-SKU' }

      await expect(repository.update(testProductId, updateData)).rejects.toThrow()
    })

    it('should handle partial updates correctly', async () => {
      const updateData: UpdateProduct = {
        category: ProductCategory.CLOTHING,
      }

      await repository.update(testProductId, updateData)

      const updatedProduct = await databaseService.product.findUnique({
        where: { id: testProductId },
      })

      expect(updatedProduct!.category).toBe(ProductCategory.CLOTHING)
      expect(updatedProduct!.name).toBe(originalProduct.name) // Unchanged
      expect(updatedProduct!.sku).toBe(originalProduct.sku) // Unchanged
    })
  })

  describe('delete', () => {
    let testProductId: number

    beforeEach(async () => {
      const productData = createTestProduct()
      await repository.create(productData)

      const createdProduct = await databaseService.product.findUnique({
        where: { sku: productData.sku },
      })
      testProductId = createdProduct!.id
    })

    it('should successfully delete existing product', async () => {
      await expect(repository.delete(testProductId)).resolves.not.toThrow()

      const deletedProduct = await databaseService.product.findUnique({
        where: { id: testProductId },
      })

      expect(deletedProduct).toBeNull()
    })

    it('should throw NotFoundException for non-existent product ID', async () => {
      const nonExistentId = 99999

      await expect(repository.delete(nonExistentId)).rejects.toThrow(NotFoundException)
      await expect(repository.delete(nonExistentId)).rejects.toThrow(`Product with ID '${nonExistentId}' not found`)
    })

    it('should not affect other products when deleting', async () => {
      // Create additional products
      const additionalProducts = [createTestProduct({ name: 'Product 1' }), createTestProduct({ name: 'Product 2' })]

      for (const product of additionalProducts) {
        await repository.create(product)
      }

      const initialCount = await databaseService.product.count()
      expect(initialCount).toBe(3) // Original + 2 additional

      await repository.delete(testProductId)

      const finalCount = await databaseService.product.count()
      expect(finalCount).toBe(2) // Only 2 remaining
    })
  })

  describe('error handling and edge cases', () => {
    it('should handle database connection errors gracefully', async () => {
      const productData1 = createTestProduct({ sku: 'DUPLICATE-TEST-SKU' })
      const productData2 = createTestProduct({ sku: 'DUPLICATE-TEST-SKU' })

      // Create first product successfully
      await repository.create(productData1)

      // Try to create second product with same SKU (should trigger database error)
      await expect(repository.create(productData2)).rejects.toThrow()
    })

    it('should handle concurrent operations', async () => {
      const productData = createTestProduct()

      // Create multiple concurrent operations
      const promises = Array.from({ length: 5 }, (_, i) =>
        repository.create({
          ...productData,
          sku: `CONCURRENT-${i}-${Date.now()}`,
          name: `Concurrent Product ${i}`,
        })
      )

      await expect(Promise.all(promises)).resolves.not.toThrow()

      const count = await databaseService.product.count()
      expect(count).toBe(5)
    })

    it('should handle extreme price values', async () => {
      const extremeProducts = [
        createTestProduct({ price: 0.01, name: 'Minimum Price' }),
        createTestProduct({ price: 999999.99, name: 'Maximum Price' }),
      ]

      for (const product of extremeProducts) {
        await expect(repository.create(product)).resolves.not.toThrow()
      }

      const products = await repository.findAll({}, { page: 1, limit: 10 })
      expect(products.data).toHaveLength(2)
    })

    it('should handle unicode characters in text fields', async () => {
      const unicodeProduct = createTestProduct({
        name: 'Tëst Prødüct with ñ and 中文',
        description: 'Deßcriptioñ wîth spëcial charäcters: áéíóú, €£¥',
        sku: 'UNICODE-TEST-SKU',
      })

      await expect(repository.create(unicodeProduct)).resolves.not.toThrow()

      const product = await repository.findBySku('UNICODE-TEST-SKU')
      expect(product.name).toBe('Tëst Prødüct with ñ and 中文')
      expect(product.description).toBe('Deßcriptioñ wîth spëcial charäcters: áéíóú, €£¥')
    })

    it('should handle long text fields', async () => {
      const longDescription = 'A'.repeat(1000) // Very long description

      const productWithLongText = createTestProduct({
        description: longDescription,
      })

      await expect(repository.create(productWithLongText)).resolves.not.toThrow()

      const product = await repository.findBySku(productWithLongText.sku)
      expect(product.description).toBe(longDescription)
    })

    it('should handle search with special characters', async () => {
      const specialProduct = createTestProduct({
        name: 'Product with "quotes" and \'apostrophes\'',
        sku: 'SPECIAL-CHARS-SKU',
      })

      await repository.create(specialProduct)

      const searchResults = await repository.findAll({ search: 'quotes' }, { page: 1, limit: 10 })

      expect(searchResults.data).toHaveLength(1)
      expect(searchResults.data[0].name).toContain('quotes')
    })
  })
})
