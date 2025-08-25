import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { env } from '@shared/configs';
import { HttpStatusCode } from 'axios';
import { AppError } from '../utils/error.util';
import { AuthPayload } from '@/modules/auth/auth.interface';

const { secret } = env.jwt;

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (isUnAuthenticatePath(req.path)) {
    return next();
  }

  const token = req.cookies?.access_token;
  if (!token) {
    throw new AppError('unauthorized', HttpStatusCode.Unauthorized);
  }
  try {
    try {
      const decodedToken = jwt.verify(token, secret) as AuthPayload;
      res.locals.user = decodedToken;
      next();
    } catch (error) {
      throw new AppError(String(error));
    }
  } catch (error) {
    next(error);
  }
};

const isUnAuthenticatePath = (path: string): boolean => {
  const authRoutePrefixes = ['/auth/login'];
  const isPathInvalidForAuth = authRoutePrefixes.some((prefix) =>
    path.startsWith(prefix)
  );

  return isPathInvalidForAuth;
};
