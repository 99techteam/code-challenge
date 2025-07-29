import { Book } from '../Book';
import { BookGenre } from '../../types';

describe('Book Entity', () => {
  let book: Book;

  beforeEach(() => {
    book = new Book();
    // Initialize required properties
    book.title = 'Test Book';
    book.author = 'Test Author';
    book.isbn = '1234567890123';
    book.publishedYear = 2023;
    book.genre = BookGenre.FICTION;
  });

  describe('Properties', () => {
    it('should have required properties', () => {
      expect(book).toHaveProperty('id');
      expect(book).toHaveProperty('title');
      expect(book).toHaveProperty('author');
      expect(book).toHaveProperty('isbn');
      expect(book).toHaveProperty('publishedYear');
      expect(book).toHaveProperty('genre');
      expect(book).toHaveProperty('createdAt');
      expect(book).toHaveProperty('updatedAt');
    });

    it('should have optional properties', () => {
      book.description = undefined;
      book.price = undefined;
      expect(book).toHaveProperty('description');
      expect(book).toHaveProperty('price');
    });

    it('should generate UUID for id', () => {
      expect(book.id).toBeDefined();
      expect(typeof book.id).toBe('string');
      expect(book.id.length).toBeGreaterThan(0);
    });

    it('should set createdAt to current date', () => {
      const now = new Date();
      const timeDiff = Math.abs(now.getTime() - book.createdAt.getTime());
      expect(timeDiff).toBeLessThan(1000); // Within 1 second
    });

    it('should set updatedAt to current date', () => {
      const now = new Date();
      const timeDiff = Math.abs(now.getTime() - book.updatedAt.getTime());
      expect(timeDiff).toBeLessThan(1000); // Within 1 second
    });
  });

  describe('Book Creation', () => {
    it('should create a book with all required fields', () => {
      const bookData = {
        title: 'Test Book',
        author: 'Test Author',
        isbn: '1234567890123',
        publishedYear: 2023,
        genre: BookGenre.FICTION,
      };

      Object.assign(book, bookData);

      expect(book.title).toBe(bookData.title);
      expect(book.author).toBe(bookData.author);
      expect(book.isbn).toBe(bookData.isbn);
      expect(book.publishedYear).toBe(bookData.publishedYear);
      expect(book.genre).toBe(bookData.genre);
    });

    it('should create a book with optional fields', () => {
      const bookData = {
        title: 'Test Book',
        author: 'Test Author',
        isbn: '1234567890123',
        publishedYear: 2023,
        genre: BookGenre.FICTION,
        description: 'A test book description',
        price: 29.99,
      };

      Object.assign(book, bookData);

      expect(book.description).toBe(bookData.description);
      expect(book.price).toBe(bookData.price);
    });
  });

  describe('Book Genre', () => {
    it('should accept valid book genres', () => {
      const validGenres: BookGenre[] = [
        BookGenre.FICTION, 
        BookGenre.NON_FICTION, 
        BookGenre.MYSTERY, 
        BookGenre.SCIENCE_FICTION, 
        BookGenre.ROMANCE, 
        BookGenre.BIOGRAPHY, 
        BookGenre.HISTORY, 
        BookGenre.SELF_HELP, 
        BookGenre.TECHNOLOGY, 
        BookGenre.COOKBOOK
      ];
      
      validGenres.forEach(genre => {
        book.genre = genre;
        expect(book.genre).toBe(genre);
      });
    });
  });

  describe('ISBN Validation', () => {
    it('should accept valid ISBN formats', () => {
      const validISBNs = [
        '1234567890',      // 10 digits
        '1234567890123',   // 13 digits
        '978-0-7475-3269-9', // 13 digits with hyphens
      ];

      validISBNs.forEach(isbn => {
        book.isbn = isbn;
        expect(book.isbn).toBe(isbn);
      });
    });
  });

  describe('Price Validation', () => {
    it('should accept decimal prices', () => {
      const prices = [0.01, 10.50, 99.99, 1000.00];

      prices.forEach(price => {
        book.price = price;
        expect(book.price).toBe(price);
      });
    });

    it('should accept null/undefined price', () => {
      book.price = undefined;
      expect(book.price).toBeUndefined();

      book.price = null as any;
      expect(book.price).toBeNull();
    });
  });

  describe('Year Validation', () => {
    it('should accept valid published years', () => {
      const currentYear = new Date().getFullYear();
      const validYears = [1800, 1900, 1950, 2000, currentYear];

      validYears.forEach(year => {
        book.publishedYear = year;
        expect(book.publishedYear).toBe(year);
      });
    });
  });
}); 