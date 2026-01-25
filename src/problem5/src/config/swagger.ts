import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CRUD API Server',
      version: '1.0.0',
      description: 'A RESTful CRUD API server built with Express.js and TypeScript',
      contact: {
        name: 'API Support',
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
        name: 'Resources',
        description: 'Resource management endpoints',
      },
    ],
    components: {
      schemas: {
        Resource: {
          type: 'object',
          required: ['id', 'name', 'description', 'type', 'status', 'createdAt', 'updatedAt'],
          properties: {
            id: {
              type: 'string',
              description: 'Unique resource identifier',
              example: 'resource_1234567890_abc123',
            },
            name: {
              type: 'string',
              description: 'Resource name',
              example: 'Web Server',
            },
            description: {
              type: 'string',
              description: 'Resource description',
              example: 'Main production web server',
            },
            type: {
              type: 'string',
              description: 'Resource type',
              example: 'server',
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive'],
              description: 'Resource status',
              example: 'active',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
            },
            metadata: {
              type: 'object',
              description: 'Additional resource metadata',
              additionalProperties: true,
            },
          },
        },
        CreateResourceDTO: {
          type: 'object',
          required: ['name', 'description', 'type'],
          properties: {
            name: {
              type: 'string',
              description: 'Resource name',
              example: 'New Server',
            },
            description: {
              type: 'string',
              description: 'Resource description',
              example: 'Production server instance',
            },
            type: {
              type: 'string',
              description: 'Resource type',
              example: 'server',
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive'],
              description: 'Resource status (optional, defaults to active)',
              example: 'active',
            },
            metadata: {
              type: 'object',
              description: 'Additional metadata (optional)',
              additionalProperties: true,
            },
          },
        },
        UpdateResourceDTO: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Resource name',
            },
            description: {
              type: 'string',
              description: 'Resource description',
            },
            type: {
              type: 'string',
              description: 'Resource type',
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive'],
              description: 'Resource status',
            },
            metadata: {
              type: 'object',
              description: 'Additional metadata',
              additionalProperties: true,
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
            data: {
              $ref: '#/components/schemas/Resource',
            },
          },
        },
        ListResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            count: {
              type: 'number',
              example: 10,
            },
            data: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Resource',
              },
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
            message: {
              type: 'string',
              example: 'Error message',
            },
            error: {
              type: 'string',
              example: 'Detailed error information',
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
