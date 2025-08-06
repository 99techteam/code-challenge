import { z } from "zod";
import { extendZodWithOpenApi, OpenAPIRegistry, OpenAPIGenerator } from "@asteasolutions/zod-to-openapi";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";
import { ProductSchema, ProductWithIdSchema } from "../schemas/productSchema";

extendZodWithOpenApi(z);

const registry = new OpenAPIRegistry();

registry.register("Product", ProductSchema);
registry.register("ProductResponse", ProductWithIdSchema);

// GET /products - List products
registry.registerPath({
  method: "get",
  path: "/products",
  responses: {
    200: {
      description: "List of products",
      content: {
        "application/json": {
          schema: ProductWithIdSchema.array(),
        },
      },
    },
  },
});

// GET /products/{id} - Get product by ID
registry.registerPath({
  method: "get",
  path: "/products/{id}",
  request: {
    params: z.object({
      id: z.string().openapi({ description: "Product ID" }),
    }),
  },
  responses: {
    200: {
      description: "Product found",
      content: {
        "application/json": {
          schema: ProductWithIdSchema,
        },
      },
    },
    404: {
      description: "Product not found",
    },
  },
});

// POST /products - Create new product
registry.registerPath({
  method: "post",
  path: "/products",
  request: {
    body: {
      content: {
        "application/json": {
          schema: ProductSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Product created",
      content: {
        "application/json": {
          schema: ProductWithIdSchema,
        },
      },
    },
    400: {
      description: "Invalid input",
    },
  },
});

// PUT /products/{id} - Update product
registry.registerPath({
  method: "put",
  path: "/products/{id}",
  request: {
    params: z.object({
      id: z.string().openapi({ description: "Product ID" }),
    }),
    body: {
      content: {
        "application/json": {
          schema: ProductSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Product updated",
      content: {
        "application/json": {
          schema: ProductWithIdSchema,
        },
      },
    },
    404: {
      description: "Product not found",
    },
  },
});

// DELETE /products/{id} - Delete product
registry.registerPath({
  method: "delete",
  path: "/products/{id}",
  request: {
    params: z.object({
      id: z.string().openapi({ description: "Product ID" }),
    }),
  },
  responses: {
    204: {
      description: "Product deleted",
    },
    404: {
      description: "Product not found",
    },
  },
});

export function swaggerDocs(app: Express) {
  const generator = new OpenAPIGenerator(registry.definitions, "3.0.0");

  const document = generator.generateDocument({
    info: {
      title: "Product API",
      version: "1.0.0",
    },
    servers: [{ url: "http://localhost:3000" }],
  });

  app.use("/docs", swaggerUi.serve, swaggerUi.setup(document));
}
