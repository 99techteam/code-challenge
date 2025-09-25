import { ErrorCode, HttpExpception } from "./base";

export class BadRequestException extends HttpExpception {
  constructor(message: string, errorCode: ErrorCode) {
    super(message, errorCode, 400)
  }
}