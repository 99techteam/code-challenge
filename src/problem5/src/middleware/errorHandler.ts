import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../errors/httpError.js";

export function errorHandler(
    error: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction,
): void {
    if (error instanceof HttpError) {
        res.status(error.statusCode).json({ error: error.message });
        return;
    }

    console.error(error);
    res.status(500).json({ error: "Internal server error" });
}
