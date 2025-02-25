import { Response } from 'express';

// Helper code for the API consumer to understand the error and handle is accordingly

export enum ResponseStatus {
  SUCCESS = 200,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_ERROR = 500,
}

export interface ErrorApi {
  key: string;
  value: string;
}

export abstract class ApiResponse {
  constructor(
    protected status: ResponseStatus,
    protected errors?: ErrorApi[],
  ) {}

  protected prepare<T extends ApiResponse>(
    res: Response,
    response: T,
    headers: { [key: string]: string },
  ): Response {
    for (const [key, value] of Object.entries(headers)) res.append(key, value);
    return res.status(this.status).json(ApiResponse.sanitize(response));
  }

  public send(
    res: Response,
    headers: { [key: string]: string } = {},
  ): Response {
    return this.prepare<ApiResponse>(res, this, headers);
  }

  private static sanitize<T extends ApiResponse>(response: T): T {
    const clone: T = {} as T;
    Object.assign(clone, response);
    for (const i in clone) if (typeof clone[i] === 'undefined') delete clone[i];
    return clone;
  }
}

export class AuthFailureResponse extends ApiResponse {
  constructor(errors?: ErrorApi[]) {
    super(ResponseStatus.UNAUTHORIZED, errors);
  }
}

export class UnauthorizedResponse extends ApiResponse {
  constructor(errors?: ErrorApi[]) {
    super(ResponseStatus.UNAUTHORIZED, errors);
  }
}

export class NotFoundResponse extends ApiResponse {
  constructor(errors?: ErrorApi[]) {
    super(ResponseStatus.NOT_FOUND, errors);
  }

  send(res: Response, headers: { [key: string]: string } = {}): Response {
    return super.prepare<NotFoundResponse>(res, this, headers);
  }
}

export class ForbiddenResponse extends ApiResponse {
  constructor(errors?: ErrorApi[]) {
    super(ResponseStatus.FORBIDDEN, errors);
  }
}

export class BadRequestResponse extends ApiResponse {
  constructor(errors?: ErrorApi[]) {
    super(ResponseStatus.BAD_REQUEST, errors);
  }
}

export class InternalErrorResponse extends ApiResponse {
  constructor(errors?: ErrorApi[]) {
    super(ResponseStatus.INTERNAL_ERROR, errors);
  }
}

export class unknownErrorResponse extends ApiResponse {
  constructor(errors?: ErrorApi[]) {
    super(ResponseStatus.INTERNAL_ERROR, errors);
  }
}

export class SuccessMsgResponse extends ApiResponse {
  constructor(errors?: ErrorApi[]) {
    super(ResponseStatus.SUCCESS, errors);
  }
}

export class FailureMsgResponse extends ApiResponse {
  constructor(errors?: ErrorApi[]) {
    super(ResponseStatus.SUCCESS, errors);
  }
}

export class SuccessResponse<T> extends ApiResponse {
  constructor(private data: T) {
    super(ResponseStatus.SUCCESS);
  }

  send(res: Response, headers: { [key: string]: string } = {}): Response {
    return super.prepare<SuccessResponse<T>>(res, this, headers);
  }
}

export class AccessTokenErrorResponse extends ApiResponse {
  private instruction = 'refresh_token';

  constructor(errors?: ErrorApi[]) {
    super(ResponseStatus.UNAUTHORIZED, errors);
  }

  send(res: Response, headers: { [key: string]: string } = {}): Response {
    headers.instruction = this.instruction;
    return super.prepare<AccessTokenErrorResponse>(res, this, headers);
  }
  
}

export class SuccessResponseWithTotal<T> extends ApiResponse {
  constructor(
    private data: T,
    private total: number,
  ) {
    super(ResponseStatus.SUCCESS);
  }

  send(res: Response, headers: { [key: string]: string } = {}): Response {
    return super.prepare<SuccessResponseWithTotal<T>>(res, this, headers);
  }
}