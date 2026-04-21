import mongoose from "mongoose";
import { AppError } from "../../../common/error-codes";

const mockBook = {
  _id: new mongoose.Types.ObjectId(),
  title: "Test Book",
  author: "Test Author",
  publisher: "Test Publisher",
  publishedDate: new Date("2024-01-01"),
  country: "US",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockBookModel = {
  findOne: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
  countDocuments: jest.fn(),
};

const MockBook = jest.fn().mockImplementation((data: any) => ({
  ...data,
  _id: mockBook._id,
  save: jest.fn().mockResolvedValue({ ...mockBook, ...data }),
}));

Object.assign(MockBook, mockBookModel);

jest.mock("../book.schema", () => ({
  Book: MockBook,
}));

import * as bookService from "../book.service";

describe("book.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    MockBook.mockImplementation((data: any) => ({
      ...data,
      _id: mockBook._id,
      save: jest.fn().mockResolvedValue({ ...mockBook, ...data }),
    }));
  });

  describe("createBook", () => {
    it("should create a book successfully when no duplicate exists", async () => {
      mockBookModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      const result = await bookService.createBook({
        title: "Test Book",
        author: "Test Author",
        publisher: "Test Publisher",
        publishedDate: new Date("2024-01-01"),
        country: "US",
      });

      expect(mockBookModel.findOne).toHaveBeenCalledWith({ title: "Test Book", author: "Test Author" });
      expect(result.title).toBe("Test Book");
    });

    it("should throw AppError when book with same title and author already exists", async () => {
      mockBookModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockBook) });

      await expect(
        bookService.createBook({
          title: "Test Book",
          author: "Test Author",
          publisher: "Test Publisher",
          publishedDate: new Date("2024-01-01"),
          country: "US",
        })
      ).rejects.toThrow(AppError);

      await expect(
        bookService.createBook({
          title: "Test Book",
          author: "Test Author",
          publisher: "Test Publisher",
          publishedDate: new Date("2024-01-01"),
          country: "US",
        })
      ).rejects.toMatchObject({
        statusCode: 400,
        message: "[createBook] Book with the same title and author already exists",
      });
    });
  });

  describe("listBooks", () => {
    it("should return paginated list of books", async () => {
      const mockBooks = [mockBook, { ...mockBook, _id: new mongoose.Types.ObjectId() }];
      mockBookModel.countDocuments.mockResolvedValue(2);
      mockBookModel.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockBooks),
      });

      const result = await bookService.listBooks({});

      expect(result).toEqual({
        total: 2,
        page: 1,
        limit: 10,
        data: mockBooks,
      });
    });

    it("should use default page and limit when not provided", async () => {
      mockBookModel.countDocuments.mockResolvedValue(0);
      mockBookModel.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      });

      await bookService.listBooks({});

      expect(mockBookModel.find).toHaveBeenCalledWith({});
      const findCall = mockBookModel.find.mock.results[0].value;
      expect(findCall.skip).toHaveBeenCalledWith(0);
      expect(findCall.limit).toHaveBeenCalledWith(10);
    });

    it("should calculate correct skip for pagination", async () => {
      mockBookModel.countDocuments.mockResolvedValue(50);
      mockBookModel.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      });

      await bookService.listBooks({ page: "3", limit: "20" });

      const findCall = mockBookModel.find.mock.results[0].value;
      expect(findCall.skip).toHaveBeenCalledWith(40); // (3-1) * 20
      expect(findCall.limit).toHaveBeenCalledWith(20);
    });

    it("should apply query filters when parameters provided", async () => {
      mockBookModel.countDocuments.mockResolvedValue(1);
      mockBookModel.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockBook]),
      });

      await bookService.listBooks({ title: "Test", author: "Jane" });

      expect(mockBookModel.find).toHaveBeenCalledWith({
        title: { $regex: ".*Test.*", $options: "i" },
        author: { $regex: ".*Jane.*", $options: "i" },
      });
    });
  });

  describe("getBookById", () => {
    it("should return book when found", async () => {
      mockBookModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockBook) });

      const id = mockBook._id.toString();
      const result = await bookService.getBookById(id);

      expect(mockBookModel.findById).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockBook);
    });

    it("should throw AppError with 404 when book not found", async () => {
      mockBookModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      const id = new mongoose.Types.ObjectId().toString();
      await expect(bookService.getBookById(id)).rejects.toThrow(AppError);
      await expect(bookService.getBookById(id)).rejects.toMatchObject({
        statusCode: 404,
        message: "[getBookById] Book not found",
      });
    });
  });

  describe("updateBook", () => {
    it("should update book successfully", async () => {
      const updatedBook = { ...mockBook, title: "Updated Title" };
      mockBookModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
      mockBookModel.findByIdAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue(updatedBook) });

      const id = mockBook._id.toString();
      const result = await bookService.updateBook(id, { title: "Updated Title" });

      expect(mockBookModel.findByIdAndUpdate).toHaveBeenCalledWith(
        id,
        expect.objectContaining({ title: "Updated Title" }),
        { new: true }
      );
      expect(result).toEqual(updatedBook);
    });

    it("should throw AppError with 404 when book to update not found", async () => {
      mockBookModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
      mockBookModel.findByIdAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      const id = new mongoose.Types.ObjectId().toString();
      await expect(bookService.updateBook(id, { title: "Updated" })).rejects.toThrow(AppError);
      await expect(bookService.updateBook(id, { title: "Updated" })).rejects.toMatchObject({
        statusCode: 404,
        message: "[updateBook] Book not found",
      });
    });
  });

  describe("deleteBook", () => {
    it("should delete book successfully", async () => {
      mockBookModel.findByIdAndDelete.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockBook) });

      const id = mockBook._id.toString();
      await expect(bookService.deleteBook(id)).resolves.toBeUndefined();
      expect(mockBookModel.findByIdAndDelete).toHaveBeenCalledWith(id);
    });

    it("should throw AppError with 404 when book to delete not found", async () => {
      mockBookModel.findByIdAndDelete.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      const id = new mongoose.Types.ObjectId().toString();
      await expect(bookService.deleteBook(id)).rejects.toThrow(AppError);
      await expect(bookService.deleteBook(id)).rejects.toMatchObject({
        statusCode: 404,
        message: "[deleteBook] Book not found",
      });
    });
  });
});
