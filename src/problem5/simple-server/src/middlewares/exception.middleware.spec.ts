// import type { NextFunction, Request, Response } from "express";
// import { HttpStatusCode } from "../constants/status-code.constant";
// import { BaseHttpException } from "../exceptions/base-exception";
//
// export function exceptionHandler(
// 	err: Error,
// 	_req: Request,
// 	res: Response,
// 	_next: NextFunction,
// ) {
// 	if (err instanceof BaseHttpException) {
// 		return res.status(err.code).json({
// 			message: err.message,
// 			code: err.code,
// 			context: err.context,
// 		});
// 	}
// 	res.status(HttpStatusCode.InternalServerError).send("Internal Server Error");
// }

import type { Request, Response } from "express";
import { exceptionHandler } from "./exception.middleware";
import { NotFoundException } from "../exceptions/not-found.exception";
import { HttpStatusCode } from "../constants/status-code.constant";

describe("exceptionHandler", () => {
  it("should return a response with the correct status code and error message", () => {
    const err = new Error("Test error");
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      send: vi.fn(),
    } as unknown as Response;
    const next = vi.fn();
    exceptionHandler(err, {} as Request, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it("should return a response with defined http exception", () => {
    const errMsg = "Test error";
    const err = new NotFoundException(errMsg);
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      send: vi.fn(),
    } as unknown as Response;
    const next = vi.fn();
    exceptionHandler(err, {} as Request, res, next);
    expect(res.status).toHaveBeenCalledWith(HttpStatusCode.NotFound);
    expect(res.json).toHaveBeenCalledWith({
      message: errMsg,
      code: HttpStatusCode.NotFound,
      context: err.context,
    });
  });
});
