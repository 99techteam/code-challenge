import { NextFunction, Request, Response } from 'express';

function formatResponse(req: Request, res: Response, next: NextFunction) {
	const data = res.locals.data;
	const message = res.locals.message;
	const statusCode = res.statusCode;

	if (data || message) {
		return res.json({
			data,
			message,
			statusCode,
		});
	}

	next();
}

export default formatResponse;
