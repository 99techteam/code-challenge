import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
``;

const errorHandlerMiddleware = function (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const customError = {
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    message: err.message || "Some thing went wrong, please try again",
    reasonStatusCode: err.reasonStatusCode || "Error",
  };

  // // Duplicate Error
  if (err.code || err.code === 11000) {
    customError.message = `Dữ liệu của trường ${Object.keys(
      err.keyValue
    ).toString()} đã bị trùng`;
    customError.statusCode = StatusCodes.BAD_REQUEST;
  }

  // Enter miss name, email, password
  if (err.name === "ValidationError") {
    customError.message = err.errors;
    customError.statusCode = StatusCodes.BAD_REQUEST;
  }

  // Enter excess or missing id when we wanna getting one object
  if (err.name === "CastError") {
    customError.message = `Không tìm thấy item với Id:${err.value}`;
    customError.statusCode = StatusCodes.NOT_FOUND;
  }

  return res.status(customError.statusCode).json({
    status: customError.statusCode,
    error: customError.reasonStatusCode,
    message: customError.message,
  });
};

export default errorHandlerMiddleware;
