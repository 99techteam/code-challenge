import { BookRepository } from '../BookRepository';
import { Book } from '../../entities/Book';
import { CreateBookRequest, UpdateBookRequest, BookFilters, BookGenre } from '../../types';
import { database } from '../../database/database';

// Mock the database module
jest.mock('../../database/database');

describe('BookRepository', () => {
  let bookRepository: BookRepository;
  let mockEntityManager: any;

  const mockBook: Book = {
    id: 'test-id-123',
    title: 'Test Book',
    author: 'Test Author',
    isbn: '1234567890123',
    publishedYear: 2023,
    genre: BookGenre.FICTION,
    description: 'A test book',
    price: 29.99,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create mock entity manager
    mockEntityManager = {
      create: jest.fn(),
      persist: jest.fn(),
      flush: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      assign: jest.fn(),
      removeAndFlush: jest.fn(),
      count: jest.fn(),
    };

    // Mock the database.getEntityManager method
    (database.getEntityManager as jest.Mock).mockReturnValue(mockEntityManager);

    bookRepository = new BookRepository();
  });

  describe('create', () => {
    it('should create a book successfully', async () => {
      const bookData: CreateBookRequest = {
        title: 'New Book',
        author: 'New Author',
        isbn: '9876543210987',
        publishedYear: 2024,
        genre: BookGenre.NON_FICTION,
        description: 'A new book',
        price: 19.99,
      };

      mockEntityManager.create.mockReturnValue(mockBook);
      mockEntityManager.persist.mockImplementation(() => {});
      mockEntityManager.flush.mockResolvedValue(undefined);

      const result = await bookRepository.create(bookData);

      expect(mockEntityManager.create).toHaveBeenCalledWith(Book, {
        ...bookData,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
      expect(mockEntityManager.persist).toHaveBeenCalledWith(mockBook);
      expect(mockEntityManager.flush).toHaveBeenCalled();
      expect(result).toEqual(mockBook);
    });

    it('should throw error when creation fails', async () => {
      const bookData: CreateBookRequest = {
        title: 'New Book',
        author: 'New Author',
        isbn: '9876543210987',
        publishedYear: 2024,
        genre: BookGenre.NON_FICTION,
      };

      const error = new Error('Database error');
      mockEntityManager.create.mockImplementation(() => {
        throw error;
      });

      await expect(bookRepository.create(bookData)).rejects.toThrow('Database error');
    });
  });

  describe('findAll', () => {
    it('should find all books without filters', async () => {
      const mockBooks = [mockBook];
      mockEntityManager.find.mockResolvedValue(mockBooks);

      const result = await bookRepository.findAll();

      expect(mockEntityManager.find).toHaveBeenCalledWith(Book, {}, {
        orderBy: { createdAt: 'DESC' }
      });
      expect(result).toEqual(mockBooks);
    });

    it('should find books with title filter', async () => {
      const filters: BookFilters = { title: 'Test' };
      const mockBooks = [mockBook];
      mockEntityManager.find.mockResolvedValue(mockBooks);

      const result = await bookRepository.findAll(filters);

      expect(mockEntityManager.find).toHaveBeenCalledWith(Book, {
        title: { $ilike: '%Test%' }
      }, {
        orderBy: { createdAt: 'DESC' }
      });
      expect(result).toEqual(mockBooks);
    });

    it('should find books with multiple filters', async () => {
      const filters: BookFilters = {
        title: 'Test',
        author: 'Author',
        genre: BookGenre.FICTION,
        minPublishedYear: 2020,
        maxPublishedYear: 2025,
        minPrice: 10,
        maxPrice: 50,
        limit: 10,
        offset: 0,
      };
      const mockBooks = [mockBook];
      mockEntityManager.find.mockResolvedValue(mockBooks);

      const result = await bookRepository.findAll(filters);

      expect(mockEntityManager.find).toHaveBeenCalledWith(Book, {
        title: { $ilike: '%Test%' },
        author: { $ilike: '%Author%' },
        genre: { $ilike: '%FICTION%' },
        publishedYear: { $gte: 2020, $lte: 2025 },
        price: { $gte: 10, $lte: 50 },
      }, {
        orderBy: { createdAt: 'DESC' },
        limit: 10,
        offset: 0,
      });
      expect(result).toEqual(mockBooks);
    });

    it('should throw error when finding books fails', async () => {
      const error = new Error('Database error');
      mockEntityManager.find.mockRejectedValue(error);

      await expect(bookRepository.findAll()).rejects.toThrow('Database error');
    });
  });

  describe('findById', () => {
    it('should find a book by id successfully', async () => {
      const bookId = 'test-id-123';
      mockEntityManager.findOne.mockResolvedValue(mockBook);

      const result = await bookRepository.findById(bookId);

      expect(mockEntityManager.findOne).toHaveBeenCalledWith(Book, { id: bookId });
      expect(result).toEqual(mockBook);
    });

    it('should return null when book not found', async () => {
      const bookId = 'non-existent-id';
      mockEntityManager.findOne.mockResolvedValue(null);

      const result = await bookRepository.findById(bookId);

      expect(mockEntityManager.findOne).toHaveBeenCalledWith(Book, { id: bookId });
      expect(result).toBeNull();
    });

    it('should throw error when finding book fails', async () => {
      const bookId = 'test-id-123';
      const error = new Error('Database error');
      mockEntityManager.findOne.mockRejectedValue(error);

      await expect(bookRepository.findById(bookId)).rejects.toThrow('Database error');
    });
  });

  describe('update', () => {
    it('should update a book successfully', async () => {
      const bookId = 'test-id-123';
      const updateData: UpdateBookRequest = {
        title: 'Updated Book',
        price: 39.99,
      };

      mockEntityManager.findOne.mockResolvedValue(mockBook);
      mockEntityManager.assign.mockImplementation(() => {});
      mockEntityManager.flush.mockResolvedValue(undefined);

      const result = await bookRepository.update(bookId, updateData);

      expect(mockEntityManager.findOne).toHaveBeenCalledWith(Book, { id: bookId });
      expect(mockEntityManager.assign).toHaveBeenCalledWith(mockBook, updateData);
      expect(mockEntityManager.flush).toHaveBeenCalled();
      expect(result).toEqual(mockBook);
    });

    it('should return null when book not found for update', async () => {
      const bookId = 'non-existent-id';
      const updateData: UpdateBookRequest = {
        title: 'Updated Book',
      };

      mockEntityManager.findOne.mockResolvedValue(null);

      const result = await bookRepository.update(bookId, updateData);

      expect(mockEntityManager.findOne).toHaveBeenCalledWith(Book, { id: bookId });
      expect(mockEntityManager.assign).not.toHaveBeenCalled();
      expect(mockEntityManager.flush).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should throw error when update fails', async () => {
      const bookId = 'test-id-123';
      const updateData: UpdateBookRequest = {
        title: 'Updated Book',
      };

      mockEntityManager.findOne.mockResolvedValue(mockBook);
      const error = new Error('Database error');
      mockEntityManager.flush.mockRejectedValue(error);

      await expect(bookRepository.update(bookId, updateData)).rejects.toThrow('Database error');
    });
  });

  describe('delete', () => {
    it('should delete a book successfully', async () => {
      const bookId = 'test-id-123';
      mockEntityManager.findOne.mockResolvedValue(mockBook);
      mockEntityManager.removeAndFlush.mockResolvedValue(undefined);

      const result = await bookRepository.delete(bookId);

      expect(mockEntityManager.findOne).toHaveBeenCalledWith(Book, { id: bookId });
      expect(mockEntityManager.removeAndFlush).toHaveBeenCalledWith(mockBook);
      expect(result).toBe(true);
    });

    it('should return false when book not found for deletion', async () => {
      const bookId = 'non-existent-id';
      mockEntityManager.findOne.mockResolvedValue(null);

      const result = await bookRepository.delete(bookId);

      expect(mockEntityManager.findOne).toHaveBeenCalledWith(Book, { id: bookId });
      expect(mockEntityManager.removeAndFlush).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it('should throw error when deletion fails', async () => {
      const bookId = 'test-id-123';
      mockEntityManager.findOne.mockResolvedValue(mockBook);
      const error = new Error('Database error');
      mockEntityManager.removeAndFlush.mockRejectedValue(error);

      await expect(bookRepository.delete(bookId)).rejects.toThrow('Database error');
    });
  });

  describe('count', () => {
    it('should count all books without filters', async () => {
      const mockCount = 5;
      mockEntityManager.count.mockResolvedValue(mockCount);

      const result = await bookRepository.count();

      expect(mockEntityManager.count).toHaveBeenCalledWith(Book, {});
      expect(result).toBe(mockCount);
    });

    it('should count books with filters', async () => {
      const filters: BookFilters = {
        title: 'Test',
        author: 'Author',
        minPublishedYear: 2020,
      };
      const mockCount = 2;
      mockEntityManager.count.mockResolvedValue(mockCount);

      const result = await bookRepository.count(filters);

      expect(mockEntityManager.count).toHaveBeenCalledWith(Book, {
        title: { $ilike: '%Test%' },
        author: { $ilike: '%Author%' },
        publishedYear: { $gte: 2020 },
      });
      expect(result).toBe(mockCount);
    });

    it('should throw error when counting fails', async () => {
      const error = new Error('Database error');
      mockEntityManager.count.mockRejectedValue(error);

      await expect(bookRepository.count()).rejects.toThrow('Database error');
    });
  });
}); 