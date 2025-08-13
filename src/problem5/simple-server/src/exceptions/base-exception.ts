import type { HttpStatusCode } from "../constants/status-code.constant";

export class BaseHttpException extends Error {
	constructor(
		public message: string,
		public code: HttpStatusCode,
		public context?: string,
	) {
		super(message);
	}
}
