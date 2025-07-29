import {
  CreateBookSchema,
  UpdateBookSchema,
  BookFiltersSchema,
  BookGenreEnum,
} from '../index';

describe('Validation Schemas', () => {
  describe('CreateBookSchema', () => {
    it('should validate valid book data', () => {
      const validBookData = {
        title: 'Test Book',
        author: 'Test Author',
        isbn: '1234567890123',
        publishedYear: 2023,
        genre: 'FICTION',
        description: 'A test book description',
        price: 29.99,
      };

      const result = CreateBookSchema.safeParse(validBookData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validBookData);
      }
    });

    it('should validate book data without optional fields', () => {
      const validBookData = {
        title: 'Test Book',
        author: 'Test Author',
        isbn: '1234567890123',
        publishedYear: 2023,
        genre: 'FICTION',
      };

      const result = CreateBookSchema.safeParse(validBookData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validBookData);
      }
    });

    it('should reject empty title', () => {
      const invalidBookData = {
        title: '',
        author: 'Test Author',
        isbn: '1234567890123',
        publishedYear: 2023,
        genre: 'FICTION',
      };

      const result = CreateBookSchema.safeParse(invalidBookData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['title']);
        expect(result.error.issues[0].message).toBe('Title is required');
      }
    });

    it('should reject title longer than 255 characters', () => {
      const invalidBookData = {
        title: 'a'.repeat(256),
        author: 'Test Author',
        isbn: '1234567890123',
        publishedYear: 2023,
        genre: 'FICTION',
      };

      const result = CreateBookSchema.safeParse(invalidBookData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['title']);
        expect(result.error.issues[0].message).toBe('Title too long');
      }
    });

    it('should reject empty author', () => {
      const invalidBookData = {
        title: 'Test Book',
        author: '',
        isbn: '1234567890123',
        publishedYear: 2023,
        genre: 'FICTION',
      };

      const result = CreateBookSchema.safeParse(invalidBookData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['author']);
        expect(result.error.issues[0].message).toBe('Author is required');
      }
    });

    it('should reject ISBN shorter than 10 characters', () => {
      const invalidBookData = {
        title: 'Test Book',
        author: 'Test Author',
        isbn: '123456789',
        publishedYear: 2023,
        genre: 'FICTION',
      };

      const result = CreateBookSchema.safeParse(invalidBookData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['isbn']);
        expect(result.error.issues[0].message).toBe('ISBN must be at least 10 characters');
      }
    });

    it('should reject ISBN longer than 13 characters', () => {
      const invalidBookData = {
        title: 'Test Book',
        author: 'Test Author',
        isbn: '12345678901234',
        publishedYear: 2023,
        genre: 'FICTION',
      };

      const result = CreateBookSchema.safeParse(invalidBookData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['isbn']);
        expect(result.error.issues[0].message).toBe('ISBN too long');
      }
    });

    it('should reject published year before 1800', () => {
      const invalidBookData = {
        title: 'Test Book',
        author: 'Test Author',
        isbn: '1234567890123',
        publishedYear: 1799,
        genre: 'FICTION',
      };

      const result = CreateBookSchema.safeParse(invalidBookData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['publishedYear']);
      }
    });

    it('should reject published year after current year', () => {
      const nextYear = new Date().getFullYear() + 1;
      const invalidBookData = {
        title: 'Test Book',
        author: 'Test Author',
        isbn: '1234567890123',
        publishedYear: nextYear,
        genre: 'FICTION',
      };

      const result = CreateBookSchema.safeParse(invalidBookData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['publishedYear']);
      }
    });

    it('should reject invalid genre', () => {
      const invalidBookData = {
        title: 'Test Book',
        author: 'Test Author',
        isbn: '1234567890123',
        publishedYear: 2023,
        genre: 'INVALID_GENRE',
      };

      const result = CreateBookSchema.safeParse(invalidBookData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['genre']);
      }
    });

    it('should reject negative price', () => {
      const invalidBookData = {
        title: 'Test Book',
        author: 'Test Author',
        isbn: '1234567890123',
        publishedYear: 2023,
        genre: 'FICTION',
        price: -10,
      };

      const result = CreateBookSchema.safeParse(invalidBookData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['price']);
        expect(result.error.issues[0].message).toBe('Price must be positive');
      }
    });

    it('should accept zero price', () => {
      const validBookData = {
        title: 'Test Book',
        author: 'Test Author',
        isbn: '1234567890123',
        publishedYear: 2023,
        genre: 'FICTION',
        price: 0,
      };

      const result = CreateBookSchema.safeParse(validBookData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['price']);
        expect(result.error.issues[0].message).toBe('Price must be positive');
      }
    });
  });

  describe('UpdateBookSchema', () => {
    it('should validate valid update data', () => {
      const validUpdateData = {
        title: 'Updated Book',
        author: 'Updated Author',
        isbn: '9876543210987',
        publishedYear: 2024,
        genre: 'NON_FICTION',
        description: 'Updated description',
        price: 39.99,
      };

      const result = UpdateBookSchema.safeParse(validUpdateData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validUpdateData);
      }
    });

    it('should validate partial update data', () => {
      const partialUpdateData = {
        title: 'Updated Book',
        price: 39.99,
      };

      const result = UpdateBookSchema.safeParse(partialUpdateData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(partialUpdateData);
      }
    });

    it('should reject empty title', () => {
      const invalidUpdateData = {
        title: '',
      };

      const result = UpdateBookSchema.safeParse(invalidUpdateData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['title']);
        expect(result.error.issues[0].message).toBe('Title is required');
      }
    });

    it('should reject negative price', () => {
      const invalidUpdateData = {
        price: -10,
      };

      const result = UpdateBookSchema.safeParse(invalidUpdateData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['price']);
        expect(result.error.issues[0].message).toBe('Price must be positive');
      }
    });
  });

  describe('BookFiltersSchema', () => {
    it('should validate valid filters', () => {
      const validFilters = {
        title: 'Test',
        author: 'Author',
        isbn: '1234567890123',
        genre: 'FICTION',
        minPublishedYear: 2020,
        maxPublishedYear: 2025,
        minPrice: 10,
        maxPrice: 50,
        limit: 10,
        offset: 0,
      };

      const result = BookFiltersSchema.safeParse(validFilters);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validFilters);
      }
    });

    it('should validate empty filters', () => {
      const emptyFilters = {};

      const result = BookFiltersSchema.safeParse(emptyFilters);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(emptyFilters);
      }
    });

    it('should reject negative limit', () => {
      const invalidFilters = {
        limit: -1,
      };

      const result = BookFiltersSchema.safeParse(invalidFilters);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['limit']);
      }
    });

    it('should reject limit greater than 100', () => {
      const invalidFilters = {
        limit: 101,
      };

      const result = BookFiltersSchema.safeParse(invalidFilters);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['limit']);
      }
    });

    it('should reject negative offset', () => {
      const invalidFilters = {
        offset: -1,
      };

      const result = BookFiltersSchema.safeParse(invalidFilters);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['offset']);
      }
    });

    it('should reject minPublishedYear greater than maxPublishedYear', () => {
      const invalidFilters = {
        minPublishedYear: 2025,
        maxPublishedYear: 2020,
      };

      const result = BookFiltersSchema.safeParse(invalidFilters);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['maxPublishedYear']);
      }
    });

    it('should reject minPrice greater than maxPrice', () => {
      const invalidFilters = {
        minPrice: 50,
        maxPrice: 10,
      };

      const result = BookFiltersSchema.safeParse(invalidFilters);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['maxPrice']);
      }
    });

    it('should reject negative minPrice', () => {
      const invalidFilters = {
        minPrice: -10,
      };

      const result = BookFiltersSchema.safeParse(invalidFilters);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['minPrice']);
      }
    });

    it('should reject negative maxPrice', () => {
      const invalidFilters = {
        maxPrice: -10,
      };

      const result = BookFiltersSchema.safeParse(invalidFilters);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['maxPrice']);
      }
    });
  });

  describe('BookGenreEnum', () => {
    it('should accept valid genres', () => {
      const validGenres = ['FICTION', 'NON_FICTION', 'MYSTERY', 'SCIENCE_FICTION', 'ROMANCE', 'BIOGRAPHY', 'HISTORY', 'SELF_HELP', 'TECHNOLOGY', 'COOKBOOK'];

      validGenres.forEach(genre => {
        const result = BookGenreEnum.safeParse(genre);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toBe(genre);
        }
      });
    });

    it('should reject invalid genre', () => {
      const invalidGenre = 'INVALID_GENRE';

      const result = BookGenreEnum.safeParse(invalidGenre);
      expect(result.success).toBe(false);
    });
  });
}); 