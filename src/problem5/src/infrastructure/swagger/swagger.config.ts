import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Task Management API",
      version: "1.0.0",
      description:
        "RESTful CRUD API for managing tasks — 99Tech Code Challenge Problem 5",
    },
    servers: [
      {
        url: "http://localhost:{port}/api",
        description: "Local development server",
        variables: {
          port: { default: "3000" },
        },
      },
    ],
    components: {
      schemas: {
        TaskStatus: {
          type: "string",
          enum: ["TODO", "IN_PROGRESS", "DONE"],
          example: "TODO",
        },
        TaskPriority: {
          type: "string",
          enum: ["LOW", "MEDIUM", "HIGH"],
          example: "MEDIUM",
        },
        Task: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
              example: "550e8400-e29b-41d4-a716-446655440000",
            },
            title: {
              type: "string",
              maxLength: 200,
              example: "Set up CI/CD pipeline",
            },
            description: {
              type: "string",
              nullable: true,
              example: "Configure GitHub Actions for automated testing",
            },
            status: { $ref: "#/components/schemas/TaskStatus" },
            priority: { $ref: "#/components/schemas/TaskPriority" },
            dueDate: {
              type: "string",
              format: "date",
              nullable: true,
              example: "2025-06-30",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2024-01-01T12:00:00.000Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              example: "2024-01-01T12:00:00.000Z",
            },
          },
        },
        CreateTaskBody: {
          type: "object",
          required: ["title"],
          properties: {
            title: { type: "string", maxLength: 200, example: "Write unit tests" },
            description: { type: "string", example: "Cover service and controller layers" },
            status: { $ref: "#/components/schemas/TaskStatus" },
            priority: { $ref: "#/components/schemas/TaskPriority" },
            dueDate: { type: "string", format: "date", example: "2025-09-01" },
          },
        },
        UpdateTaskBody: {
          type: "object",
          properties: {
            title: { type: "string", maxLength: 200, example: "Updated title" },
            description: { type: "string", example: "Updated description" },
            status: { $ref: "#/components/schemas/TaskStatus" },
            priority: { $ref: "#/components/schemas/TaskPriority" },
            dueDate: { type: "string", format: "date", example: "2025-12-31" },
          },
        },
        TaskListResponse: {
          type: "object",
          properties: {
            data: {
              type: "array",
              items: { $ref: "#/components/schemas/Task" },
            },
            total: { type: "integer", example: 42 },
            page: { type: "integer", example: 1 },
            limit: { type: "integer", example: 10 },
            totalPages: { type: "integer", example: 5 },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            status: { type: "string", example: "error" },
            message: { type: "string", example: "Task not found" },
            errors: {
              type: "array",
              items: { type: "string" },
              example: ["title must not be empty"],
            },
          },
        },
        HealthResponse: {
          type: "object",
          properties: {
            status: { type: "string", example: "ok" },
            timestamp: { type: "string", format: "date-time" },
            database: { type: "string", example: "connected" },
          },
        },
      },
    },
    paths: {
      "/health": {
        get: {
          tags: ["Health"],
          summary: "Health check",
          responses: {
            "200": {
              description: "Service is healthy",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/HealthResponse" },
                },
              },
            },
          },
        },
      },
      "/tasks": {
        get: {
          tags: ["Tasks"],
          summary: "List tasks",
          description:
            "Returns a paginated, filterable, and sortable list of tasks.",
          parameters: [
            {
              name: "search",
              in: "query",
              description: "Case-insensitive search across title and description",
              schema: { type: "string" },
            },
            {
              name: "status",
              in: "query",
              description: "Filter by status",
              schema: { $ref: "#/components/schemas/TaskStatus" },
            },
            {
              name: "priority",
              in: "query",
              description: "Filter by priority",
              schema: { $ref: "#/components/schemas/TaskPriority" },
            },
            {
              name: "sort_by",
              in: "query",
              description: "Field to sort by",
              schema: {
                type: "string",
                enum: ["title", "status", "priority", "dueDate", "createdAt"],
                default: "createdAt",
              },
            },
            {
              name: "sort_order",
              in: "query",
              description: "Sort direction",
              schema: {
                type: "string",
                enum: ["ASC", "DESC"],
                default: "DESC",
              },
            },
            {
              name: "page",
              in: "query",
              description: "Page number (min: 1)",
              schema: { type: "integer", minimum: 1, default: 1 },
            },
            {
              name: "limit",
              in: "query",
              description: "Items per page (min: 1, max: 100)",
              schema: {
                type: "integer",
                minimum: 1,
                maximum: 100,
                default: 10,
              },
            },
          ],
          responses: {
            "200": {
              description: "Paginated task list",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/TaskListResponse" },
                },
              },
            },
            "400": {
              description: "Invalid query parameters",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
        post: {
          tags: ["Tasks"],
          summary: "Create a task",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CreateTaskBody" },
              },
            },
          },
          responses: {
            "201": {
              description: "Task created",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Task" },
                },
              },
            },
            "400": {
              description: "Validation error",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },
      "/tasks/{id}": {
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Task UUID",
            schema: { type: "string", format: "uuid" },
          },
        ],
        get: {
          tags: ["Tasks"],
          summary: "Get a task by ID",
          responses: {
            "200": {
              description: "Task found",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Task" },
                },
              },
            },
            "404": {
              description: "Task not found",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
        put: {
          tags: ["Tasks"],
          summary: "Update a task",
          description: "Partially updates a task. Only supplied fields are changed.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UpdateTaskBody" },
              },
            },
          },
          responses: {
            "200": {
              description: "Task updated",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Task" },
                },
              },
            },
            "400": {
              description: "Validation error",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            "404": {
              description: "Task not found",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
        delete: {
          tags: ["Tasks"],
          summary: "Delete a task",
          responses: {
            "200": {
              description: "Task deleted",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: {
                        type: "string",
                        example: "Task deleted successfully",
                      },
                      task: { $ref: "#/components/schemas/Task" },
                    },
                  },
                },
              },
            },
            "404": {
              description: "Task not found",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
