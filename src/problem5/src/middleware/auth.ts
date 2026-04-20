import type { NextFunction, Request, Response } from "express";

import { env } from "../config/env.js";

export function requireAuth(request: Request, response: Response, next: NextFunction) {
  const authorization = request.header("Authorization");
  const expectedToken = process.env.AUTH_TOKEN ?? env.authToken;

  if (!authorization?.startsWith("Bearer ")) {
    response.status(401).json({
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Missing Bearer token."
      }
    });
    return;
  }

  const token = authorization.slice("Bearer ".length);

  if (token !== expectedToken) {
    response.status(401).json({
      success: false,
      error: {
        code: "INVALID_TOKEN",
        message: "Auth token is invalid."
      }
    });
    return;
  }

  request.authToken = token;
  next();
}
