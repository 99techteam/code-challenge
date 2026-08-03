import { randomUUID } from "node:crypto";
import type {
  ErrorRequestHandler,
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from "express";
import type { TroubleLogInput } from "../domain/observability";
import { AppError } from "../errors";
import { ObservabilityService } from "../services/observability.service";

export function requestContext(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  const incoming = request.header("x-request-id");
  const normalized = incoming?.trim();
  const requestId =
    normalized && normalized.length <= 128
      ? normalized
      : randomUUID();

  response.locals.requestId = requestId;
  response.locals.startedAt = Date.now();
  response.setHeader("x-request-id", requestId);
  next();
}

interface NormalizedError {
  statusCode: number;
  code: string;
  message: string;
  details?: unknown;
  stack?: string;
}

function addStack(
  normalized: NormalizedError,
  stack: string | undefined,
): NormalizedError {
  if (stack !== undefined) {
    normalized.stack = stack;
  }

  return normalized;
}

function normalizeError(error: unknown): NormalizedError {
  if (error instanceof SyntaxError && "body" in error) {
    return addStack(
      {
        statusCode: 400,
        code: "INVALID_JSON",
        message: "Request body contains invalid JSON",
      },
      error.stack,
    );
  }

  if (error instanceof AppError) {
    const normalized: NormalizedError = {
      statusCode: error.statusCode,
      code: error.code,
      message: error.message,
    };

    if (error.details !== undefined) {
      normalized.details = error.details;
    }

    return addStack(normalized, error.stack);
  }

  if (error instanceof Error) {
    return addStack(
      {
        statusCode: 500,
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred",
      },
      error.stack,
    );
  }

  return {
    statusCode: 500,
    code: "INTERNAL_SERVER_ERROR",
    message: "An unexpected error occurred",
  };
}

function durationFrom(response: Response): number {
  const startedAt = response.locals.startedAt;

  return typeof startedAt === "number"
    ? Math.max(0, Date.now() - startedAt)
    : 0;
}

function recordTroubleSafely(
  service: ObservabilityService,
  request: Request,
  response: Response,
  error: NormalizedError,
): void {
  try {
    const trouble: TroubleLogInput = {
      requestId:
        typeof response.locals.requestId === "string"
          ? response.locals.requestId
          : randomUUID(),
      method: request.method,
      path: request.originalUrl,
      statusCode: error.statusCode,
      errorCode: error.code,
      message: error.message,
      durationMs: durationFrom(response),
    };

    if (error.details !== undefined) {
      trouble.details = error.details;
    }

    if (error.stack !== undefined) {
      trouble.stack = error.stack;
    }

    service.recordTrouble(trouble);
  } catch (loggingError) {
    console.error("Trouble log write failed", loggingError);
  }
}

export function createNotFoundHandler(
  service: ObservabilityService,
): RequestHandler {
  return (
    request: Request,
    response: Response,
  ): void => {
    const error: NormalizedError = {
      statusCode: 404,
      code: "ROUTE_NOT_FOUND",
      message: `No route matches ${request.method} ${request.originalUrl}`,
    };

    recordTroubleSafely(
      service,
      request,
      response,
      error,
    );

    response.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
        requestId: response.locals.requestId,
      },
    });
  };
}

export function createErrorHandler(
  service: ObservabilityService,
): ErrorRequestHandler {
  return (
    error: unknown,
    request: Request,
    response: Response,
    _next: NextFunction,
  ): void => {
    const normalized = normalizeError(error);

    recordTroubleSafely(
      service,
      request,
      response,
      normalized,
    );

    if (normalized.statusCode >= 500) {
      console.error(error);
    }

    response.status(normalized.statusCode).json({
      error: {
        code: normalized.code,
        message: normalized.message,
        details: normalized.details,
        requestId: response.locals.requestId,
      },
    });
  };
}
