import { createBookValidator, bookIdValidator } from "../book.validator";
import mongoose from "mongoose";

describe("book.validator", () => {
  describe("createBookValidator", () => {
    it("should return valid=true when all required fields are provided", () => {
      const result = createBookValidator({
        title: "Test Book",
        author: "Test Author",
        publisher: "Test Publisher",
        publishedDate: "2024-01-01",
        country: "US",
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it("should return valid=false when data is null", () => {
      const result = createBookValidator(null);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Invalid request.body");
    });

    it("should return valid=false when data is not an object", () => {
      const result = createBookValidator("string");

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Invalid request.body");
    });

    it("should return valid=false when title is missing", () => {
      const result = createBookValidator({
        author: "Test Author",
        publisher: "Test Publisher",
        publishedDate: "2024-01-01",
        country: "US",
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("title is required and must be a string.");
    });

    it("should return valid=false when title is not a string", () => {
      const result = createBookValidator({
        title: 123,
        author: "Test Author",
        publisher: "Test Publisher",
        publishedDate: "2024-01-01",
        country: "US",
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("title is required and must be a string.");
    });

    it("should return valid=false when author is missing", () => {
      const result = createBookValidator({
        title: "Test Book",
        publisher: "Test Publisher",
        publishedDate: "2024-01-01",
        country: "US",
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("author is required and must be a string.");
    });

    it("should return valid=false when publisher is missing", () => {
      const result = createBookValidator({
        title: "Test Book",
        author: "Test Author",
        publishedDate: "2024-01-01",
        country: "US",
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("publisher is required and must be a string.");
    });

    it("should return valid=false when publishedDate is invalid", () => {
      const result = createBookValidator({
        title: "Test Book",
        author: "Test Author",
        publisher: "Test Publisher",
        publishedDate: "invalid-date",
        country: "US",
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("publishedDate is required and must be a valid date string.");
    });

    it("should return valid=false when country is missing", () => {
      const result = createBookValidator({
        title: "Test Book",
        author: "Test Author",
        publisher: "Test Publisher",
        publishedDate: "2024-01-01",
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("country is required and must be a string.");
    });

    it("should return multiple errors when multiple fields are invalid", () => {
      const result = createBookValidator({
        title: 123,
        author: 456,
        publisher: "Test Publisher",
        publishedDate: "invalid-date",
        country: "US",
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("title is required and must be a string.");
      expect(result.errors).toContain("author is required and must be a string.");
      expect(result.errors).toContain("publishedDate is required and must be a valid date string.");
    });
  });

  describe("bookIdValidator", () => {
    it("should return valid=true for a valid ObjectId", () => {
      const validId = new mongoose.Types.ObjectId().toString();
      const result = bookIdValidator(validId);

      expect(result.valid).toBe(true);
      expect(result.id).toBe(validId);
    });

    it("should return valid=false for null id", () => {
      const result = bookIdValidator(null);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Invalid book ID");
    });

    it("should return valid=false for undefined id", () => {
      const result = bookIdValidator(undefined);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Invalid book ID");
    });

    it("should return valid=false for non-string id", () => {
      const result = bookIdValidator(123);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Invalid book ID");
    });

    it("should return valid=false for invalid ObjectId string", () => {
      const result = bookIdValidator("not-a-valid-objectid");

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Invalid book ID");
    });

    it("should return valid=false for empty string", () => {
      const result = bookIdValidator("");

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Invalid book ID");
    });
  });
});
