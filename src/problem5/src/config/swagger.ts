import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Crude Server API",
      version: "1.0.0",
      description: "Simple CRUD API with Express + TypeORM",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
  },
  apis: ["src/routes/*.ts"], // đọc comment trong routes
};

export const swaggerSpec = swaggerJsdoc(options);
