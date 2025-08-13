import { HttpStatusCode } from "../constants/status-code.constant";
import { BaseHttpException } from "./base-exception";

export class BadRequestException extends BaseHttpException {
	constructor(message = "Bad Request Exception", context?: string) {
		super(message, HttpStatusCode.BadRequest, context);
	}
}
