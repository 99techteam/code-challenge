import { OpenApiGeneratorV3, OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import {
  CreateBookSchema,
  UpdateBookSchema,
  BookFiltersSchema,
  BookResponseSchema,
  PaginatedBooksResponseSchema,
  SuccessResponseSchema,
  ErrorResponseSchema,
  BookGenreEnum,
  ErrorCodeEnum
} from '../types';
import { ERROR_CODES, ERROR_MESSAGES, SUCCESS_MESSAGES, HTTP_STATUS } from '../constants/errors';

// Create a registry for all schemas and routes
export const registry = new OpenAPIRegistry();

// Register schemas
registry.register('BookGenreEnum', BookGenreEnum);
registry.register('ErrorCodeEnum', ErrorCodeEnum);
registry.register('CreateBookRequest', CreateBookSchema);
registry.register('UpdateBookRequest', UpdateBookSchema);
registry.register('BookFilters', BookFiltersSchema);
registry.register('Book', BookResponseSchema);
registry.register('PaginatedBooks', PaginatedBooksResponseSchema);
registry.register('SuccessResponse', SuccessResponseSchema);
registry.register('ErrorResponse', ErrorResponseSchema);

// Define parameter schemas
const BookIdParam = registry.registerParameter(
  'BookId',
  z.string().uuid().openapi({
    param: {
      name: 'id',
      in: 'path',
    },
    description: 'Book ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
);

// Create specific error response schemas for different status codes
const ValidationErrorResponse = ErrorResponseSchema.extend({
  errorCode: z.literal(ERROR_CODES.VALIDATION_ERROR),
  error: z.literal(ERROR_MESSAGES[ERROR_CODES.VALIDATION_ERROR]),
  statusCode: z.literal(HTTP_STATUS.BAD_REQUEST),
}).openapi('ValidationErrorResponse', {
  description: 'Validation error response (400)'
});

const NotFoundErrorResponse = ErrorResponseSchema.extend({
  errorCode: z.literal(ERROR_CODES.BOOK_NOT_FOUND),
  error: z.literal(ERROR_MESSAGES[ERROR_CODES.BOOK_NOT_FOUND]),
  statusCode: z.literal(HTTP_STATUS.NOT_FOUND),
}).openapi('NotFoundErrorResponse', {
  description: 'Resource not found error response (404)'
});

const ConflictErrorResponse = ErrorResponseSchema.extend({
  errorCode: z.literal(ERROR_CODES.DUPLICATE_ISBN),
  error: z.literal(ERROR_MESSAGES[ERROR_CODES.DUPLICATE_ISBN]),
  statusCode: z.literal(HTTP_STATUS.CONFLICT),
}).openapi('ConflictErrorResponse', {
  description: 'Conflict error response (409)'
});

const InternalServerErrorResponse = ErrorResponseSchema.extend({
  errorCode: z.literal(ERROR_CODES.INTERNAL_SERVER_ERROR).openapi({
    description: 'Internal server error code',
    example: ERROR_CODES.INTERNAL_SERVER_ERROR,
  }),
  error: z.literal(ERROR_MESSAGES[ERROR_CODES.INTERNAL_SERVER_ERROR]).openapi({
    description: 'Internal server error message',
    example: ERROR_MESSAGES[ERROR_CODES.INTERNAL_SERVER_ERROR],
  }),
  statusCode: z.literal(HTTP_STATUS.INTERNAL_SERVER_ERROR).openapi({
    description: 'Internal server error status code',
    example: HTTP_STATUS.INTERNAL_SERVER_ERROR,
  }),
}).openapi('InternalServerErrorResponse', {
  description: 'Internal server error response (500)'
});

// Register routes
registry.registerPath({
  method: 'post',
  path: '/api/books',
  summary: 'Create a new book',
  description: 'Creates a new book with the provided information',
  tags: ['Books'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreateBookSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Book created successfully',
      content: {
        'application/json': {
          schema: SuccessResponseSchema.extend({
            data: BookResponseSchema,
            message: z.literal(SUCCESS_MESSAGES.BOOK_CREATED),
            statusCode: z.literal(HTTP_STATUS.CREATED),
          }),
        },
      },
    },
    400: {
      description: 'Validation error - Invalid input data',
      content: {
        'application/json': {
          schema: ValidationErrorResponse,
        },
      },
    },
    409: {
      description: 'Conflict - Book with this ISBN already exists',
      content: {
        'application/json': {
          schema: ConflictErrorResponse,
        },
      },
    },
    500: {
      description: 'Internal server error',
      content: {
        'application/json': {
          schema: InternalServerErrorResponse,
        },
      },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/books',
  summary: 'Get all books with optional filters',
  description: 'Retrieve a list of books with optional filtering and pagination',
  tags: ['Books'],
  request: {
    query: BookFiltersSchema,
  },
  responses: {
    200: {
      description: 'List of books retrieved successfully',
      content: {
        'application/json': {
          schema: SuccessResponseSchema.extend({
            data: PaginatedBooksResponseSchema,
            message: z.literal(SUCCESS_MESSAGES.BOOKS_RETRIEVED),
            statusCode: z.literal(HTTP_STATUS.OK),
          }),
        },
      },
    },
    400: {
      description: 'Validation error - Invalid query parameters',
      content: {
        'application/json': {
          schema: ValidationErrorResponse,
        },
      },
    },
    500: {
      description: 'Internal server error',
      content: {
        'application/json': {
          schema: InternalServerErrorResponse,
        },
      },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/books/{id}',
  summary: 'Get a book by ID',
  description: 'Retrieve a specific book by its ID',
  tags: ['Books'],
  request: {
    params: z.object({
      id: BookIdParam,
    }),
  },
  responses: {
    200: {
      description: 'Book found successfully',
      content: {
        'application/json': {
          schema: SuccessResponseSchema.extend({
            data: BookResponseSchema,
            message: z.literal(SUCCESS_MESSAGES.BOOK_RETRIEVED),
            statusCode: z.literal(HTTP_STATUS.OK),
          }),
        },
      },
    },
    404: {
      description: 'Book not found',
      content: {
        'application/json': {
          schema: NotFoundErrorResponse,
        },
      },
    },
    500: {
      description: 'Internal server error',
      content: {
        'application/json': {
          schema: InternalServerErrorResponse,
        },
      },
    },
  },
});

registry.registerPath({
  method: 'put',
  path: '/api/books/{id}',
  summary: 'Update a book',
  description: 'Update an existing book with new information',
  tags: ['Books'],
  request: {
    params: z.object({
      id: BookIdParam,
    }),
    body: {
      content: {
        'application/json': {
          schema: UpdateBookSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Book updated successfully',
      content: {
        'application/json': {
          schema: SuccessResponseSchema.extend({
            data: BookResponseSchema,
            message: z.literal(SUCCESS_MESSAGES.BOOK_UPDATED),
            statusCode: z.literal(HTTP_STATUS.OK),
          }),
        },
      },
    },
    400: {
      description: 'Validation error - Invalid input data',
      content: {
        'application/json': {
          schema: ValidationErrorResponse,
        },
      },
    },
    404: {
      description: 'Book not found',
      content: {
        'application/json': {
          schema: NotFoundErrorResponse,
        },
      },
    },
    500: {
      description: 'Internal server error',
      content: {
        'application/json': {
          schema: InternalServerErrorResponse,
        },
      },
    },
  },
});

registry.registerPath({
  method: 'delete',
  path: '/api/books/{id}',
  summary: 'Delete a book',
  description: 'Delete a book by its ID',
  tags: ['Books'],
  request: {
    params: z.object({
      id: BookIdParam,
    }),
  },
  responses: {
    200: {
      description: 'Book deleted successfully',
      content: {
        'application/json': {
          schema: SuccessResponseSchema.extend({
            message: z.literal(SUCCESS_MESSAGES.BOOK_DELETED),
            statusCode: z.literal(HTTP_STATUS.OK),
          }),
        },
      },
    },
    404: {
      description: 'Book not found',
      content: {
        'application/json': {
          schema: NotFoundErrorResponse,
        },
      },
    },
    500: {
      description: 'Internal server error',
      content: {
        'application/json': {
          schema: InternalServerErrorResponse,
        },
      },
    },
  },
});

// Generate the OpenAPI document
export const openApiDocument = new OpenApiGeneratorV3(registry.definitions).generateDocument({
  openapi: '3.0.0',
  info: {
    title: 'Book CRUD API',
    version: '1.0.0',
    description: 'A RESTful API for managing books with full CRUD operations',
    contact: {
      name: 'API Support',
      email: 'support@example.com',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server',
    },
  ],
  tags: [
    {
      name: 'Books',
      description: 'Operations for managing books',
    },
  ],
}); 