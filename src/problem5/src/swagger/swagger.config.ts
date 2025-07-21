import swaggerJsdoc from 'swagger-jsdoc';
import { SwaggerDefinition } from 'swagger-jsdoc';

const swaggerDefinition: SwaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Resource Management API with CQRS',
    version: '1.0.0',
    description: `
      A RESTful CRUD API built with TypeScript, Express.js, and MySQL implementing CQRS architecture.
      `,
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server'
    },
  ],
  components: {
    schemas: {
      Resource: {
        type: 'object',
        required: ['id', 'name', 'description', 'isActive'],
        properties: {
          id: {
            type: 'integer',
            description: 'Unique identifier for the resource',
            example: 1
          },
          name: {
            type: 'string',
            description: 'Resource name',
            minLength: 1,
            maxLength: 255,
            example: 'Sample Resource'
          },
          description: {
            type: 'string',
            description: 'Resource description',
            minLength: 1,
            example: 'This is a detailed description of the resource'
          },
          category: {
            type: 'string',
            description: 'Resource category',
            maxLength: 100,
            example: 'Development',
            nullable: true
          },
          isActive: {
            type: 'boolean',
            description: 'Whether the resource is active',
            example: true
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Resource creation timestamp',
            example: '2023-12-01T10:00:00.000Z'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Resource last update timestamp',
            example: '2023-12-01T10:00:00.000Z'
          }
        }
      },
      CreateResourceDto: {
        type: 'object',
        required: ['name', 'description'],
        properties: {
          name: {
            type: 'string',
            description: 'Resource name',
            minLength: 1,
            maxLength: 255,
            example: 'New Resource'
          },
          description: {
            type: 'string',
            description: 'Resource description',
            minLength: 1,
            example: 'A comprehensive description of the new resource'
          },
          category: {
            type: 'string',
            description: 'Resource category (optional)',
            maxLength: 100,
            example: 'Development'
          },
          isActive: {
            type: 'boolean',
            description: 'Resource active status (defaults to true)',
            example: true
          }
        }
      },
      UpdateResourceDto: {
        type: 'object',
        minProperties: 1,
        properties: {
          name: {
            type: 'string',
            description: 'Resource name',
            minLength: 1,
            maxLength: 255,
            example: 'Updated Resource Name'
          },
          description: {
            type: 'string',
            description: 'Resource description',
            minLength: 1,
            example: 'Updated resource description'
          },
          category: {
            type: 'string',
            description: 'Resource category',
            maxLength: 100,
            example: 'Updated Category'
          },
          isActive: {
            type: 'boolean',
            description: 'Resource active status',
            example: false
          }
        }
      },
      ApiResponse: {
        type: 'object',
        required: ['success'],
        properties: {
          success: {
            type: 'boolean',
            description: 'Indicates if the request was successful'
          },
          message: {
            type: 'string',
            description: 'Success message'
          },
          error: {
            type: 'string',
            description: 'Error message'
          }
        }
      },
      ResourceResponse: {
        allOf: [
          { $ref: '#/components/schemas/ApiResponse' },
          {
            type: 'object',
            properties: {
              data: {
                $ref: '#/components/schemas/Resource'
              }
            }
          }
        ]
      },
      ResourceListResponse: {
        allOf: [
          { $ref: '#/components/schemas/ApiResponse' },
          {
            type: 'object',
            properties: {
              data: {
                type: 'object',
                properties: {
                  data: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/Resource'
                    }
                  },
                  total: {
                    type: 'integer',
                    description: 'Total number of resources matching filters'
                  },
                  limit: {
                    type: 'integer',
                    description: 'Number of resources per page'
                  },
                  offset: {
                    type: 'integer',
                    description: 'Number of resources skipped'
                  }
                }
              }
            }
          }
        ]
      },
      ErrorResponse: {
        allOf: [
          { $ref: '#/components/schemas/ApiResponse' },
          {
            type: 'object',
            properties: {
              success: {
                type: 'boolean',
                example: false
              },
              error: {
                type: 'string',
                example: 'Validation failed'
              },
              details: {
                type: 'array',
                items: {
                  type: 'string'
                },
                description: 'Detailed error messages',
                example: ['Name is required', 'Description must be a string']
              }
            }
          }
        ]
      },
      HealthResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true
          },
          message: {
            type: 'string',
            example: 'Server is running'
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            example: '2023-12-01T10:00:00.000Z'
          }
        }
      }
    },
    parameters: {
      ResourceId: {
        name: 'id',
        in: 'path',
        required: true,
        schema: {
          type: 'integer',
          minimum: 1
        },
        description: 'Resource ID'
      },
      NameFilter: {
        name: 'name',
        in: 'query',
        schema: {
          type: 'string'
        },
        description: 'Filter resources by name (partial match)'
      },
      CategoryFilter: {
        name: 'category',
        in: 'query',
        schema: {
          type: 'string'
        },
        description: 'Filter resources by category (exact match)'
      },
      IsActiveFilter: {
        name: 'isActive',
        in: 'query',
        schema: {
          type: 'boolean'
        },
        description: 'Filter resources by active status'
      },
      Limit: {
        name: 'limit',
        in: 'query',
        schema: {
          type: 'integer',
          minimum: 1,
          maximum: 100,
          default: 10
        },
        description: 'Number of resources to return'
      },
      Offset: {
        name: 'offset',
        in: 'query',
        schema: {
          type: 'integer',
          minimum: 0,
          default: 0
        },
        description: 'Number of resources to skip'
      }
    },
    responses: {
      NotFound: {
        description: 'Resource not found',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse'
            },
            example: {
              success: false,
              error: 'Resource not found'
            }
          }
        }
      },
      ValidationError: {
        description: 'Validation failed',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse'
            },
            example: {
              success: false,
              error: 'Validation failed',
              details: [
                'Name is required',
                'Description must be a string'
              ]
            }
          }
        }
      },
      InternalError: {
        description: 'Internal server error',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse'
            },
            example: {
              success: false,
              error: 'Internal server error'
            }
          }
        }
      }
    }
  },
  tags: [
    {
      name: 'Resources',
      description: 'Resource management operations (CQRS pattern)'
    },
    {
      name: 'Categories',
      description: 'Resource category operations'
    },
    {
      name: 'Health',
      description: 'System health check'
    }
  ]
};

const options: swaggerJsdoc.Options = {
  definition: swaggerDefinition,
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'], // paths to files containing OpenAPI definitions
};

export const swaggerSpec = swaggerJsdoc(options); 