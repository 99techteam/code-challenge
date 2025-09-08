import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Books API',
      version: '1.0.0',
      description: 'A simple Express API for managing books with TypeORM and SQLite',
      contact: {
        name: 'API Support',
        email: 'support@booksapi.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        ApiResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Indicates if the request was successful',
            },
            message: {
              type: 'string',
              description: 'A message describing the result',
            },
            data: {
              type: 'object',
              description: 'The response data (if any)',
            },
            error: {
              type: 'string',
              description: 'Error message (if any)',
            },
          },
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
            },
            message: {
              type: 'string',
            },
            data: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Book',
              },
            },
            pagination: {
              type: 'object',
              properties: {
                total: {
                  type: 'integer',
                },
                limit: {
                  type: 'integer',
                },
                offset: {
                  type: 'integer',
                },
                hasNext: {
                  type: 'boolean',
                },
                hasPrev: {
                  type: 'boolean',
                },
              },
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'], // paths to files containing OpenAPI definitions
};

export const swaggerSpec = swaggerJsdoc(options);
