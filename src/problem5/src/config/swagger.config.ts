import { OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import swaggerUi from 'swagger-ui-express';
import type { Express } from 'express';

import { registerProductSchemas } from '@/interfaces/http/schemas/zod/product.openapi';

export class SwaggerConfig {
  private static readonly registry = new OpenAPIRegistry();

  /**
   * Registers all OpenAPI schemas.
   */
  static registerSchemas(): void {
    registerProductSchemas(this.registry);
  }

  /**
   * Sets up Swagger UI using the registered OpenAPI schemas.
   * @param app Express application instance
   */
  static setup(app: Express): void {
    const generator = new OpenApiGeneratorV3(this.registry.definitions);
    const document = generator.generateDocument({
      openapi: '3.0.0',
      info: {
        title: 'Simple CRUD API',
        version: '1.0.0',
        description: 'REST API documentation for Simple CRUD System',
      },
      servers: [
        {
          url: '/api/v1',
        },
      ],
      tags: [
        {
          name: 'Products',
          description: 'Operations related to products',
        },
      ],
    });

    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(document));
  }
}
