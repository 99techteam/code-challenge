export class HttpException extends Error {
  public readonly statusCode: number;
  public readonly details?: string;

  constructor(statusCode: number, message: string, details?: string) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

export class BadRequestException extends HttpException {
  constructor(message: string) {
    super(400, message);
  }
}

export class NotFoundException extends HttpException {
  constructor(message: string) {
    super(404, message);
  }
}

export class InternalServerException extends HttpException {
  constructor(message: string, details?: string) {
    super(500, message, details);
  }
}
