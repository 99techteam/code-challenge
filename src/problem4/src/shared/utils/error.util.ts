import { HttpStatusCode } from 'axios';

export class AppError extends Error {
	statusCode: number;

	constructor(
		message: string,
		statusCode: number = HttpStatusCode.BadRequest,
	) {
		super(message);

		this.name = Error.name;
		this.statusCode = statusCode;
	}
}
