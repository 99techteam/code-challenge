import { StatusCodes, ReasonPhrases } from "http-status-codes";

class CustomErrorApi extends Error {
  statusCode: number;
  reasonStatusCode: string;
  constructor(message: string) {
    super(message);
    this.statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    this.reasonStatusCode = ReasonPhrases.INTERNAL_SERVER_ERROR;
  }
}

class NotFoundError extends CustomErrorApi {
  constructor(message: string) {
    super(message);
    this.statusCode = StatusCodes.NOT_FOUND;
    this.reasonStatusCode = ReasonPhrases.NOT_FOUND;
  }
}

class BadRequestError extends CustomErrorApi {
  constructor(message: string) {
    super(message);
    this.statusCode = StatusCodes.BAD_REQUEST;
    this.reasonStatusCode = ReasonPhrases.BAD_REQUEST;
  }
}
class UnauthenticatedError extends CustomErrorApi {
  constructor(message: string) {
    super(message);
    this.statusCode = StatusCodes.UNAUTHORIZED;
    this.reasonStatusCode = ReasonPhrases.UNAUTHORIZED;
  }
}
class ForbiddenError extends CustomErrorApi {
  constructor(message: string) {
    super(message);
    this.statusCode = StatusCodes.FORBIDDEN;
    this.reasonStatusCode = ReasonPhrases.FORBIDDEN;
  }
}
class UnavailableError extends CustomErrorApi {
  constructor(message: string) {
    super(message);
    this.statusCode = StatusCodes.SERVICE_UNAVAILABLE;
    this.reasonStatusCode = ReasonPhrases.SERVICE_UNAVAILABLE;
  }
}

export {
  NotFoundError,
  CustomErrorApi,
  ForbiddenError,
  BadRequestError,
  UnavailableError,
  UnauthenticatedError,
};
