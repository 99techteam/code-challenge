export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "Problem 4 Items API",
    version: "1.0.0",
    description:
      "CRUD API for items backed by SQLite. List supports `category`, `search`, `limit`, and `offset` query parameters.",
  },
  servers: [{ url: "/", description: "Current host" }],
  tags: [{ name: "Health" }, { name: "Items" }],
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        responses: {
          "200": {
            description: "Service is running",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { status: { type: "string", example: "ok" } },
                  required: ["status"],
                },
              },
            },
          },
        },
      },
    },
    "/api/items": {
      get: {
        tags: ["Items"],
        summary: "List items",
        description: "Returns items with optional filters and pagination.",
        parameters: [
          {
            name: "category",
            in: "query",
            schema: { type: "string" },
            description: "Exact category match",
          },
          {
            name: "search",
            in: "query",
            schema: { type: "string" },
            description: "Case-insensitive match on name or description",
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", minimum: 1, maximum: 200, default: 50 },
            description: "Page size (default 50, max 200)",
          },
          {
            name: "offset",
            in: "query",
            schema: { type: "integer", minimum: 0, default: 0 },
            description: "Rows to skip",
          },
        ],
        responses: {
          "200": {
            description: "Array of items",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/Item" } },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
        },
      },
      post: {
        tags: ["Items"],
        summary: "Create item",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ItemCreate" },
            },
          },
        },
        responses: {
          "201": {
            description: "Created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Item" },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
        },
      },
    },
    "/api/items/{id}": {
      get: {
        tags: ["Items"],
        summary: "Get item by id",
        parameters: [{ $ref: "#/components/parameters/ItemId" }],
        responses: {
          "200": {
            description: "Item",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Item" },
              },
            },
          },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
      patch: {
        tags: ["Items"],
        summary: "Update item",
        parameters: [{ $ref: "#/components/parameters/ItemId" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ItemPatch" },
            },
          },
        },
        responses: {
          "200": {
            description: "Updated item",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Item" },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
      delete: {
        tags: ["Items"],
        summary: "Delete item",
        parameters: [{ $ref: "#/components/parameters/ItemId" }],
        responses: {
          "204": { description: "Deleted" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },
  },
  components: {
    parameters: {
      ItemId: {
        name: "id",
        in: "path",
        required: true,
        schema: { type: "string", format: "uuid" },
      },
    },
    schemas: {
      Item: {
        type: "object",
        required: ["id", "name", "description", "category", "createdAt", "updatedAt"],
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string" },
          description: { type: "string" },
          category: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      ItemCreate: {
        type: "object",
        required: ["name"],
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          category: { type: "string", default: "general" },
        },
      },
      ItemPatch: {
        type: "object",
        minProperties: 1,
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          category: { type: "string" },
        },
      },
      Error: {
        type: "object",
        required: ["error"],
        properties: { error: { type: "string" } },
      },
    },
    responses: {
      NotFound: {
        description: "Resource not found",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
          },
        },
      },
      BadRequest: {
        description: "Invalid input",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
          },
        },
      },
    },
  },
} as const;
