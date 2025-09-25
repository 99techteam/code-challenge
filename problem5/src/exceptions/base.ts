export class HttpExpception extends Error {
  message: string;
  errorCode: ErrorCode;
  statusCode?: number;

  constructor(message: string, errorCode: ErrorCode, statusCode?: number) {
    super(message);
    this.message = message;
    this.errorCode = errorCode;
    this.statusCode = statusCode;
  }
}

export enum ErrorCode {
  BAD_REQUEST = 400,
  INTERNAL_ERROR = 500,
  UNAUTHORIZED = 401,
  INSUFFICIENT_PERMISSION = 403,
  INVALID_OPERATION = 428,
  NOT_FOUND = 404,
}