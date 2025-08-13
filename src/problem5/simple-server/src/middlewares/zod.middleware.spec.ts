/** biome-ignore-all lint/suspicious/noExplicitAny: middleware, types are dynamic */
// import type { NextFunction, Request, Response } from "express";
// import { z } from "zod";
// import { HttpStatusCode } from "../constants/status-code.constant";
//
// export type ValidateSource = "body" | "params" | "query";
//
// export function validateData(
// 	schema: z.ZodObject<any, any>,
// 	source: ValidateSource,
// ) {
// 	return async (req: Request, res: Response, next: NextFunction) => {
// 		try {
// 			await schema.parseAsync(req[source]);
// 			next();
// 		} catch (error) {
// 			if (error instanceof z.ZodError) {
// 				return res.status(HttpStatusCode.BadRequest).json({
// 					message: `Invalid ${source} schema`,
// 					//@ts-ignore
// 					errors: JSON.parse(error),
// 					code: HttpStatusCode.BadRequest,
// 				});
// 			} else {
// 				next(error);
// 			}
// 		}
// 	};
// }

import { ZodError } from "zod";
import { HttpStatusCode } from "../constants/status-code.constant";
import { validateData } from "./zod.middleware";

describe("validateData", () => {
  it("should calls parseAsync", async () => {
    const schema = {
      parseAsync: vi.fn().mockResolvedValue({}),
    };
    const source = "body";
    const req = {
      body: {},
    };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const next = vi.fn();
    await validateData(schema as any, source)(req as any, res as any, next);
    expect(schema.parseAsync).toHaveBeenCalledWith(req.body);
    expect(next).toHaveBeenCalled();
  });

  it("should throws BadRequestException", async () => {
    const schema = {
      parseAsync: vi.fn().mockRejectedValue(new ZodError([])),
    };
    const source = "body";
    const req = {
      body: {},
    };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const next = vi.fn();
    await validateData(schema as any, source)(req as any, res as any, next);
    expect(res.status).toHaveBeenCalledWith(HttpStatusCode.BadRequest);
    expect(res.json).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });
});
