import express from "express";
import request from "supertest";

jest.mock("../book.service");
jest.mock("../book.schema");

import * as bookService from "../book.service";

const createTestApp = () => {
  const app = express();
  app.use(express.json());

  // Inline routes to avoid importing from index which has side effects
  const {
    createBook,
    listBooks,
    getBookById,
    updateBook,
    deleteBook,
  } = require("../book.controller");
  const { bookIdValidator, createBookValidator } = require("../book.validator");

  app.post("/books", createBook);
  app.get("/books", listBooks);
  app.get("/books/:id", getBookById);
  app.put("/books/:id", updateBook);
  app.delete("/books/:id", deleteBook);

  return app;
};

describe("book.controller", () => {
  let app: express.Express;

  beforeEach(() => {
    jest.clearAllMocks();
    app = createTestApp();
  });

  const mockBook = {
    _id: "507f1f77bcf86cd799439011",
    title: "Test Book",
    author: "Test Author",
    publisher: "Test Publisher",
    publishedDate: "2024-01-01T00:00:00.000Z",
    country: "US",
    createdAt: "2026-04-21T17:10:39.731Z",
    updatedAt: "2026-04-21T17:10:39.731Z",
  };

  describe("POST /books", () => {
    it("should create a book and return 201", async () => {
      (bookService.createBook as jest.Mock).mockResolvedValue(mockBook);

      const response = await request(app)
        .post("/books")
        .send({
          title: "Test Book",
          author: "Test Author",
          publisher: "Test Publisher",
          publishedDate: "2024-01-01",
          country: "US",
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe("Book created successfully!");
      expect(response.body.data).toEqual(mockBook);
    });

    it("should return 400 when validation fails", async () => {
      const response = await request(app)
        .post("/books")
        .send({
          title: "Test Book",
          // missing required fields
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
      expect(Array.isArray(response.body.errors)).toBe(true);
    });
  });

  describe("GET /books", () => {
    it("should return paginated list of books", async () => {
      const mockListResult = {
        total: 1,
        page: 1,
        limit: 10,
        data: [mockBook],
      };
      (bookService.listBooks as jest.Mock).mockResolvedValue(mockListResult);

      const response = await request(app).get("/books");

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("List books successfully!");
      expect(response.body.data).toEqual(mockListResult);
    });

    it("should pass query parameters to service", async () => {
      const mockListResult = { total: 0, page: 1, limit: 10, data: [] };
      (bookService.listBooks as jest.Mock).mockResolvedValue(mockListResult);

      const response = await request(app)
        .get("/books")
        .query({ title: "Test", author: "Jane" });

      expect(response.status).toBe(200);
      expect(bookService.listBooks).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Test", author: "Jane" })
      );
    });
  });

  describe("GET /books/:id", () => {
    it("should return book when found", async () => {
      (bookService.getBookById as jest.Mock).mockResolvedValue(mockBook);

      const response = await request(app).get("/books/507f1f77bcf86cd799439011");

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Book found successfully!");
      expect(response.body.data).toEqual(mockBook);
    });

    it("should return 400 for invalid book ID", async () => {
      const response = await request(app).get("/books/invalid-id");

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe("PUT /books/:id", () => {
    it("should update book and return 200", async () => {
      const updatedBook = { ...mockBook, title: "Updated Title" };
      (bookService.updateBook as jest.Mock).mockResolvedValue(updatedBook);

      const response = await request(app)
        .put("/books/507f1f77bcf86cd799439011")
        .send({ title: "Updated Title" });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Book updated successfully!");
      expect(response.body.data.title).toBe("Updated Title");
    });

    it("should return 400 for invalid book ID", async () => {
      const response = await request(app)
        .put("/books/invalid-id")
        .send({ title: "Updated Title" });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe("DELETE /books/:id", () => {
    it("should delete book and return 200", async () => {
      (bookService.deleteBook as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app).delete("/books/507f1f77bcf86cd799439011");

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Book deleted successfully!");
    });

    it("should return 400 for invalid book ID", async () => {
      const response = await request(app).delete("/books/invalid-id");

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });
  });
});
