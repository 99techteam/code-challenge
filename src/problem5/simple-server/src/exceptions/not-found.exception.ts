import { HttpStatusCode } from "../constants/status-code.constant";
import { BaseHttpException } from "./base-exception";

export class NotFoundException extends BaseHttpException {
	constructor(message = "Not Found Exception", context?: string) {
		super(message, HttpStatusCode.NotFound, context);
	}
}
