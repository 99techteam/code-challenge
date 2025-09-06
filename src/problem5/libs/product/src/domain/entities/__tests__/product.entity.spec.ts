import {
  CreateProductSchema,
  ListProductsSchema,
  ProductCategory,
  ProductSchema,
  UpdateProductSchema,
} from '../product.entity'

describe('Product Entity', () => {
  describe('ProductSchema', () => {
    it('should validate a complete product', () => {
      const validProduct = {
        id: 1,
        name: 'Test Product',
        description: 'A test product',
        price: 99.99,
        sku: 'TEST-001',
        category: ProductCategory.ELECTRONICS,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      expect(() => ProductSchema.parse(validProduct)).not.toThrow()
      const result = ProductSchema.parse(validProduct)
      expect(result).toEqual(validProduct)
    })

    it('should reject invalid price (negative)', () => {
      const invalidProduct = {
        id: 1,
        name: 'Test Product',
        price: -100, // Invalid negative price
        sku: 'TEST-001',
        category: ProductCategory.ELECTRONICS,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      expect(() => ProductSchema.parse(invalidProduct)).toThrow()
    })

    it('should reject invalid price (zero)', () => {
      const invalidProduct = {
        id: 1,
        name: 'Test Product',
        price: 0, // Invalid zero price
        sku: 'TEST-001',
        category: ProductCategory.ELECTRONICS,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      expect(() => ProductSchema.parse(invalidProduct)).toThrow()
    })

    it('should handle nullable description', () => {
      const productWithoutDescription = {
        id: 1,
        name: 'Test Product',
        description: null,
        price: 50.0,
        sku: 'TEST-001',
        category: ProductCategory.ELECTRONICS,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      expect(() => ProductSchema.parse(productWithoutDescription)).not.toThrow()
    })

    it('should reject invalid category', () => {
      const invalidProduct = {
        id: 1,
        name: 'Test Product',
        price: 50.0,
        sku: 'TEST-001',
        category: 'INVALID_CATEGORY',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      expect(() => ProductSchema.parse(invalidProduct)).toThrow()
    })
  })

  describe('CreateProductSchema', () => {
    it('should validate create product data', () => {
      const createData = {
        name: 'New Product',
        description: 'A new product',
        price: 50.0,
        sku: 'NEW-001',
        category: ProductCategory.BOOKS,
        isActive: true,
      }

      expect(() => CreateProductSchema.parse(createData)).not.toThrow()
      const result = CreateProductSchema.parse(createData)
      expect(result).toEqual(createData)
    })

    it('should apply default isActive value', () => {
      const createData = {
        name: 'New Product',
        price: 50.0,
        sku: 'NEW-001',
        category: ProductCategory.BOOKS,
      }

      const result = CreateProductSchema.parse(createData)
      expect(result.isActive).toBe(true)
    })

    it('should reject empty name', () => {
      const invalidData = {
        name: '',
        price: 50.0,
        sku: 'NEW-001',
        category: ProductCategory.BOOKS,
      }

      expect(() => CreateProductSchema.parse(invalidData)).toThrow()
    })

    it('should reject long name', () => {
      const invalidData = {
        name: 'a'.repeat(256), // Too long
        price: 50.0,
        sku: 'NEW-001',
        category: ProductCategory.BOOKS,
      }

      expect(() => CreateProductSchema.parse(invalidData)).toThrow()
    })

    it('should reject long SKU', () => {
      const invalidData = {
        name: 'Valid Product',
        price: 50.0,
        sku: 'a'.repeat(101), // Too long
        category: ProductCategory.BOOKS,
      }

      expect(() => CreateProductSchema.parse(invalidData)).toThrow()
    })
  })

  describe('UpdateProductSchema', () => {
    it('should validate partial update data', () => {
      const updateData = {
        name: 'Updated Product',
        price: 60.0,
      }

      expect(() => UpdateProductSchema.parse(updateData)).not.toThrow()
      const result = UpdateProductSchema.parse(updateData)
      expect(result).toEqual(updateData)
    })

    it('should allow empty update data', () => {
      const updateData = {}

      expect(() => UpdateProductSchema.parse(updateData)).not.toThrow()
    })

    it('should allow updating single fields', () => {
      const testCases = [
        { name: 'New Name' },
        { description: 'New description' },
        { price: 70.0 },
        { sku: 'NEW-SKU' },
        { category: ProductCategory.SPORTS },
        { isActive: false },
      ]

      testCases.forEach((testCase) => {
        expect(() => UpdateProductSchema.parse(testCase)).not.toThrow()
      })
    })
  })

  describe('ListProductsSchema', () => {
    it('should handle empty parameters', () => {
      const listParams = {}

      const result = ListProductsSchema.parse(listParams)
      expect(result).toEqual({})
    })

    it('should validate custom parameters', () => {
      const listParams = {
        category: ProductCategory.ELECTRONICS,
        isActive: true,
        search: 'test query',
        priceMin: 10.0,
        priceMax: 50.0,
      }

      expect(() => ListProductsSchema.parse(listParams)).not.toThrow()
      const result = ListProductsSchema.parse(listParams)
      expect(result).toEqual(listParams)
    })

    it('should reject invalid price values', () => {
      const invalidParams = { priceMin: -1 }

      expect(() => ListProductsSchema.parse(invalidParams)).toThrow()
    })

    it('should handle boolean coercion for isActive', () => {
      const listParams = { isActive: 'true' as any }

      const result = ListProductsSchema.parse(listParams)
      expect(result.isActive).toBe(true)
    })
  })

  describe('ProductCategory enum', () => {
    it('should contain all expected categories', () => {
      const expectedCategories = ['electronics', 'clothing', 'books', 'home', 'sports']

      const actualCategories = Object.values(ProductCategory)
      expect(actualCategories).toEqual(expect.arrayContaining(expectedCategories))
      expect(actualCategories).toHaveLength(expectedCategories.length)
    })
  })
})
