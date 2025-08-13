/** biome-ignore-all lint/suspicious/noExplicitAny: middleware, types are dynamic */
import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { HttpStatusCode } from "../constants/status-code.constant";

export type ValidateSource = "body" | "params" | "query";

export function validateData(
	schema: z.ZodObject<any, any>,
	source: ValidateSource,
) {
	return async (req: Request, res: Response, next: NextFunction) => {
		try {
			await schema.parseAsync(req[source]);
			next();
		} catch (error) {
			if (error instanceof z.ZodError) {
				return res.status(HttpStatusCode.BadRequest).json({
					message: `Invalid ${source} schema`,
					//@ts-ignore
					errors: JSON.parse(error),
					code: HttpStatusCode.BadRequest,
				});
			} else {
				next(error);
			}
		}
	};
}
