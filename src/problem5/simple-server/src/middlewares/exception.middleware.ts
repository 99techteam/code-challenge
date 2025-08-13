import type { NextFunction, Request, Response } from "express";
import { HttpStatusCode } from "../constants/status-code.constant";
import { BaseHttpException } from "../exceptions/base-exception";

export function exceptionHandler(
	err: Error,
	_req: Request,
	res: Response,
	_next: NextFunction,
) {
	if (err instanceof BaseHttpException) {
		return res.status(err.code).json({
			message: err.message,
			code: err.code,
			context: err.context,
		});
	}
	res.status(HttpStatusCode.InternalServerError).send("Internal Server Error");
}
