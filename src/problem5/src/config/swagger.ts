import swaggerJsdoc from "swagger-jsdoc";

const swaggerDefinition: swaggerJsdoc.Options["definition"] = {
  openapi: "3.0.3",
  info: {
    title: "Problem 5 CRUD API",
    version: "1.0.0",
    description: "A RESTful CRUD API built with Express.js, TypeScript, MongoDB, and Bearer token authentication."
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Local development server"
    }
  ],
  tags: [
    {
      name: "Resources",
      description: "CRUD endpoints for resource management"
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "Token"
      }
    },
    schemas: {
      Resource: {
        type: "object",
        properties: {
          id: {
            type: "string",
            example: "680f4478d2ef40f533f51111"
          },
          name: {
            type: "string",
            example: "Test Resource"
          },
          value: {
            type: "string",
            example: "xxxxx"
          },
          description: {
            type: "string",
            example: "A test resource"
          },
          status: {
            type: "integer",
            enum: [0, 1],
            example: 1
          },
          createdAt: {
            type: "string",
            format: "date-time"
          },
          updatedAt: {
            type: "string",
            format: "date-time"
          },
          detail: {
            type: "object",
            additionalProperties: true,
            example: {}
          }
        },
        required: ["id", "name", "value", "description", "status", "createdAt", "updatedAt", "detail"]
      },
      CreateResourceRequest: {
        type: "object",
        required: ["name", "value"],
        properties: {
          name: {
            type: "string",
            example: "Test Resource"
          },
          value: {
            type: "string",
            example: "xxxxx"
          },
          description: {
            type: "string",
            example: "A test resource"
          },
          status: {
            type: "integer",
            enum: [0, 1],
            example: 1
          },
          detail: {
            type: "object",
            additionalProperties: true,
            example: {
              scope: "integration-test"
            }
          }
        }
      },
      UpdateResourceRequest: {
        type: "object",
        properties: {
          name: {
            type: "string"
          },
          value: {
            type: "string"
          },
          description: {
            type: "string"
          },
          status: {
            type: "integer",
            enum: [0, 1]
          },
          detail: {
            type: "object",
            additionalProperties: true
          }
        }
      },
      ErrorResponse: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: false
          },
          error: {
            type: "object",
            properties: {
              code: {
                type: "string",
                example: "UNAUTHORIZED"
              },
              message: {
                type: "string",
                example: "Missing Bearer token."
              }
            }
          }
        }
      }
    }
  }
};

export const swaggerSpec = swaggerJsdoc({
  definition: swaggerDefinition,
  apis: []
}) as swaggerJsdoc.OAS3Definition & {
  paths: Record<string, unknown>;
};

swaggerSpec.paths = {
  "/resources": {
    get: {
      tags: ["Resources"],
      summary: "List resources",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "query",
          name: "name",
          schema: { type: "string" },
          description: "Case-insensitive partial match on resource name."
        },
        {
          in: "query",
          name: "status",
          schema: { type: "integer", enum: [0, 1] },
          description: "Filter by status."
        }
      ],
      responses: {
        "200": {
          description: "Resources returned successfully."
        },
        "401": {
          description: "Unauthorized.",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse"
              }
            }
          }
        }
      }
    },
    post: {
      tags: ["Resources"],
      summary: "Create a resource",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/CreateResourceRequest"
            }
          }
        }
      },
      responses: {
        "201": {
          description: "Resource created successfully."
        },
        "401": {
          description: "Unauthorized."
        }
      }
    }
  },
  "/resources/{id}": {
    get: {
      tags: ["Resources"],
      summary: "Get resource details",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "id",
          required: true,
          schema: { type: "string" }
        }
      ],
      responses: {
        "200": {
          description: "Resource returned successfully."
        },
        "404": {
          description: "Resource not found."
        }
      }
    },
    put: {
      tags: ["Resources"],
      summary: "Update a resource",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "id",
          required: true,
          schema: { type: "string" }
        }
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/UpdateResourceRequest"
            }
          }
        }
      },
      responses: {
        "200": {
          description: "Resource updated successfully."
        },
        "404": {
          description: "Resource not found."
        }
      }
    },
    delete: {
      tags: ["Resources"],
      summary: "Delete a resource",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "id",
          required: true,
          schema: { type: "string" }
        }
      ],
      responses: {
        "204": {
          description: "Resource deleted successfully."
        },
        "404": {
          description: "Resource not found."
        }
      }
    }
  }
};
