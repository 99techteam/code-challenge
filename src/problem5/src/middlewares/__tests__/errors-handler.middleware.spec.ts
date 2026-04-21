import { Request, Response, NextFunction } from "express";
import { notFoundHandler, errorHandler } from "../errors-handler.middleware";
import { AppError } from "../../common/error-codes";

describe("errors-handler.middleware", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  describe("notFoundHandler", () => {
    it("should return 404 with Not Found error", () => {
      notFoundHandler(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: "Not Found" });
    });
  });

  describe("errorHandler", () => {
    it("should return 500 with default error message for generic Error", () => {
      const err = new Error("Something went wrong");

      errorHandler(
        err,
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Something went wrong",
      });
    });

    it("should use statusCode from error when available", () => {
      const err = new Error("Bad Request") as Error & { statusCode: number };
      err.statusCode = 400;

      errorHandler(
        err,
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Bad Request",
      });
    });

    it("should handle AppError with statusCode", () => {
      const err = new AppError("Resource not found", 404);

      errorHandler(
        err,
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Resource not found",
      });
    });

    it("should default to 500 status and Internal Server Error message", () => {
      const err = new Error();

      errorHandler(
        err,
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Internal Server Error",
      });
    });
  });
});
