import { Book } from '../../entities/Book';
import { BookGenre, CreateBookRequest, UpdateBookRequest, BookFilters } from '../../types';

export const createMockBook = (overrides: Partial<Book> = {}): Book => ({
  id: 'test-id-123',
  title: 'Test Book',
  author: 'Test Author',
  isbn: '1234567890123',
  publishedYear: 2023,
  genre: BookGenre.FICTION,
  description: 'A test book',
  price: 29.99,
  createdAt: new Date('2023-01-01T00:00:00Z'),
  updatedAt: new Date('2023-01-01T00:00:00Z'),
  ...overrides,
});

export const createMockCreateBookRequest = (overrides: Partial<CreateBookRequest> = {}): CreateBookRequest => ({
  title: 'New Book',
  author: 'New Author',
  isbn: '9876543210987',
  publishedYear: 2024,
  genre: BookGenre.NON_FICTION,
  description: 'A new book',
  price: 19.99,
  ...overrides,
});

export const createMockUpdateBookRequest = (overrides: Partial<UpdateBookRequest> = {}): UpdateBookRequest => ({
  title: 'Updated Book',
  author: 'Updated Author',
  isbn: '9876543210987',
  publishedYear: 2024,
  genre: BookGenre.NON_FICTION,
  description: 'Updated description',
  price: 39.99,
  ...overrides,
});

export const createMockBookFilters = (overrides: Partial<BookFilters> = {}): BookFilters => ({
  title: 'Test',
  author: 'Author',
  isbn: '1234567890123',
  genre: BookGenre.FICTION,
  minPublishedYear: 2020,
  maxPublishedYear: 2025,
  minPrice: 10,
  maxPrice: 50,
  limit: 10,
  offset: 0,
  ...overrides,
});

export const createMockBooks = (count: number = 3): Book[] => {
  const genres: BookGenre[] = [BookGenre.FICTION, BookGenre.NON_FICTION, BookGenre.MYSTERY, BookGenre.SCIENCE_FICTION, BookGenre.ROMANCE, BookGenre.BIOGRAPHY, BookGenre.HISTORY, BookGenre.SELF_HELP, BookGenre.TECHNOLOGY, BookGenre.COOKBOOK];
  
  return Array.from({ length: count }, (_, index) =>
    createMockBook({
      id: `test-id-${index + 1}`,
      title: `Test Book ${index + 1}`,
      author: `Test Author ${index + 1}`,
      isbn: `123456789012${index + 1}`,
      publishedYear: 2020 + index,
      genre: genres[index % genres.length],
      price: 10 + (index * 5),
    })
  );
};

export const expectBookToMatch = (actual: Book, expected: Partial<Book>) => {
  Object.keys(expected).forEach(key => {
    expect(actual[key as keyof Book]).toEqual(expected[key as keyof Book]);
  });
};

export const expectApiResponse = (response: any, expectedStatus: number, expectedSuccess: boolean) => {
  expect(response.status).toBe(expectedStatus);
  expect(response.body.success).toBe(expectedSuccess);
};

export const expectErrorResponse = (response: any, expectedStatus: number, expectedErrorCode: string) => {
  expectApiResponse(response, expectedStatus, false);
  expect(response.body.errorCode).toBe(expectedErrorCode);
  expect(response.body.statusCode).toBe(expectedStatus);
  expect(response.body.error).toBeDefined();
};

export const expectSuccessResponse = (response: any, expectedStatus: number) => {
  expectApiResponse(response, expectedStatus, true);
  expect(response.body.statusCode).toBe(expectedStatus);
  expect(response.body.message).toBeDefined();
};

export const expectValidationError = (response: any, field?: string) => {
  expectErrorResponse(response, 400, 'VALIDATION_ERROR');
  if (field) {
    expect(response.body.message).toContain(field);
  }
};

export const expectNotFoundError = (response: any) => {
  expectErrorResponse(response, 404, 'BOOK_NOT_FOUND');
};

export const expectInternalServerError = (response: any) => {
  expectErrorResponse(response, 500, 'INTERNAL_SERVER_ERROR');
};

export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const generateRandomString = (length: number = 10): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const generateRandomISBN = (): string => {
  const digits = Array.from({ length: 13 }, () => Math.floor(Math.random() * 10)).join('');
  return digits;
};

export const generateRandomYear = (min: number = 1800, max: number = new Date().getFullYear()): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const generateRandomPrice = (min: number = 0.01, max: number = 100): number => {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
};

// Simple test to satisfy Jest requirement
describe('Test Helpers', () => {
  it('should create mock book correctly', () => {
    const mockBook = createMockBook();
    expect(mockBook.id).toBe('test-id-123');
    expect(mockBook.title).toBe('Test Book');
    expect(mockBook.genre).toBe(BookGenre.FICTION);
  });
}); 