import { NextFunction, Request, Response } from "express";
import { ErrorCodes } from "../common/error-codes";
import { env } from "../env";

export const requiredAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const apiKey = req.header("x-api-key");

  if (apiKey !== env.X_API_KEY) {
    console.debug("[Auth] Invalid API key");

    return res
      .status(ErrorCodes.UNAUTHORIZED.status)
      .json({ error: ErrorCodes.UNAUTHORIZED.message });
  }

  next();
};
