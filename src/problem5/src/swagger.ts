// src/swagger.ts
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Application } from 'express';
import { port } from './config';

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version: '1.0.0',
      description: 'API documentation using Swagger',
    },
    servers: [
      {
        url: `http://localhost:${port}`,
      },
    ],
    components: {
      schemas: {
        CreateUserDto: {
          type: 'object',
          required: ['firstName', 'lastName', 'email'],
          properties: {
            firstName: {
              type: 'string',
              description: 'First name of the user',
              example: 'John',
            },
            lastName: {
              type: 'string',
              description: 'Last name of the user',
              example: 'Doe',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
              example: 'john.doe@example.com',
            },
          },
        },
        UpdateUserDto: {
          type: 'object',
          properties: {
            firstName: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
              description: 'Updated first name',
              example: 'John Updated',
            },
            lastName: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
              description: 'Updated last name',
              example: 'Doe Updated',
            },
            gender: {
              type: 'integer',
              enum: [0, 1],
              description: 'Gender: 0 for female, 1 for male',
              example: 1,
            },
            createdBy: {
              type: 'string',
              format: 'uuid',
              description: 'ID of the user who created this user',
              example: '550e8400-e29b-41d4-a716-446655440000',
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.route.ts', './src/controllers/*.ts'], // Adjust the path to where your route files are
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

export const setupSwagger = (app: Application): void => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};