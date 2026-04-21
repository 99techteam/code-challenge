interface ErrorCode {
  status: number;
  message: string;
}

export const ErrorCodes: Record<string, ErrorCode> = {
  UNAUTHORIZED: {
    status: 401,
    message: "Unauthorized access",
  },
  NOT_FOUND: {
    status: 404,
    message: "Resource not found",
  },
  VALIDATION_ERROR: {
    status: 400,
    message: "Validation failed",
  },
  INTERNAL_SERVER_ERROR: {
    status: 500,
    message: "Internal server error",
  },
};

export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    console.log(this)
  }
}
