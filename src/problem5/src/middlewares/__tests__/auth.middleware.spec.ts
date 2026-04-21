import { Request, Response, NextFunction } from "express";
import { requiredAuth } from "../auth.middleware";
import { env } from "../../env";

jest.mock("../../env", () => ({
  env: {
    X_API_KEY: "test-api-key",
  },
}));

describe("auth.middleware", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      header: jest.fn(),
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  describe("requiredAuth", () => {
    it("should call next() when API key is valid", () => {
      (mockReq.header as jest.Mock).mockReturnValue("test-api-key");

      requiredAuth(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it("should return 401 when API key is missing", () => {
      (mockReq.header as jest.Mock).mockReturnValue(undefined);

      requiredAuth(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Unauthorized access",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return 401 when API key is invalid", () => {
      (mockReq.header as jest.Mock).mockReturnValue("wrong-api-key");

      requiredAuth(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Unauthorized access",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return 401 when API key is empty string", () => {
      (mockReq.header as jest.Mock).mockReturnValue("");

      requiredAuth(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
