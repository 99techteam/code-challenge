import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Express MongoDB CRUD API',
    version: '1.0.0',
    description: 'API for managing resources with CRUD operations',
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Local server',
    },
  ],
  paths: {
    '/api/resources': {
      post: {
        summary: 'Create a new resource',
        tags: ['Resources'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'Resource Name' },
                  description: { type: 'string', example: 'Resource Description' },
                  value: { type: 'number', example: 100 },
                },
                required: ['name', 'value'],
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Resource created successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Resource' },
              },
            },
          },
          '400': { description: 'Validation error' },
        },
      },
      get: {
        summary: 'List resources with optional filters',
        tags: ['Resources'],
        parameters: [
          {
            name: 'name',
            in: 'query',
            schema: { type: 'string' },
            description: 'Filter by resource name (partial match)',
          },
          {
            name: 'minValue',
            in: 'query',
            schema: { type: 'number' },
            description: 'Filter by minimum value',
          },
          {
            name: 'maxValue',
            in: 'query',
            schema: { type: 'number' },
            description: 'Filter by maximum value',
          },
        ],
        responses: {
          '200': {
            description: 'List of resources',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Resource' },
                },
              },
            },
          },
        },
      },
    },
    '/api/resources/{id}': {
      get: {
        summary: 'Get a resource by ID',
        tags: ['Resources'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Resource ID',
          },
        ],
        responses: {
          '200': {
            description: 'Resource details',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Resource' },
              },
            },
          },
          '404': { description: 'Resource not found' },
        },
      },
      put: {
        summary: 'Update a resource by ID',
        tags: ['Resources'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Resource ID',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'Updated Name' },
                  description: { type: 'string', example: 'Updated Description' },
                  value: { type: 'number', example: 200 },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Resource updated successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Resource' },
              },
            },
          },
          '400': { description: 'Validation error' },
          '404': { description: 'Resource not found' },
        },
      },
      delete: {
        summary: 'Delete a resource by ID',
        tags: ['Resources'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Resource ID',
          },
        ],
        responses: {
          '200': { description: 'Resource deleted successfully' },
          '404': { description: 'Resource not found' },
        },
      },
    },
  },
  components: {
    schemas: {
      Resource: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
          name: { type: 'string', example: 'Resource Name' },
          description: { type: 'string', example: 'Resource Description' },
          value: { type: 'number', example: 100 },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  },
};

export const setupSwagger = (app: Express) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};