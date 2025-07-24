import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

export const CreateProductSchema = z.object({
  id: z.uuid().optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().nonnegative(),
  stock: z.number().int().nonnegative(),
  tags: z.array(z.string()).optional(),
  slug: z.string().optional(),
  category: z.string().min(1),
  createdAt: z.iso.datetime().optional(),
  updatedAt: z.iso.datetime().optional(),
});

export const UpdateProductSchema = CreateProductSchema.partial();

export const registerProductSchemas = (registry: OpenAPIRegistry) => {
  registry.register('CreateProductDto', CreateProductSchema.openapi({ title: 'CreateProductDto' }));
  registry.register('UpdateProductDto', UpdateProductSchema.openapi({ title: 'UpdateProductDto' }));

  registry.registerPath({
    method: 'get',
    path: '/products',
    tags: ['Products'],
    responses: {
      200: {
        description: 'Get all products',
      },
    },
  });

  registry.registerPath({
    method: 'get',
    path: '/products/{id}',
    tags: ['Products'],
    request: {
      params: z.object({
        id: z.uuid(),
      }),
    },
    responses: {
      200: {
        description: 'Get product by ID',
      },
      404: {
        description: 'Product not found',
      },
    },
  });

  registry.registerPath({
    method: 'post',
    path: '/products',
    tags: ['Products'],
    request: {
      body: {
        content: {
          'application/json': {
            schema: CreateProductSchema,
          },
        },
      },
    },
    responses: {
      201: {
        description: 'Product created',
      },
      400: {
        description: 'Invalid input',
      },
    },
  });

  registry.registerPath({
    method: 'put',
    path: '/products/{id}',
    tags: ['Products'],
    request: {
      params: z.object({
        id: z.string().openapi({ description: 'Product ID to update' }),
      }),
      body: {
        content: {
          'application/json': {
            schema: UpdateProductSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Product updated',
      },
      400: {
        description: 'Invalid input',
      },
      404: {
        description: 'Product not found',
      },
    },
  });

  registry.registerPath({
    method: 'delete',
    path: '/products/{id}',
    tags: ['Products'],
    request: {
      params: z.object({
        id: z.uuid(),
      }),
    },
    responses: {
      204: {
        description: 'Product deleted',
      },
      404: {
        description: 'Product not found',
      },
    },
  });
};
