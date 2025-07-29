import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { ERROR_CODES, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants/errors';

extendZodWithOpenApi(z);

export enum BookGenre {
  FICTION = 'FICTION',
  NON_FICTION = 'NON_FICTION',
  MYSTERY = 'MYSTERY',
  THRILLER = 'THRILLER',
  ROMANCE = 'ROMANCE',
  SCIENCE_FICTION = 'SCIENCE_FICTION',
  FANTASY = 'FANTASY',
  HISTORICAL_FICTION = 'HISTORICAL_FICTION',
  BIOGRAPHY = 'BIOGRAPHY',
  AUTOBIOGRAPHY = 'AUTOBIOGRAPHY',
  MEMOIR = 'MEMOIR',
  SELF_HELP = 'SELF_HELP',
  BUSINESS = 'BUSINESS',
  TECHNOLOGY = 'TECHNOLOGY',
  PHILOSOPHY = 'PHILOSOPHY',
  RELIGION = 'RELIGION',
  POETRY = 'POETRY',
  DRAMA = 'DRAMA',
  CHILDREN = 'CHILDREN',
  YOUNG_ADULT = 'YOUNG_ADULT',
  COOKBOOK = 'COOKBOOK',
  TRAVEL = 'TRAVEL',
  HISTORY = 'HISTORY',
  SCIENCE = 'SCIENCE',
  MATHEMATICS = 'MATHEMATICS',
  OTHER = 'OTHER',
} 

// Book genre enum for Zod validation
export const BookGenreEnum = z.nativeEnum(BookGenre).openapi({
  description: 'Book genre categories',
  example: BookGenre.FICTION
});


// Error code enum for OpenAPI
export const ErrorCodeEnum = z.enum([
  ERROR_CODES.VALIDATION_ERROR,
  ERROR_CODES.INVALID_INPUT,
  ERROR_CODES.MISSING_REQUIRED_FIELD,
  ERROR_CODES.INVALID_FORMAT,
  ERROR_CODES.RESOURCE_NOT_FOUND,
  ERROR_CODES.BOOK_NOT_FOUND,
  ERROR_CODES.RESOURCE_ALREADY_EXISTS,
  ERROR_CODES.DUPLICATE_ISBN,
  ERROR_CODES.INTERNAL_SERVER_ERROR,
  ERROR_CODES.DATABASE_ERROR,
  ERROR_CODES.UNKNOWN_ERROR,
]).openapi({
  description: 'Error codes for API responses',
  example: ERROR_CODES.VALIDATION_ERROR
});

// Zod schemas for validation with OpenAPI metadata
export const CreateBookSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long').openapi({
    description: 'The book title',
    example: 'The Great Gatsby'
  }),
  author: z.string().min(1, 'Author is required').max(255, 'Author too long').openapi({
    description: 'The book author',
    example: 'F. Scott Fitzgerald'
  }),
  isbn: z.string().min(10, 'ISBN must be at least 10 characters').max(13, 'ISBN too long').openapi({
    description: 'The book ISBN',
    example: '9780743273565'
  }),
  publishedYear: z.number().int().min(1800).max(new Date().getFullYear()).openapi({
    description: 'The year the book was published',
    example: 1925
  }),
  genre: BookGenreEnum.openapi({
    description: 'The book genre',
    example: 'FICTION'
  }),
  description: z.string().optional().openapi({
    description: 'The book description',
    example: 'A story of the fabulously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan.'
  }),
  price: z.number().positive('Price must be positive').optional().openapi({
    description: 'The book price',
    example: 12.99
  }),
}).openapi('CreateBookRequest', {
  description: 'Request body for creating a new book'
});

export const UpdateBookSchema = CreateBookSchema.partial().openapi('UpdateBookRequest', {
  description: 'Request body for updating a book'
});

export const BookFiltersSchema = z.object({
  title: z.string().optional().openapi({
    description: 'Filter by title (partial match)',
    example: 'Gatsby'
  }),
  author: z.string().optional().openapi({
    description: 'Filter by author (partial match)',
    example: 'Fitzgerald'
  }),
  isbn: z.string().optional().openapi({
    description: 'Filter by ISBN (partial match)',
    example: '9780743273565'
  }),
  genre: BookGenreEnum.optional().openapi({
    description: 'Filter by exact genre match',
    example: 'FICTION'
  }),
  minPublishedYear: z.union([
    z.string().transform((val) => parseInt(val, 10)),
    z.number()
  ]).optional().pipe(
    z.number().int().min(1800).optional()
  ).openapi({
    description: 'Minimum published year',
    example: '1900'
  }),
  maxPublishedYear: z.union([
    z.string().transform((val) => parseInt(val, 10)),
    z.number()
  ]).optional().pipe(
    z.number().int().max(new Date().getFullYear()).optional()
  ).openapi({
    description: 'Maximum published year',
    example: '2000'
  }),
  minPrice: z.union([
    z.string().transform((val) => parseFloat(val)),
    z.number()
  ]).optional().pipe(
    z.number().positive().optional()
  ).openapi({
    description: 'Minimum price',
    example: '10.00'
  }),
  maxPrice: z.union([
    z.string().transform((val) => parseFloat(val)),
    z.number()
  ]).optional().pipe(
    z.number().positive().optional()
  ).openapi({
    description: 'Maximum price',
    example: '20.00'
  }),
  limit: z.union([
    z.string().transform((val) => parseInt(val, 10)),
    z.number()
  ]).optional().pipe(
    z.number().int().positive().max(100).optional()
  ).openapi({
    description: 'Number of books to return',
    example: '10'
  }),
  offset: z.union([
    z.string().transform((val) => parseInt(val, 10)),
    z.number()
  ]).optional().pipe(
    z.number().int().min(0).optional()
  ).openapi({
    description: 'Number of books to skip',
    example: '0'
  }),
}).refine((data) => {
  if (data.minPublishedYear && data.maxPublishedYear) {
    return data.minPublishedYear <= data.maxPublishedYear;
  }
  return true;
}, {
  message: "minPublishedYear cannot be greater than maxPublishedYear",
  path: ["maxPublishedYear"]
}).refine((data) => {
  if (data.minPrice && data.maxPrice) {
    return data.minPrice <= data.maxPrice;
  }
  return true;
}, {
  message: "minPrice cannot be greater than maxPrice",
  path: ["maxPrice"]
}).openapi('BookFilters', {
  description: 'Query parameters for filtering books'
});

export const BookResponseSchema = z.object({
  id: z.string().uuid().openapi({
    description: 'The book ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  }),
  title: z.string().openapi({
    description: 'The book title',
    example: 'The Great Gatsby'
  }),
  author: z.string().openapi({
    description: 'The book author',
    example: 'F. Scott Fitzgerald'
  }),
  isbn: z.string().openapi({
    description: 'The book ISBN',
    example: '9780743273565'
  }),
  publishedYear: z.number().openapi({
    description: 'The year the book was published',
    example: 1925
  }),
  genre: BookGenreEnum.openapi({
    description: 'The book genre',
    example: 'FICTION'
  }),
  description: z.string().optional().openapi({
    description: 'The book description',
    example: 'A story of the fabulously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan.'
  }),
  price: z.number().optional().openapi({
    description: 'The book price',
    example: 12.99
  }),
  createdAt: z.date().openapi({
    description: 'The creation timestamp',
    example: '2023-01-01T00:00:00.000Z'
  }),
  updatedAt: z.date().openapi({
    description: 'The last update timestamp',
    example: '2023-01-01T00:00:00.000Z'
  }),
}).openapi('Book', {
  description: 'A book entity'
});

export const PaginatedBooksResponseSchema = z.object({
  data: z.array(BookResponseSchema).openapi({
    description: 'Array of books'
  }),
  total: z.number().openapi({
    description: 'Total number of books',
    example: 100
  }),
  limit: z.number().openapi({
    description: 'Number of books per page',
    example: 10
  }),
  offset: z.number().openapi({
    description: 'Number of books skipped',
    example: 0
  }),
  hasMore: z.boolean().openapi({
    description: 'Whether there are more books to fetch',
    example: true
  }),
}).openapi('PaginatedBooks', {
  description: 'Paginated response for books'
});

// Success response schema
export const SuccessResponseSchema = z.object({
  success: z.literal(true).openapi({
    description: 'Whether the request was successful',
    example: true
  }),
  data: z.any().optional().openapi({
    description: 'The response data'
  }),
  message: z.string().optional().openapi({
    description: 'Success message',
    example: SUCCESS_MESSAGES.BOOK_CREATED
  }),
  statusCode: z.number().optional().openapi({
    description: 'HTTP status code',
    example: 200
  }),
}).openapi('SuccessResponse', {
  description: 'Successful API response format'
});

// Error response schema
export const ErrorResponseSchema = z.object({
  success: z.literal(false).openapi({
    description: 'Whether the request was successful',
    example: false
  }),
  error: z.string().openapi({
    description: 'Error message',
    example: ERROR_MESSAGES[ERROR_CODES.VALIDATION_ERROR]
  }),
  errorCode: ErrorCodeEnum.openapi({
    description: 'Error code for programmatic handling',
    example: ERROR_CODES.VALIDATION_ERROR
  }),
  statusCode: z.number().openapi({
    description: 'HTTP status code',
    example: 400
  }),
  message: z.string().optional().openapi({
    description: 'Additional error details',
    example: 'Invalid input data provided'
  }),
}).openapi('ErrorResponse', {
  description: 'Error API response format'
});

// Generic API response schema (for backward compatibility)
export const ApiResponseSchema = z.union([SuccessResponseSchema, ErrorResponseSchema]).openapi('ApiResponse', {
  description: 'Standard API response format'
});

// TypeScript interfaces derived from Zod schemas
export type Book = z.infer<typeof BookResponseSchema>;
export type CreateBookRequest = z.infer<typeof CreateBookSchema>;
export type UpdateBookRequest = z.infer<typeof UpdateBookSchema>;
export type BookFilters = z.infer<typeof BookFiltersSchema>;
export type SuccessResponse<T> = z.infer<typeof SuccessResponseSchema> & { data?: T };
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;
export type PaginatedResponse<T> = z.infer<typeof PaginatedBooksResponseSchema> & { data: T[] };
