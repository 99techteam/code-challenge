import { StatusCodes, ReasonPhrases } from "http-status-codes";
import { Response } from "express";

interface ITypeCustomSuccessApi {
  message: string;
  statusCode?: number;
  reasonStatusCode?: string;
  metadata: any;
  option?: any;
}

class CustomSuccessApi {
  message: string;
  statusCode: number;
  reasonStatusCode: string;
  metadata: any;
  option?: any;

  constructor({
    message,
    statusCode,
    reasonStatusCode,
    metadata,
    option,
  }: ITypeCustomSuccessApi) {
    this.message = message;
    this.statusCode = statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
    this.reasonStatusCode =
      reasonStatusCode || ReasonPhrases.INTERNAL_SERVER_ERROR;
    this.metadata = metadata;
    this.option = option;
  }

  public send(res: Response) {
    res.status(this.statusCode).json(this);
  }
}

class OK extends CustomSuccessApi {
  constructor({
    message,
    statusCode = StatusCodes.OK,
    reasonStatusCode = ReasonPhrases.OK,
    metadata,
  }: ITypeCustomSuccessApi) {
    super({ message, statusCode, reasonStatusCode, metadata });
  }
}

class CREATED extends CustomSuccessApi {
  constructor({
    message,
    statusCode = StatusCodes.CREATED,
    reasonStatusCode = ReasonPhrases.CREATED,
    metadata,
  }: ITypeCustomSuccessApi) {
    super({ message, statusCode, reasonStatusCode, metadata });
  }
}

export { OK, CREATED, CustomSuccessApi };
