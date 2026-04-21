import express from "express";
import request from "supertest";

jest.mock("../src/modules/books/book.service");
jest.mock("../src/mocks/seeds");

import * as bookService from "../src/modules/books/book.service";

const createApp = () => {
  const app = express();
  app.use(express.json());

  const {
    errorHandler,
    notFoundHandler,
  } = require("../src/middlewares/errors-handler.middleware");
  const { bookRouter } = require("../src/route/book.route");

  app.get("/", (_req: express.Request, res: express.Response) => {
    res.send("Resources (Books) API!");
  });

  app.use("/api/books", bookRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

describe("Books API E2E", () => {
  const app = createApp();
  const validApiKey = "random-api-key";

  const mockBook = {
    _id: "507f1f77bcf86cd799439011",
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    publisher: "Scribner",
    publishedDate: "1925-04-10",
    country: "US",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /", () => {
    it("should return welcome message", async () => {
      const response = await request(app).get("/");

      expect(response.status).toBe(200);
      expect(response.text).toBe("Resources (Books) API!");
    });
  });

  describe("POST /api/books", () => {
    it("should create a new book with valid data and API key", async () => {
      (bookService.createBook as jest.Mock).mockResolvedValue(mockBook);

      const response = await request(app)
        .post("/api/books")
        .set("x-api-key", validApiKey)
        .send({
          title: "The Great Gatsby",
          author: "F. Scott Fitzgerald",
          publisher: "Scribner",
          publishedDate: "1925-04-10",
          country: "US",
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe("Book created successfully!");
      expect(response.body.data).toBeDefined();
    });

    it("should return 401 without API key", async () => {
      const response = await request(app)
        .post("/api/books")
        .send({
          title: "The Great Gatsby",
          author: "F. Scott Fitzgerald",
          publisher: "Scribner",
          publishedDate: "1925-04-10",
          country: "US",
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe("Unauthorized access");
    });

    it("should return 400 with invalid request body", async () => {
      const response = await request(app)
        .post("/api/books")
        .set("x-api-key", validApiKey)
        .send({
          title: "The Great Gatsby",
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
      expect(Array.isArray(response.body.errors)).toBe(true);
    });
  });

  describe("GET /api/books", () => {
    it("should return list of books", async () => {
      (bookService.listBooks as jest.Mock).mockResolvedValue({
        total: 1,
        page: 1,
        limit: 10,
        data: [mockBook],
      });

      const response = await request(app).get("/api/books");

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("List books successfully!");
      expect(response.body.data.data).toHaveLength(1);
      expect(response.body.data.total).toBe(1);
    });

    it("should pass query parameters to listBooks", async () => {
      (bookService.listBooks as jest.Mock).mockResolvedValue({
        total: 0,
        page: 1,
        limit: 10,
        data: [],
      });

      const response = await request(app)
        .get("/api/books")
        .query({ title: "Gatsby", author: "Fitzgerald" });

      expect(response.status).toBe(200);
      expect(bookService.listBooks).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Gatsby",
          author: "Fitzgerald",
        })
      );
    });

    it("should support pagination parameters", async () => {
      (bookService.listBooks as jest.Mock).mockResolvedValue({
        total: 100,
        page: 2,
        limit: 20,
        data: [],
      });

      const response = await request(app)
        .get("/api/books")
        .query({ page: "2", limit: "20" });

      expect(response.status).toBe(200);
      expect(bookService.listBooks).toHaveBeenCalledWith(
        expect.objectContaining({ page: "2", limit: "20" })
      );
    });
  });

  describe("GET /api/books/:id", () => {
    it("should return a book by ID", async () => {
      (bookService.getBookById as jest.Mock).mockResolvedValue(mockBook);

      const response = await request(app).get("/api/books/507f1f77bcf86cd799439011");

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Book found successfully!");
      expect(response.body.data.title).toBe("The Great Gatsby");
    });

    it("should return 400 for invalid book ID format", async () => {
      const response = await request(app).get("/api/books/invalid-id");

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it("should return 404 when book not found", async () => {
      const AppError = require("../src/common/error-codes").AppError;
      (bookService.getBookById as jest.Mock).mockRejectedValue(new AppError("Book not found", 404));

      const response = await request(app).get("/api/books/507f1f77bcf86cd799439011");

      expect(response.status).toBe(404);
    });
  });

  describe("PATCH /api/books/:id", () => {
    it("should update a book with valid data", async () => {
      const updatedBook = { ...mockBook, title: "Updated Title" };
      (bookService.updateBook as jest.Mock).mockResolvedValue(updatedBook);

      const response = await request(app)
        .patch("/api/books/507f1f77bcf86cd799439011")
        .set("x-api-key", validApiKey)
        .send({ title: "Updated Title" });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Book updated successfully!");
      expect(response.body.data.title).toBe("Updated Title");
    });

    it("should return 401 without API key", async () => {
      const response = await request(app)
        .patch("/api/books/507f1f77bcf86cd799439011")
        .send({ title: "Updated Title" });

      expect(response.status).toBe(401);
    });

    it("should return 400 for invalid book ID", async () => {
      const response = await request(app)
        .patch("/api/books/invalid-id")
        .set("x-api-key", validApiKey)
        .send({ title: "Updated Title" });

      expect(response.status).toBe(400);
    });
  });

  describe("DELETE /api/books/:id", () => {
    it("should delete a book", async () => {
      (bookService.deleteBook as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .delete("/api/books/507f1f77bcf86cd799439011")
        .set("x-api-key", validApiKey);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Book deleted successfully!");
    });

    it("should return 401 without API key", async () => {
      const response = await request(app)
        .delete("/api/books/507f1f77bcf86cd799439011");

      expect(response.status).toBe(401);
    });

    it("should return 400 for invalid book ID", async () => {
      const response = await request(app)
        .delete("/api/books/invalid-id")
        .set("x-api-key", validApiKey);

      expect(response.status).toBe(400);
    });
  });

  describe("404 handling", () => {
    it("should return 404 for unknown routes", async () => {
      const response = await request(app).get("/api/unknown");

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("Not Found");
    });
  });
});
