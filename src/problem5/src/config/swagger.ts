import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CRUD API Server',
      version: '1.0.0',
      description: 'A comprehensive CRUD API server built with Express.js and TypeScript',
      contact: {
        name: 'API Support',
        email: 'support@example.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
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
        Resource: {
          type: 'object',
          required: ['id', 'name', 'status', 'created_at', 'updated_at'],
          properties: {
            id: {
              type: 'integer',
              description: 'Unique identifier for the resource',
              example: 1,
            },
            name: {
              type: 'string',
              description: 'Name of the resource',
              maxLength: 255,
              example: 'My Resource',
            },
            description: {
              type: 'string',
              description: 'Optional description of the resource',
              maxLength: 1000,
              nullable: true,
              example: 'This is a sample resource description',
            },
            category: {
              type: 'string',
              description: 'Optional category for the resource',
              maxLength: 100,
              nullable: true,
              example: 'tools',
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive', 'archived'],
              description: 'Current status of the resource',
              example: 'active',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Resource creation timestamp',
              example: '2023-09-13T10:30:00Z',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Resource last update timestamp',
              example: '2023-09-13T10:30:00Z',
            },
          },
        },
        CreateResourceRequest: {
          type: 'object',
          required: ['name'],
          properties: {
            name: {
              type: 'string',
              description: 'Name of the resource',
              maxLength: 255,
              example: 'My New Resource',
            },
            description: {
              type: 'string',
              description: 'Optional description of the resource',
              maxLength: 1000,
              example: 'This is a new resource',
            },
            category: {
              type: 'string',
              description: 'Optional category for the resource',
              maxLength: 100,
              example: 'tools',
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive', 'archived'],
              description: 'Initial status of the resource',
              default: 'active',
              example: 'active',
            },
          },
        },
        UpdateResourceRequest: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Name of the resource',
              maxLength: 255,
              example: 'Updated Resource Name',
            },
            description: {
              type: 'string',
              description: 'Description of the resource',
              maxLength: 1000,
              nullable: true,
              example: 'Updated resource description',
            },
            category: {
              type: 'string',
              description: 'Category for the resource',
              maxLength: 100,
              nullable: true,
              example: 'updated-category',
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive', 'archived'],
              description: 'Status of the resource',
              example: 'inactive',
            },
          },
        },
        ResourceStats: {
          type: 'object',
          properties: {
            total: {
              type: 'integer',
              description: 'Total number of resources',
              example: 10,
            },
            byStatus: {
              type: 'object',
              properties: {
                active: {
                  type: 'integer',
                  description: 'Number of active resources',
                  example: 7,
                },
                inactive: {
                  type: 'integer',
                  description: 'Number of inactive resources',
                  example: 2,
                },
                archived: {
                  type: 'integer',
                  description: 'Number of archived resources',
                  example: 1,
                },
              },
            },
            byCategory: {
              type: 'object',
              additionalProperties: {
                type: 'integer',
              },
              description: 'Resource count by category',
              example: {
                tools: 5,
                documents: 3,
                media: 2,
              },
            },
          },
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: 'Operation completed successfully',
            },
            data: {
              type: 'object',
              description: 'Response data',
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  example: 'An error occurred',
                },
              },
            },
          },
        },
        PaginatedResourcesResponse: {
          type: 'object',
          allOf: [
            { $ref: '#/components/schemas/SuccessResponse' },
            {
              type: 'object',
              properties: {
                data: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Resource' },
                },
                total: {
                  type: 'integer',
                  description: 'Total number of resources matching the query',
                  example: 25,
                },
                limit: {
                  type: 'integer',
                  description: 'Number of resources per page',
                  example: 10,
                },
                offset: {
                  type: 'integer',
                  description: 'Number of resources skipped',
                  example: 0,
                },
                hasNext: {
                  type: 'boolean',
                  description: 'Whether there are more resources available',
                  example: true,
                },
                hasPrev: {
                  type: 'boolean',
                  description: 'Whether there are previous resources available',
                  example: false,
                },
              },
            },
          ],
        },
      },
    },
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'], // paths to files containing OpenAPI definitions
};

const specs = swaggerJsdoc(options);

export { swaggerUi, specs };